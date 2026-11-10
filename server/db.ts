import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS, syncOriginalAssetsToPublic } from './seed-data.ts';

dotenv.config();

const ROOT_DIR = process.cwd();
const DB_REL_PATH = process.env.DATABASE_PATH || './data/rangerosh.sqlite';
const DB_FULL_PATH = path.resolve(ROOT_DIR, DB_REL_PATH);

fs.mkdirSync(path.dirname(DB_FULL_PATH), { recursive: true });

export const db = new DatabaseSync(DB_FULL_PATH);

// Enable WAL mode and foreign keys for concurrency & relational integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export const STANDARD_SIZES = ['Small', 'Medium', 'Large', 'Extra Large'] as const;

export function distributeStockAcrossSizes(totalStock: number): Record<string, number> {
  const safeTotal = Math.max(0, Math.floor(Number(totalStock) || 0));
  const base = Math.floor(safeTotal / STANDARD_SIZES.length);
  const remainder = safeTotal % STANDARD_SIZES.length;
  const result: Record<string, number> = {};
  STANDARD_SIZES.forEach((size, idx) => {
    result[size] = base + (idx < remainder ? 1 : 0);
  });
  return result;
}

export function parseSizeStock(
  rawJson: string | null | undefined,
  fallbackTotal: number
): Record<string, number> {
  if (rawJson && typeof rawJson === 'string' && rawJson.trim()) {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed === 'object') {
        const result: Record<string, number> = {};
        let hasValid = false;
        for (const size of STANDARD_SIZES) {
          const val = Number(parsed[size]);
          if (!isNaN(val) && val >= 0) {
            result[size] = Math.floor(val);
            hasValid = true;
          } else {
            result[size] = 0;
          }
        }
        if (hasValid) return result;
      }
    } catch {
      // fall through
    }
  }
  return distributeStockAcrossSizes(fallbackTotal);
}

export function initializeDatabase(): void {
  const schemaPath = path.resolve(ROOT_DIR, 'supabase', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);

  // Safe migration: ensure inventory table has size_stock_json column
  const invCols = db.prepare(`PRAGMA table_info(inventory)`).all() as Array<{ name: string }>;
  const hasSizeStockCol = invCols.some((c) => c.name === 'size_stock_json');
  if (!hasSizeStockCol) {
    db.exec(`ALTER TABLE inventory ADD COLUMN size_stock_json TEXT NOT NULL DEFAULT '';`);
  }

  // Sync original logo and product images/videos to public/assets non-destructively
  const assetMap = syncOriginalAssetsToPublic(ROOT_DIR);

  // 1. Seed default Admin User if none exists
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (adminCount.count === 0) {
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'rangerosh.official@gmail.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'RangeRosh@Admin2026';
    const passwordHash = bcrypt.hashSync(adminPassword, 10);

    db.prepare(
      `INSERT INTO admin_users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`
    ).run(adminEmail, passwordHash, 'Rang e Rosh Administrator', 'super_admin');
  }

  // 2. Seed Store Settings if none exists
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM store_settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare(
      `INSERT INTO store_settings (
        id, store_name, store_tagline, logo_url, contact_email, contact_phone,
        whatsapp_number, shipping_charges, free_shipping_threshold, low_stock_threshold,
        currency, announcement_text, hero_badge, hero_title, hero_subtitle,
        promo_banner_title, promo_banner_subtitle,
        instagram_url, youtube_url, tiktok_url, facebook_url, payment_methods_json
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PKR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`
    ).run(
      process.env.STORE_NAME || 'Rang e Rosh',
      process.env.STORE_TAGLINE || 'Ladies Stitched Suits — Pret Collection',
      '/assets/logo/website-logo.jpg',
      process.env.STORE_EMAIL || 'rangerosh.official@gmail.com',
      process.env.STORE_CONTACT_PHONE || '+923 130 888 048',
      process.env.STORE_SHIPPING_WHATSAPP || '+923 200 300 552',
      Number(process.env.DEFAULT_SHIPPING_CHARGE || 250),
      Number(process.env.FREE_SHIPPING_THRESHOLD || 15000),
      Number(process.env.DEFAULT_LOW_STOCK_THRESHOLD || 5),
      'Complimentary Nationwide Shipping on Orders Above PKR 15,000  •  Direct WhatsApp Concierge Order Confirmation',
      'RANG E ROSH  •  LUXURY PRET COLLECTION',
      'Artisanal Embroidery & Timeless Stitched Elegance',
      'Discover our signature 2-piece stitched ensembles, meticulously tailored with intricate threadwork, refined fabrics, and effortless modern silhouettes.',
      'Crafted for Poise & Everyday Luxury',
      'Every Rang e Rosh ensemble features high-density precision tailoring, reinforced embroidery facings, and breathable seasonal weaves.',
      'https://www.instagram.com/rangerosh/',
      'https://www.youtube.com/@rangerosh',
      'https://www.tiktok.com/@rangerosh',
      'https://www.facebook.com/RangeRosh/',
      JSON.stringify(['Cash on Delivery (COD)', 'Bank Transfer (Confirm via WhatsApp)'])
    );
  }

  // 3. Seed the 6 Initial Products if products table is empty
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        slug, sku, name, collection_name, category, regular_price, discounted_price,
        overview, product_type_detail, color_name, fabric, fit,
        embroidered_details, suit_stitching, outfit_architecture, wash_care, color_disclaimer,
        video_url, is_featured, is_new_arrival, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertImage = db.prepare(`
      INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertVariant = db.prepare(`
      INSERT INTO product_variants (product_id, size_label, color_label, sku_suffix, additional_price, is_available)
      VALUES (?, ?, ?, ?, 0, 1)
    `);

    const insertInventory = db.prepare(`
      INSERT INTO inventory (product_id, sku, available_stock, reserved_stock, sold_quantity, low_stock_threshold)
      VALUES (?, ?, ?, 0, 0, ?)
    `);

    const insertInvTx = db.prepare(`
      INSERT INTO inventory_transactions (
        product_id, order_id, change_type, quantity_delta,
        previous_available, new_available, previous_reserved, new_reserved, note, performed_by
      ) VALUES (?, NULL, 'initial_seed', ?, 0, ?, 0, 0, ?, 'System Seed')
    `);

    db.exec('BEGIN');
    try {
      for (const item of INITIAL_PRODUCTS) {
        const assets = assetMap.get(item.slug) || { images: [], videoUrl: null };
        const res = insertProduct.run(
          item.slug,
          item.sku,
          item.name,
          item.collection_name,
          item.category,
          item.regular_price,
          item.discounted_price,
          item.overview,
          item.product_type_detail,
          item.color_name,
          item.fabric,
          item.fit,
          item.embroidered_details,
          item.suit_stitching,
          item.outfit_architecture,
          item.wash_care,
          item.color_disclaimer,
          assets.videoUrl,
          item.is_featured,
          item.is_new_arrival
        );

        const productId = Number(res.lastInsertRowid);

        assets.images.forEach((imgUrl, idx) => {
          insertImage.run(
            productId,
            imgUrl,
            `${item.name} – ${item.collection_name} (${item.color_name}) View ${idx + 1}`,
            idx,
            idx === 0 ? 1 : 0
          );
        });

        for (const v of item.variants) {
          insertVariant.run(productId, v.size_label, v.color_label, v.sku_suffix);
        }

        insertInventory.run(productId, item.sku, item.initial_stock, item.low_stock_threshold);
        insertInvTx.run(
          productId,
          item.initial_stock,
          item.initial_stock,
          `Initial inventory import for ${item.name} (${item.sku})`
        );
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  // 4. Ensure every product has the 4 standard sizes (Small, Medium, Large, Extra Large) and valid size_stock_json
  const allProducts = db.prepare('SELECT id, color_name FROM products').all() as Array<{
    id: number;
    color_name: string;
  }>;

  for (const prod of allProducts) {
    const invRow = db
      .prepare('SELECT available_stock, size_stock_json FROM inventory WHERE product_id = ?')
      .get(prod.id) as { available_stock: number; size_stock_json: string } | undefined;

    if (invRow) {
      const sizeStock = parseSizeStock(invRow.size_stock_json, invRow.available_stock);
      const totalFromSizes = Object.values(sizeStock).reduce((sum, n) => sum + n, 0);
      const nextJson = JSON.stringify(sizeStock);
      if (invRow.size_stock_json !== nextJson || invRow.available_stock !== totalFromSizes) {
        db.prepare(
          `UPDATE inventory SET available_stock = ?, size_stock_json = ? WHERE product_id = ?`
        ).run(totalFromSizes, nextJson, prod.id);
      }
    }

    const existingVariants = db
      .prepare('SELECT size_label FROM product_variants WHERE product_id = ?')
      .all(prod.id) as Array<{ size_label: string }>;

    const hasAllStandardSizes = STANDARD_SIZES.every((sz) =>
      existingVariants.some((v) => v.size_label === sz)
    );

    if (!hasAllStandardSizes) {
      db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(prod.id);
      const insertVar = db.prepare(
        `INSERT INTO product_variants (product_id, size_label, color_label, sku_suffix, additional_price, is_available)
         VALUES (?, ?, ?, ?, 0, 1)`
      );
      for (const sz of STANDARD_SIZES) {
        const suffix =
          sz === 'Small'
            ? 'S'
            : sz === 'Medium'
              ? 'M'
              : sz === 'Large'
                ? 'L'
                : 'XL';
        insertVar.run(prod.id, sz, prod.color_name || '', suffix);
      }
    }
  }
}

export function computeStockStatus(available: number, threshold: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (available <= 0) return 'Out of Stock';
  if (available <= threshold) return 'Low Stock';
  return 'In Stock';
}
