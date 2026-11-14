import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import dotenv from 'dotenv';
import {
  db,
  initializeDatabase,
  computeStockStatus,
  STANDARD_SIZES,
  parseSizeStock,
  distributeStockAcrossSizes,
} from './db.ts';
import {
  buildCustomerOrderWhatsAppMessage,
  buildAdminToCustomerWhatsAppMessage,
  createWhatsAppUrl,
  normalizeWhatsAppNumber,
  tryAutoSendWhatsAppToClient,
} from './whatsapp.ts';

dotenv.config();

// Initialize DB & sync original assets on startup
initializeDatabase();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || 'rang-e-rosh-super-secret-jwt-key-change-in-production-2026';
const ROOT_DIR = process.cwd();

app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Serve public static assets (including /assets and /uploads)
app.use('/assets', express.static(path.join(ROOT_DIR, 'public', 'assets')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for image & video uploads (any video type & any video length)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase()
      .slice(0, 40);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: Infinity },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('image/') ||
      /\.(jpg|jpeg|png|webp|gif|svg|avif|mp4|webm|mov|m4v|avi|mkv|wmv|flv|3gp|ogg|ogv|mpeg|mpg|ts|m2ts)$/i.test(
        file.originalname
      )
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

// Helper to enrich product rows with images, variants, and inventory
function enrichProduct(prodRow: any) {
  const images = db
    .prepare(
      `SELECT id, image_url, alt_text, sort_order, is_primary
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order ASC, id ASC`
    )
    .all(prodRow.id) as any[];

  const variants = db
    .prepare(
      `SELECT id, size_label, color_label, sku_suffix, additional_price, is_available
       FROM product_variants
       WHERE product_id = ?
       ORDER BY id ASC`
    )
    .all(prodRow.id) as any[];

  const inv = db
    .prepare(
      `SELECT available_stock, size_stock_json, reserved_stock, sold_quantity, low_stock_threshold, updated_at
       FROM inventory
       WHERE product_id = ?`
    )
    .get(prodRow.id) as any;

  const rawAvail = inv ? Number(inv.available_stock) : 0;
  const sizeStock = parseSizeStock(inv?.size_stock_json, rawAvail);
  const availableStock = Object.values(sizeStock).reduce((sum, n) => sum + n, 0);
  const reservedStock = inv ? Number(inv.reserved_stock) : 0;
  const soldQuantity = inv ? Number(inv.sold_quantity) : 0;
  const lowStockThreshold = inv ? Number(inv.low_stock_threshold) : 5;
  const stockStatus = computeStockStatus(availableStock, lowStockThreshold);

  const effectivePrice =
    prodRow.discounted_price !== null &&
    prodRow.discounted_price !== undefined &&
    Number(prodRow.discounted_price) > 0 &&
    Number(prodRow.discounted_price) < Number(prodRow.regular_price)
      ? Number(prodRow.discounted_price)
      : Number(prodRow.regular_price);

  // Always include the 4 standard stitched sizes: Small, Medium, Large, Extra Large
  const sizes = [...STANDARD_SIZES];
  const colors = Array.from(
    new Set(
      variants
        .filter((v) => v.is_available && v.color_label && v.color_label.trim())
        .map((v) => v.color_label.trim())
    )
  );
  if (colors.length === 0 && prodRow.color_name) {
    colors.push(prodRow.color_name);
  }

  return {
    ...prodRow,
    regular_price: Number(prodRow.regular_price),
    discounted_price:
      prodRow.discounted_price !== null && prodRow.discounted_price !== undefined
        ? Number(prodRow.discounted_price)
        : null,
    effective_price: effectivePrice,
    is_featured: Boolean(prodRow.is_featured),
    is_new_arrival: Boolean(prodRow.is_new_arrival),
    is_published: Boolean(prodRow.is_published),
    primary_image: images[0]?.image_url || '/assets/logo/website-logo.jpg',
    secondary_image: images[1]?.image_url || images[0]?.image_url || '/assets/logo/website-logo.jpg',
    images,
    variants,
    sizes,
    colors,
    inventory: {
      available_stock: availableStock,
      size_stock: sizeStock,
      reserved_stock: reservedStock,
      sold_quantity: soldQuantity,
      low_stock_threshold: lowStockThreshold,
      stock_status: stockStatus,
      updated_at: inv?.updated_at || prodRow.updated_at,
    },
  };
}

function getStoreSettings() {
  const row = db.prepare('SELECT * FROM store_settings WHERE id = 1').get() as any;
  let paymentMethods: string[] = ['Cash on Delivery (COD)', 'Bank Transfer (Confirm via WhatsApp)'];
  if (row?.payment_methods_json) {
    try {
      paymentMethods = JSON.parse(row.payment_methods_json);
    } catch {
      // keep default
    }
  }
  return {
    ...row,
    shipping_charges: Number(row?.shipping_charges ?? 250),
    free_shipping_threshold: Number(row?.free_shipping_threshold ?? 15000),
    low_stock_threshold: Number(row?.low_stock_threshold ?? 5),
    payment_methods: paymentMethods,
    whatsapp_clean: normalizeWhatsAppNumber(row?.whatsapp_number || '+923 200 300 552'),
  };
}

// ============================================================================
// ADMIN AUTH MIDDLEWARE
// ============================================================================
interface AuthenticatedRequest extends Request {
  admin?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in as Administrator.' });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      name: string;
      role: string;
    };
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired admin session. Please sign in again.' });
  }
}

// ============================================================================
// PUBLIC STOREFRONT ENDPOINTS
// ============================================================================

app.get('/api/storefront/init', (_req: Request, res: Response) => {
  try {
    const settings = getStoreSettings();
    const rawProducts = db
      .prepare('SELECT * FROM products WHERE is_published = 1 ORDER BY id ASC')
      .all() as any[];
    const products = rawProducts.map(enrichProduct);
    const categories = Array.from(new Set(products.map((p) => p.category)));

    res.json({
      settings,
      products,
      categories,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load storefront data' });
  }
});

app.get('/api/products', (req: Request, res: Response) => {
  try {
    const { category, search, sort, availability } = req.query;
    const rawProducts = db
      .prepare('SELECT * FROM products WHERE is_published = 1 ORDER BY id ASC')
      .all() as any[];
    let products = rawProducts.map(enrichProduct);

    if (category && typeof category === 'string' && category !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (availability && typeof availability === 'string') {
      if (availability === 'in_stock') {
        products = products.filter((p) => p.inventory.available_stock > 0);
      } else if (availability === 'out_of_stock') {
        products = products.filter((p) => p.inventory.available_stock <= 0);
      }
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.color_name.toLowerCase().includes(q) ||
          p.overview.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sort && typeof sort === 'string') {
      if (sort === 'price_asc') {
        products.sort((a, b) => a.effective_price - b.effective_price);
      } else if (sort === 'price_desc') {
        products.sort((a, b) => b.effective_price - a.effective_price);
      } else if (sort === 'name_asc') {
        products.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'newest') {
        products.sort((a, b) => b.id - a.id);
      }
    }

    res.json({ products });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
});

app.get('/api/products/:slugOrId', (req: Request, res: Response) => {
  try {
    const { slugOrId } = req.params;
    const isNumeric = /^\d+$/.test(slugOrId);
    const prodRow = isNumeric
      ? db.prepare('SELECT * FROM products WHERE id = ? AND is_published = 1').get(Number(slugOrId))
      : db.prepare('SELECT * FROM products WHERE slug = ? AND is_published = 1').get(slugOrId);

    if (!prodRow) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = enrichProduct(prodRow);
    const relatedRaw = db
      .prepare('SELECT * FROM products WHERE is_published = 1 AND id != ? ORDER BY id ASC LIMIT 4')
      .all(product.id) as any[];
    const relatedProducts = relatedRaw.map(enrichProduct);

    res.json({ product, relatedProducts });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch product details' });
  }
});

// Create Customer Order + Server-Side Stock Validation + WhatsApp Message Generation
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      city,
      order_notes,
      payment_method,
      items,
    } = req.body;

    // Input validation
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      res.status(400).json({ error: 'Customer full name is required.' });
      return;
    }
    if (!customer_phone || typeof customer_phone !== 'string' || customer_phone.replace(/\D/g, '').length < 10) {
      res.status(400).json({ error: 'A valid WhatsApp / mobile phone number is required.' });
      return;
    }
    if (!shipping_address || typeof shipping_address !== 'string' || !shipping_address.trim()) {
      res.status(400).json({ error: 'Complete shipping address is required.' });
      return;
    }
    if (!city || typeof city !== 'string' || !city.trim()) {
      res.status(400).json({ error: 'City is required.' });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Your cart is empty. Please add at least one item.' });
      return;
    }

    const settings = getStoreSettings();

    // Consolidate quantities by product_id to prevent bypassing stock limits via multiple variant rows
    const qtyByProduct = new Map<number, number>();
    for (const item of items) {
      const pid = Number(item.product_id);
      const q = Number(item.quantity);
      if (!pid || !Number.isInteger(q) || q <= 0) {
        res.status(400).json({ error: 'Invalid product quantity in order.' });
        return;
      }
      qtyByProduct.set(pid, (qtyByProduct.get(pid) || 0) + q);
    }

    db.exec('BEGIN IMMEDIATE');
    try {
      // 1. Validate availability against current server-side stock (both total & per-size)
      const productMap = new Map<number, any>();
      for (const [pid, requestedQty] of qtyByProduct.entries()) {
        const prodRow = db
          .prepare('SELECT * FROM products WHERE id = ? AND is_published = 1')
          .get(pid) as any;
        if (!prodRow) {
          throw new Error(`One of the selected products is no longer available.`);
        }
        const enriched = enrichProduct(prodRow);
        if (enriched.inventory.available_stock <= 0) {
          throw new Error(`"${enriched.name}" is currently Out of Stock.`);
        }
        if (requestedQty > enriched.inventory.available_stock) {
          throw new Error(
            `Insufficient stock for "${enriched.name}". Only ${enriched.inventory.available_stock} unit(s) available.`
          );
        }
        productMap.set(pid, enriched);
      }

      // Validate per-size availability
      const qtyByProductAndSize = new Map<string, { pid: number; size: string; qty: number }>();
      for (const item of items) {
        const pid = Number(item.product_id);
        const q = Number(item.quantity);
        const product = productMap.get(pid)!;
        const selSize = (item.selected_size || 'Medium').toString().trim();
        const key = `${pid}::${selSize}`;
        const existing = qtyByProductAndSize.get(key);
        qtyByProductAndSize.set(key, {
          pid,
          size: selSize,
          qty: (existing?.qty || 0) + q,
        });
      }

      for (const { pid, size, qty } of qtyByProductAndSize.values()) {
        const product = productMap.get(pid)!;
        const sizeStockMap = product.inventory?.size_stock || {};
        if (size in sizeStockMap) {
          const availForSize = Number(sizeStockMap[size] ?? 0);
          if (availForSize <= 0) {
            throw new Error(`"${product.name}" in size "${size}" is currently Out of Stock.`);
          }
          if (qty > availForSize) {
            throw new Error(
              `Insufficient stock for "${product.name}" (${size}). Only ${availForSize} unit(s) available in ${size}.`
            );
          }
        }
      }

      // 2. Calculate pricing server-side
      let subtotal = 0;
      const resolvedItems: Array<{
        product_id: number;
        product_name: string;
        product_sku: string;
        product_image: string;
        selected_size: string;
        selected_color: string;
        unit_price: number;
        quantity: number;
        line_total: number;
      }> = [];

      for (const item of items) {
        const pid = Number(item.product_id);
        const qty = Number(item.quantity);
        const product = productMap.get(pid)!;
        const unitPrice = product.effective_price;
        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;

        resolvedItems.push({
          product_id: pid,
          product_name: product.name,
          product_sku: product.sku,
          product_image: product.primary_image,
          selected_size: (item.selected_size || product.fit || '').toString().trim(),
          selected_color: (item.selected_color || product.color_name || '').toString().trim(),
          unit_price: unitPrice,
          quantity: qty,
          line_total: lineTotal,
        });
      }

      const shippingCharges =
        settings.free_shipping_threshold > 0 && subtotal >= settings.free_shipping_threshold
          ? 0
          : settings.shipping_charges;
      const totalAmount = subtotal + shippingCharges;

      // 3. Upsert or create Customer record
      const cleanName = customer_name.trim();
      const cleanPhone = customer_phone.trim();
      const cleanEmail = (customer_email || '').trim();
      const cleanAddress = shipping_address.trim();
      const cleanCity = city.trim();
      const cleanNotes = (order_notes || '').trim();
      const cleanPayment = (payment_method || 'Cash on Delivery (COD)').trim();

      const existingCustomer = db
        .prepare('SELECT id, total_orders, total_spent FROM customers WHERE phone = ?')
        .get(cleanPhone) as any;

      let customerId: number;
      if (existingCustomer) {
        customerId = Number(existingCustomer.id);
        db.prepare(
          `UPDATE customers
           SET full_name = ?, email = ?, address = ?, city = ?,
               total_orders = total_orders + 1,
               total_spent = total_spent + ?,
               updated_at = datetime('now')
           WHERE id = ?`
        ).run(cleanName, cleanEmail, cleanAddress, cleanCity, totalAmount, customerId);
      } else {
        const custRes = db
          .prepare(
            `INSERT INTO customers (full_name, phone, email, address, city, total_orders, total_spent)
             VALUES (?, ?, ?, ?, ?, 1, ?)`
          )
          .run(cleanName, cleanPhone, cleanEmail, cleanAddress, cleanCity, totalAmount);
        customerId = Number(custRes.lastInsertRowid);
      }

      // 4. Generate unique human-readable Order ID (e.g. RER-261107-1001)
      const orderCountRow = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
      const seqNum = 1001 + Number(orderCountRow.count);
      const orderNumber = `RER-${seqNum}`;

      // 5. Build Store -> Client WhatsApp Confirmation message (from your WhatsApp to Client WhatsApp)
      const orderPayloadForWhatsApp = {
        order_number: orderNumber,
        customer_name: cleanName,
        customer_phone: cleanPhone,
        customer_email: cleanEmail,
        shipping_address: cleanAddress,
        city: cleanCity,
        order_notes: cleanNotes,
        payment_method: cleanPayment,
        subtotal,
        shipping_charges: shippingCharges,
        total_amount: totalAmount,
        status: 'Pending',
        items: resolvedItems,
      };

      const clientConfirmationMessage = buildAdminToCustomerWhatsAppMessage(
        orderPayloadForWhatsApp,
        settings.store_name,
        settings.contact_phone
      );

      const customerToStoreMessage = buildCustomerOrderWhatsAppMessage(
        orderPayloadForWhatsApp,
        settings.store_name
      );

      // 6. Insert Order row with status = 'Pending', stock_deducted = 0, stock_reserved = 1
      const orderRes = db
        .prepare(
          `INSERT INTO orders (
            order_number, customer_id, customer_name, customer_phone, customer_email,
            shipping_address, city, order_notes, payment_method,
            subtotal, shipping_charges, total_amount, status,
            stock_deducted, stock_reserved, whatsapp_message
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 0, 1, ?)`
        )
        .run(
          orderNumber,
          customerId,
          cleanName,
          cleanPhone,
          cleanEmail,
          cleanAddress,
          cleanCity,
          cleanNotes,
          cleanPayment,
          subtotal,
          shippingCharges,
          totalAmount,
          clientConfirmationMessage
        );

      const orderId = Number(orderRes.lastInsertRowid);

      // 7. Insert Order Items
      const insertOrderItem = db.prepare(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_sku, product_image,
          selected_size, selected_color, unit_price, quantity, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      for (const rItem of resolvedItems) {
        insertOrderItem.run(
          orderId,
          rItem.product_id,
          rItem.product_name,
          rItem.product_sku,
          rItem.product_image,
          rItem.selected_size,
          rItem.selected_color,
          rItem.unit_price,
          rItem.quantity,
          rItem.line_total
        );
      }

      // 8. Reserve inventory for Pending order (note: per prompt requirement,
      // "Only confirmed orders should deduct available inventory, using safe database transactions.
      // Cancelled orders must release any reserved inventory.")
      for (const [pid, requestedQty] of qtyByProduct.entries()) {
        const invRow = db
          .prepare('SELECT available_stock, reserved_stock FROM inventory WHERE product_id = ?')
          .get(pid) as { available_stock: number; reserved_stock: number };

        const prevAvail = Number(invRow.available_stock);
        const prevRes = Number(invRow.reserved_stock);
        const newRes = prevRes + requestedQty;

        db.prepare(
          `UPDATE inventory SET reserved_stock = ?, updated_at = datetime('now') WHERE product_id = ?`
        ).run(newRes, pid);

        db.prepare(
          `INSERT INTO inventory_transactions (
            product_id, order_id, change_type, quantity_delta,
            previous_available, new_available, previous_reserved, new_reserved, note, performed_by
          ) VALUES (?, ?, 'order_reserved', ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          pid,
          orderId,
          requestedQty,
          prevAvail,
          prevAvail,
          prevRes,
          newRes,
          `Reserved ${requestedQty} unit(s) for Pending Order #${orderNumber}`,
          cleanName
        );
      }

      db.exec('COMMIT');

      // Direct WhatsApp URL from Store Owner's WhatsApp -> Client's WhatsApp (`cleanPhone`)
      const clientWhatsappUrl = createWhatsAppUrl(cleanPhone, clientConfirmationMessage);
      // Secondary URL from Client -> Store WhatsApp (`settings.whatsapp_number`)
      const storeWhatsappUrl = createWhatsAppUrl(settings.whatsapp_number, customerToStoreMessage);

      // Also trigger optional background API dispatch if Meta Cloud API / UltraMsg is configured
      tryAutoSendWhatsAppToClient(cleanPhone, clientConfirmationMessage).catch(() => {});

      res.status(201).json({
        order: {
          id: orderId,
          order_number: orderNumber,
          customer_name: cleanName,
          customer_phone: cleanPhone,
          customer_email: cleanEmail,
          shipping_address: cleanAddress,
          city: cleanCity,
          order_notes: cleanNotes,
          payment_method: cleanPayment,
          subtotal,
          shipping_charges: shippingCharges,
          total_amount: totalAmount,
          status: 'Pending',
          items: resolvedItems,
          whatsapp_message: clientConfirmationMessage,
          whatsapp_url: clientWhatsappUrl,
          customer_whatsapp_message: clientConfirmationMessage,
          customer_whatsapp_url: clientWhatsappUrl,
          store_whatsapp_message: customerToStoreMessage,
          store_whatsapp_url: storeWhatsappUrl,
          store_whatsapp: settings.whatsapp_number,
        },
      });
    } catch (txErr: any) {
      db.exec('ROLLBACK');
      res.status(400).json({ error: txErr.message || 'Unable to process order.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error creating order' });
  }
});

// Lookup order by order_number for Order Confirmation screen
app.get('/api/orders/lookup/:orderNumber', (req: Request, res: Response) => {
  try {
    const orderRow = db
      .prepare('SELECT * FROM orders WHERE order_number = ?')
      .get(req.params.orderNumber) as any;

    if (!orderRow) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const items = db
      .prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC')
      .all(orderRow.id) as any[];

    const settings = getStoreSettings();
    const orderPayload = {
      ...orderRow,
      subtotal: Number(orderRow.subtotal),
      shipping_charges: Number(orderRow.shipping_charges),
      total_amount: Number(orderRow.total_amount),
      items,
    };

    const clientConfirmationMessage = buildAdminToCustomerWhatsAppMessage(
      orderPayload,
      settings.store_name,
      settings.contact_phone
    );
    const clientWhatsappUrl = createWhatsAppUrl(orderRow.customer_phone, clientConfirmationMessage);
    const customerToStoreMessage = buildCustomerOrderWhatsAppMessage(
      orderPayload,
      settings.store_name
    );
    const storeWhatsappUrl = createWhatsAppUrl(settings.whatsapp_number, customerToStoreMessage);

    res.json({
      order: {
        ...orderPayload,
        whatsapp_message: clientConfirmationMessage,
        whatsapp_url: clientWhatsappUrl,
        customer_whatsapp_message: clientConfirmationMessage,
        customer_whatsapp_url: clientWhatsappUrl,
        store_whatsapp_message: customerToStoreMessage,
        store_whatsapp_url: storeWhatsappUrl,
        store_whatsapp: settings.whatsapp_number,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to lookup order' });
  }
});

// Newsletter subscription
app.post('/api/newsletter', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    db.prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)').run(cleanEmail);
    res.json({ message: 'Thank you for subscribing to the Rang e Rosh newsletter.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to subscribe' });
  }
});

// ============================================================================
// ADMIN AUTHENTICATION ENDPOINTS
// ============================================================================

app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const adminRow = db
      .prepare('SELECT * FROM admin_users WHERE lower(email) = ?')
      .get(cleanEmail) as any;

    if (!adminRow || !bcrypt.compareSync(String(password), adminRow.password_hash)) {
      res.status(401).json({ error: 'Invalid admin email or password.' });
      return;
    }

    db.prepare("UPDATE admin_users SET last_login_at = datetime('now') WHERE id = ?").run(adminRow.id);

    const payload = {
      id: Number(adminRow.id),
      email: adminRow.email,
      name: adminRow.name,
      role: adminRow.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      admin: payload,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/admin/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({ admin: req.admin });
});

// ============================================================================
// ADMIN DASHBOARD & ANALYTICS
// ============================================================================

app.get('/api/admin/dashboard', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const range = (req.query.range as string) || 'all';
    let dateFilterSql = '';
    if (range === '7d') {
      dateFilterSql = "AND created_at >= datetime('now', '-7 days')";
    } else if (range === '30d') {
      dateFilterSql = "AND created_at >= datetime('now', '-30 days')";
    } else if (range === '90d') {
      dateFilterSql = "AND created_at >= datetime('now', '-90 days')";
    }

    const rawProducts = db.prepare('SELECT * FROM products ORDER BY id ASC').all() as any[];
    const products = rawProducts.map(enrichProduct);

    const totalProducts = products.length;
    const lowStockProducts = products.filter((p) => p.inventory.stock_status === 'Low Stock');
    const outOfStockProducts = products.filter((p) => p.inventory.stock_status === 'Out of Stock');

    const totalOrdersRow = db
      .prepare(`SELECT COUNT(*) as count FROM orders WHERE 1=1 ${dateFilterSql}`)
      .get() as { count: number };
    const pendingOrdersRow = db
      .prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'Pending' ${dateFilterSql}`)
      .get() as { count: number };
    const confirmedOrdersRow = db
      .prepare(
        `SELECT COUNT(*) as count FROM orders WHERE status IN ('Confirmed', 'Processing', 'Shipped', 'Delivered') ${dateFilterSql}`
      )
      .get() as { count: number };
    const cancelledOrdersRow = db
      .prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'Cancelled' ${dateFilterSql}`)
      .get() as { count: number };

    // Total Sales from Confirmed/Processing/Shipped/Delivered orders
    const salesRow = db
      .prepare(
        `SELECT COALESCE(SUM(total_amount), 0) as total_sales
         FROM orders
         WHERE status IN ('Confirmed', 'Processing', 'Shipped', 'Delivered') ${dateFilterSql}`
      )
      .get() as { total_sales: number };

    const pendingValueRow = db
      .prepare(
        `SELECT COALESCE(SUM(total_amount), 0) as pending_sales
         FROM orders
         WHERE status = 'Pending' ${dateFilterSql}`
      )
      .get() as { pending_sales: number };

    // Daily orders & revenue breakdown for analytics chart
    const dailyAnalytics = db
      .prepare(
        `SELECT substr(created_at, 1, 10) as date,
                COUNT(*) as order_count,
                COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END), 0) as revenue
         FROM orders
         WHERE 1=1 ${dateFilterSql}
         GROUP BY substr(created_at, 1, 10)
         ORDER BY date ASC
         LIMIT 30`
      )
      .all() as any[];

    // Recent orders
    const recentOrdersRaw = db
      .prepare(`SELECT * FROM orders ORDER BY id DESC LIMIT 8`)
      .all() as any[];
    const recentOrders = recentOrdersRaw.map((o) => {
      const items = db
        .prepare('SELECT * FROM order_items WHERE order_id = ?')
        .all(o.id) as any[];
      return {
        ...o,
        subtotal: Number(o.subtotal),
        shipping_charges: Number(o.shipping_charges),
        total_amount: Number(o.total_amount),
        items,
      };
    });

    // Top products by sold quantity
    const topSellingProducts = [...products]
      .sort((a, b) => b.inventory.sold_quantity - a.inventory.sold_quantity)
      .slice(0, 6);

    res.json({
      summary: {
        total_products: totalProducts,
        total_orders: Number(totalOrdersRow.count),
        pending_orders: Number(pendingOrdersRow.count),
        confirmed_orders: Number(confirmedOrdersRow.count),
        cancelled_orders: Number(cancelledOrdersRow.count),
        total_sales: Number(salesRow.total_sales),
        pending_sales: Number(pendingValueRow.pending_sales),
        low_stock_count: lowStockProducts.length,
        out_of_stock_count: outOfStockProducts.length,
      },
      low_stock_products: lowStockProducts,
      out_of_stock_products: outOfStockProducts,
      top_selling_products: topSellingProducts,
      daily_analytics: dailyAnalytics,
      recent_orders: recentOrders,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load dashboard overview' });
  }
});

// ============================================================================
// ADMIN PRODUCT MANAGEMENT ENDPOINTS
// ============================================================================

app.get('/api/admin/products', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rawProducts = db.prepare('SELECT * FROM products ORDER BY id ASC').all() as any[];
    res.json({ products: rawProducts.map(enrichProduct) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load products' });
  }
});

app.post(
  '/api/admin/upload',
  requireAdmin,
  upload.array('files', 15),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const uploadedUrls = files.map((f) => `/uploads/${f.filename}`);
      res.json({ urls: uploadedUrls });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Upload failed' });
    }
  }
);

app.post('/api/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      sku,
      collection_name = 'Rang e Rosh Pret Collection',
      category = '2-Piece Stitched Suit',
      regular_price,
      discounted_price,
      overview = '',
      product_type_detail = '2-Piece Stitched Suit (Shirt + Trouser)',
      color_name = '',
      fabric = '',
      fit = 'Relaxed / Straight Fit',
      embroidered_details = '',
      suit_stitching = '',
      outfit_architecture = '',
      wash_care = '',
      color_disclaimer = '',
      video_url = null,
      is_featured = true,
      is_new_arrival = true,
      is_published = true,
      available_stock = 12,
      low_stock_threshold = 5,
      images = [],
      sizes = [...STANDARD_SIZES],
      colors = [],
      size_stock,
    } = req.body;

    if (!name || !String(name).trim()) {
      res.status(400).json({ error: 'Product name is required.' });
      return;
    }
    if (!sku || !String(sku).trim()) {
      res.status(400).json({ error: 'Unique Product SKU is required.' });
      return;
    }
    const regPrice = Number(regular_price);
    if (isNaN(regPrice) || regPrice <= 0) {
      res.status(400).json({ error: 'Regular price must be greater than 0.' });
      return;
    }

    const cleanSku = String(sku).trim().toUpperCase();
    const existingSku = db.prepare('SELECT id FROM products WHERE upper(sku) = ?').get(cleanSku);
    if (existingSku) {
      res.status(400).json({ error: `A product with SKU "${cleanSku}" already exists.` });
      return;
    }

    let baseSlug = String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!baseSlug) baseSlug = `product-${Date.now()}`;
    let finalSlug = baseSlug;
    let counter = 2;
    while (db.prepare('SELECT id FROM products WHERE slug = ?').get(finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const discPrice =
      discounted_price !== null && discounted_price !== undefined && discounted_price !== ''
        ? Number(discounted_price)
        : null;

    db.exec('BEGIN IMMEDIATE');
    try {
      const prodRes = db
        .prepare(
          `INSERT INTO products (
            slug, sku, name, collection_name, category, regular_price, discounted_price,
            overview, product_type_detail, color_name, fabric, fit,
            embroidered_details, suit_stitching, outfit_architecture, wash_care, color_disclaimer,
            video_url, is_featured, is_new_arrival, is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          finalSlug,
          cleanSku,
          String(name).trim(),
          String(collection_name).trim(),
          String(category).trim(),
          regPrice,
          discPrice,
          String(overview).trim(),
          String(product_type_detail).trim(),
          String(color_name).trim(),
          String(fabric).trim(),
          String(fit).trim(),
          String(embroidered_details).trim(),
          String(suit_stitching).trim(),
          String(outfit_architecture).trim(),
          String(wash_care).trim(),
          String(color_disclaimer).trim(),
          video_url ? String(video_url).trim() : null,
          is_featured ? 1 : 0,
          is_new_arrival ? 1 : 0,
          is_published ? 1 : 0
        );

      const productId = Number(prodRes.lastInsertRowid);

      // Insert images
      const imgList: string[] = Array.isArray(images) ? images.filter(Boolean) : [];
      const insertImg = db.prepare(
        `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
         VALUES (?, ?, ?, ?, ?)`
      );
      imgList.forEach((url, idx) => {
        insertImg.run(productId, url, `${name} View ${idx + 1}`, idx, idx === 0 ? 1 : 0);
      });

      // Insert variants from sizes & colors
      const sizeList: string[] =
        Array.isArray(sizes) && sizes.length > 0
          ? sizes.map((s) => String(s).trim()).filter(Boolean)
          : [...STANDARD_SIZES];
      const colorList: string[] = Array.isArray(colors)
        ? colors.map((c) => String(c).trim()).filter(Boolean)
        : [String(color_name).trim()].filter(Boolean);

      const insertVariant = db.prepare(
        `INSERT INTO product_variants (product_id, size_label, color_label, sku_suffix, additional_price, is_available)
         VALUES (?, ?, ?, ?, 0, 1)`
      );

      for (const s of sizeList) {
        const cLabel = colorList[0] || String(color_name).trim() || '';
        const suffix = s === 'Extra Large' ? 'XL' : s.slice(0, 1).toUpperCase();
        insertVariant.run(productId, s, cLabel, suffix);
      }

      // Insert inventory with per-size breakdown
      const rawInitStock = Math.max(0, Number(available_stock) || 0);
      const initialSizeStock: Record<string, number> =
        size_stock && typeof size_stock === 'object'
          ? {
              Small: Math.max(0, Math.floor(Number(size_stock.Small) || 0)),
              Medium: Math.max(0, Math.floor(Number(size_stock.Medium) || 0)),
              Large: Math.max(0, Math.floor(Number(size_stock.Large) || 0)),
              'Extra Large': Math.max(0, Math.floor(Number(size_stock['Extra Large']) || 0)),
            }
          : distributeStockAcrossSizes(rawInitStock);

      const initStock = Object.values(initialSizeStock).reduce((sum, n) => sum + n, 0);
      const lowThreshold = Math.max(1, Number(low_stock_threshold) || 5);

      db.prepare(
        `INSERT INTO inventory (product_id, sku, available_stock, reserved_stock, sold_quantity, low_stock_threshold, size_stock_json)
         VALUES (?, ?, ?, 0, 0, ?, ?)`
      ).run(productId, cleanSku, initStock, lowThreshold, JSON.stringify(initialSizeStock));

      db.prepare(
        `INSERT INTO inventory_transactions (
          product_id, order_id, change_type, quantity_delta,
          previous_available, new_available, previous_reserved, new_reserved, note, performed_by
        ) VALUES (?, NULL, 'initial_seed', ?, 0, ?, 0, 0, ?, ?)`
      ).run(
        productId,
        initStock,
        initStock,
        `Product created with initial stock of ${initStock}`,
        req.admin?.name || 'Admin'
      );

      db.exec('COMMIT');

      const createdRow = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      res.status(201).json({ product: enrichProduct(createdRow) });
    } catch (txErr: any) {
      db.exec('ROLLBACK');
      res.status(400).json({ error: txErr.message || 'Failed to create product' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error creating product' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const existingProd = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
    if (!existingProd) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const {
      name = existingProd.name,
      sku = existingProd.sku,
      collection_name = existingProd.collection_name,
      category = existingProd.category,
      regular_price = existingProd.regular_price,
      discounted_price = existingProd.discounted_price,
      overview = existingProd.overview,
      product_type_detail = existingProd.product_type_detail,
      color_name = existingProd.color_name,
      fabric = existingProd.fabric,
      fit = existingProd.fit,
      embroidered_details = existingProd.embroidered_details,
      suit_stitching = existingProd.suit_stitching,
      outfit_architecture = existingProd.outfit_architecture,
      wash_care = existingProd.wash_care,
      color_disclaimer = existingProd.color_disclaimer,
      video_url = existingProd.video_url,
      is_featured = Boolean(existingProd.is_featured),
      is_new_arrival = Boolean(existingProd.is_new_arrival),
      is_published = Boolean(existingProd.is_published),
      images,
      sizes,
      colors,
      available_stock,
      low_stock_threshold,
      size_stock,
    } = req.body;

    const cleanSku = String(sku).trim().toUpperCase();
    const dupSku = db
      .prepare('SELECT id FROM products WHERE upper(sku) = ? AND id != ?')
      .get(cleanSku, productId);
    if (dupSku) {
      res.status(400).json({ error: `Another product already uses SKU "${cleanSku}".` });
      return;
    }

    const regPrice = Number(regular_price);
    const discPrice =
      discounted_price !== null && discounted_price !== undefined && discounted_price !== ''
        ? Number(discounted_price)
        : null;

    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(
        `UPDATE products SET
          sku = ?, name = ?, collection_name = ?, category = ?,
          regular_price = ?, discounted_price = ?, overview = ?,
          product_type_detail = ?, color_name = ?, fabric = ?, fit = ?,
          embroidered_details = ?, suit_stitching = ?, outfit_architecture = ?,
          wash_care = ?, color_disclaimer = ?, video_url = ?,
          is_featured = ?, is_new_arrival = ?, is_published = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        cleanSku,
        String(name).trim(),
        String(collection_name).trim(),
        String(category).trim(),
        regPrice,
        discPrice,
        String(overview).trim(),
        String(product_type_detail).trim(),
        String(color_name).trim(),
        String(fabric).trim(),
        String(fit).trim(),
        String(embroidered_details).trim(),
        String(suit_stitching).trim(),
        String(outfit_architecture).trim(),
        String(wash_care).trim(),
        String(color_disclaimer).trim(),
        video_url ? String(video_url).trim() : null,
        is_featured ? 1 : 0,
        is_new_arrival ? 1 : 0,
        is_published ? 1 : 0,
        productId
      );

      if (Array.isArray(images)) {
        db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
        const insertImg = db.prepare(
          `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
           VALUES (?, ?, ?, ?, ?)`
        );
        images.filter(Boolean).forEach((url: string, idx: number) => {
          insertImg.run(productId, url, `${name} View ${idx + 1}`, idx, idx === 0 ? 1 : 0);
        });
      }

      if (Array.isArray(sizes) || Array.isArray(colors)) {
        db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(productId);
        const sizeList: string[] = Array.isArray(sizes)
          ? sizes.map((s) => String(s).trim()).filter(Boolean)
          : [];
        const colorList: string[] = Array.isArray(colors)
          ? colors.map((c) => String(c).trim()).filter(Boolean)
          : [String(color_name).trim()].filter(Boolean);

        const insertVariant = db.prepare(
          `INSERT INTO product_variants (product_id, size_label, color_label, sku_suffix, additional_price, is_available)
           VALUES (?, ?, ?, ?, 0, 1)`
        );

        if (sizeList.length > 0 && colorList.length > 0) {
          for (const s of sizeList) {
            for (const c of colorList) {
              insertVariant.run(productId, s, c, s.slice(0, 3).toUpperCase());
            }
          }
        } else if (sizeList.length > 0) {
          for (const s of sizeList) {
            insertVariant.run(productId, s, String(color_name).trim(), s.slice(0, 3).toUpperCase());
          }
        } else {
          for (const c of colorList) {
            insertVariant.run(productId, String(fit).trim(), c, '');
          }
        }
      }

      // Update inventory SKU and optional stock fields (including per-size stock)
      const invRow = db
        .prepare('SELECT * FROM inventory WHERE product_id = ?')
        .get(productId) as any;

      if (invRow) {
        const prevAvail = Number(invRow.available_stock);
        let updatedSizeStock = parseSizeStock(invRow.size_stock_json, prevAvail);

        if (size_stock && typeof size_stock === 'object') {
          for (const s of STANDARD_SIZES) {
            if (size_stock[s] !== undefined) {
              updatedSizeStock[s] = Math.max(0, Math.floor(Number(size_stock[s]) || 0));
            }
          }
        } else if (available_stock !== undefined) {
          const targetTotal = Math.max(0, Math.floor(Number(available_stock) || 0));
          if (targetTotal !== prevAvail) {
            updatedSizeStock = distributeStockAcrossSizes(targetTotal);
          }
        }

        const newAvail = Object.values(updatedSizeStock).reduce((sum, n) => sum + n, 0);
        const newThreshold =
          low_stock_threshold !== undefined
            ? Math.max(1, Number(low_stock_threshold))
            : Number(invRow.low_stock_threshold);

        db.prepare(
          `UPDATE inventory
           SET sku = ?, available_stock = ?, low_stock_threshold = ?, size_stock_json = ?, updated_at = datetime('now')
           WHERE product_id = ?`
        ).run(cleanSku, newAvail, newThreshold, JSON.stringify(updatedSizeStock), productId);

        if (newAvail !== prevAvail) {
          db.prepare(
            `INSERT INTO inventory_transactions (
              product_id, order_id, change_type, quantity_delta,
              previous_available, new_available, previous_reserved, new_reserved, note, performed_by
            ) VALUES (?, NULL, 'manual_adjustment', ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            productId,
            newAvail - prevAvail,
            prevAvail,
            newAvail,
            Number(invRow.reserved_stock),
            Number(invRow.reserved_stock),
            `Stock updated via Product Editor (S:${updatedSizeStock.Small}, M:${updatedSizeStock.Medium}, L:${updatedSizeStock.Large}, XL:${updatedSizeStock['Extra Large']})`,
            req.admin?.name || 'Admin'
          );
        }
      }

      db.exec('COMMIT');

      const updatedRow = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      res.json({ product: enrichProduct(updatedRow) });
    } catch (txErr: any) {
      db.exec('ROLLBACK');
      res.status(400).json({ error: txErr.message || 'Failed to update product' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error updating product' });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const existing = db.prepare('SELECT id, name FROM products WHERE id = ?').get(productId) as any;
    if (!existing) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    db.prepare('DELETE FROM products WHERE id = ?').run(productId);
    res.json({ message: `Product "${existing.name}" deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

// ============================================================================
// ADMIN STOCK & INVENTORY MANAGEMENT ENDPOINTS
// ============================================================================

app.get('/api/admin/inventory', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const rawProducts = db.prepare('SELECT * FROM products ORDER BY id ASC').all() as any[];
    const products = rawProducts.map(enrichProduct);

    const transactions = db
      .prepare(
        `SELECT it.*, p.name as product_name, p.sku as product_sku, o.order_number
         FROM inventory_transactions it
         LEFT JOIN products p ON p.id = it.product_id
         LEFT JOIN orders o ON o.id = it.order_id
         ORDER BY it.id DESC
         LIMIT 100`
      )
      .all() as any[];

    res.json({
      products,
      transactions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load inventory data' });
  }
});

app.post(
  '/api/admin/inventory/:productId/adjust',
  requireAdmin,
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const productId = Number(req.params.productId);
      const { mode, quantity, low_stock_threshold, note, size, size_stock } = req.body;
      // mode: 'set' | 'increase' | 'decrease'
      // size?: 'Small' | 'Medium' | 'Large' | 'Extra Large'

      const invRow = db
        .prepare('SELECT * FROM inventory WHERE product_id = ?')
        .get(productId) as any;
      if (!invRow) {
        res.status(404).json({ error: 'Inventory record not found for this product.' });
        return;
      }

      const prevRes = Number(invRow.reserved_stock);
      const currentSizeStock = parseSizeStock(invRow.size_stock_json, Number(invRow.available_stock));
      const prevAvail = Object.values(currentSizeStock).reduce((sum, n) => sum + n, 0);
      const qtyVal = Number(quantity);

      let updatedSizeStock: Record<string, number> = { ...currentSizeStock };
      let adjustmentTargetLabel = 'All Sizes';

      if (size_stock && typeof size_stock === 'object') {
        for (const s of STANDARD_SIZES) {
          if (size_stock[s] !== undefined) {
            const v = Number(size_stock[s]);
            if (isNaN(v) || v < 0) {
              res.status(400).json({ error: `Stock quantity for ${s} cannot be negative.` });
              return;
            }
            updatedSizeStock[s] = Math.floor(v);
          }
        }
        adjustmentTargetLabel = 'Per-Size Map';
      } else if (size && STANDARD_SIZES.includes(size)) {
        adjustmentTargetLabel = `Size: ${size}`;
        const prevSizeQty = Number(updatedSizeStock[size] ?? 0);
        let newSizeQty = prevSizeQty;

        if (mode === 'set') {
          if (isNaN(qtyVal) || qtyVal < 0) {
            res.status(400).json({ error: `Stock quantity for ${size} cannot be negative.` });
            return;
          }
          newSizeQty = Math.floor(qtyVal);
        } else if (mode === 'increase') {
          if (isNaN(qtyVal) || qtyVal <= 0) {
            res.status(400).json({ error: 'Increase amount must be greater than 0.' });
            return;
          }
          newSizeQty = prevSizeQty + Math.floor(qtyVal);
        } else if (mode === 'decrease') {
          if (isNaN(qtyVal) || qtyVal <= 0) {
            res.status(400).json({ error: 'Decrease amount must be greater than 0.' });
            return;
          }
          if (prevSizeQty - Math.floor(qtyVal) < 0) {
            res.status(400).json({ error: `Cannot decrease ${size} stock below 0.` });
            return;
          }
          newSizeQty = prevSizeQty - Math.floor(qtyVal);
        }
        updatedSizeStock[size] = newSizeQty;
      } else {
        let targetTotal = prevAvail;
        if (mode === 'set') {
          if (isNaN(qtyVal) || qtyVal < 0) {
            res.status(400).json({ error: 'Stock quantity cannot be negative.' });
            return;
          }
          targetTotal = Math.floor(qtyVal);
        } else if (mode === 'increase') {
          if (isNaN(qtyVal) || qtyVal <= 0) {
            res.status(400).json({ error: 'Increase amount must be greater than 0.' });
            return;
          }
          targetTotal = prevAvail + Math.floor(qtyVal);
        } else if (mode === 'decrease') {
          if (isNaN(qtyVal) || qtyVal <= 0) {
            res.status(400).json({ error: 'Decrease amount must be greater than 0.' });
            return;
          }
          if (prevAvail - Math.floor(qtyVal) < 0) {
            res.status(400).json({ error: 'Cannot decrease available stock below 0.' });
            return;
          }
          targetTotal = prevAvail - Math.floor(qtyVal);
        }
        updatedSizeStock = distributeStockAcrossSizes(targetTotal);
      }

      const newAvail = Object.values(updatedSizeStock).reduce((sum, n) => sum + n, 0);

      const newThreshold =
        low_stock_threshold !== undefined
          ? Math.max(1, Number(low_stock_threshold))
          : Number(invRow.low_stock_threshold);

      const delta = newAvail - prevAvail;

      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare(
          `UPDATE inventory
           SET available_stock = ?, low_stock_threshold = ?, size_stock_json = ?, updated_at = datetime('now')
           WHERE product_id = ?`
        ).run(newAvail, newThreshold, JSON.stringify(updatedSizeStock), productId);

        const defaultNote =
          size && STANDARD_SIZES.includes(size)
            ? `Adjusted ${size} stock (${mode} by ${qtyVal}) → ${size}: ${updatedSizeStock[size]} units`
            : `Manual stock adjustment (${mode} — ${adjustmentTargetLabel})`;

        db.prepare(
          `INSERT INTO inventory_transactions (
            product_id, order_id, change_type, quantity_delta,
            previous_available, new_available, previous_reserved, new_reserved, note, performed_by
          ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          productId,
          delta > 0 ? 'restock' : 'manual_adjustment',
          delta,
          prevAvail,
          newAvail,
          prevRes,
          prevRes,
          note ? String(note).trim() : defaultNote,
          req.admin?.name || 'Admin'
        );

        db.exec('COMMIT');
      } catch (txErr: any) {
        db.exec('ROLLBACK');
        throw txErr;
      }

      const prodRow = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
      res.json({ product: enrichProduct(prodRow) });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to adjust inventory' });
    }
  }
);

// ============================================================================
// ADMIN ORDER MANAGEMENT & WHATSAPP CONFIRMATION WORKFLOW
// ============================================================================

app.get('/api/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, search, date_from, date_to } = req.query;
    let rawOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all() as any[];

    if (status && typeof status === 'string' && status !== 'All') {
      rawOrders = rawOrders.filter((o) => o.status === status);
    }

    if (date_from && typeof date_from === 'string') {
      rawOrders = rawOrders.filter((o) => o.created_at.slice(0, 10) >= date_from);
    }

    if (date_to && typeof date_to === 'string') {
      rawOrders = rawOrders.filter((o) => o.created_at.slice(0, 10) <= date_to);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      rawOrders = rawOrders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q)
      );
    }

    const settings = getStoreSettings();

    const orders = rawOrders.map((o) => {
      const items = db
        .prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC')
        .all(o.id) as any[];

      const orderObj = {
        ...o,
        subtotal: Number(o.subtotal),
        shipping_charges: Number(o.shipping_charges),
        total_amount: Number(o.total_amount),
        stock_deducted: Boolean(o.stock_deducted),
        stock_reserved: Boolean(o.stock_reserved),
        items,
      };

      const adminToCustomerMsg = buildAdminToCustomerWhatsAppMessage(
        orderObj,
        settings.store_name,
        settings.contact_phone
      );
      const customerWhatsappUrl = createWhatsAppUrl(o.customer_phone, adminToCustomerMsg);

      return {
        ...orderObj,
        customer_whatsapp_message: adminToCustomerMsg,
        customer_whatsapp_url: customerWhatsappUrl,
      };
    });

    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load orders' });
  }
});

// Update Order Status with Atomic Inventory Deduction / Release
app.patch('/api/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid order status.' });
      return;
    }

    const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!orderRow) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const orderItems = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(orderId) as any[];

    const isConfirming = ['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(status);
    const isCancelling = status === 'Cancelled';

    db.exec('BEGIN IMMEDIATE');
    try {
      let stockDeducted = Number(orderRow.stock_deducted);
      let stockReserved = Number(orderRow.stock_reserved);

      // CASE 1: Confirming an order that hasn't deducted available_stock yet
      if (isConfirming && stockDeducted === 0) {
        // Group quantities by product_id
        const qtyByProd = new Map<number, number>();
        for (const item of orderItems) {
          if (item.product_id) {
            qtyByProd.set(
              Number(item.product_id),
              (qtyByProd.get(Number(item.product_id)) || 0) + Number(item.quantity)
            );
          }
        }

        // Validate and deduct available stock
        for (const [pid, qty] of qtyByProd.entries()) {
          const inv = db
            .prepare('SELECT * FROM inventory WHERE product_id = ?')
            .get(pid) as any;
          if (!inv) continue;

          const prevAvail = Number(inv.available_stock);
          const prevRes = Number(inv.reserved_stock);
          const prevSold = Number(inv.sold_quantity);

          if (prevAvail < qty) {
            const pRow = db.prepare('SELECT name FROM products WHERE id = ?').get(pid) as any;
            throw new Error(
              `Cannot confirm order: Insufficient stock for "${pRow?.name || 'Product'}". Available: ${prevAvail}, Required: ${qty}.`
            );
          }

          const sizeStock = parseSizeStock(inv.size_stock_json, prevAvail);
          const prodOrderItems = orderItems.filter((oi) => Number(oi.product_id) === pid);
          for (const oi of prodOrderItems) {
            const itemSize = String(oi.selected_size || '').trim();
            const itemQty = Number(oi.quantity) || 0;
            if (STANDARD_SIZES.includes(itemSize)) {
              sizeStock[itemSize] = Math.max(0, (sizeStock[itemSize] ?? 0) - itemQty);
            } else {
              // Fallback: deduct from largest available size bucket
              let rem = itemQty;
              for (const s of STANDARD_SIZES) {
                if (rem <= 0) break;
                const take = Math.min(rem, sizeStock[s] || 0);
                sizeStock[s] = (sizeStock[s] || 0) - take;
                rem -= take;
              }
            }
          }

          const newAvail = Object.values(sizeStock).reduce((sum, n) => sum + n, 0);
          const newRes = stockReserved === 1 ? Math.max(0, prevRes - qty) : prevRes;
          const newSold = prevSold + qty;

          db.prepare(
            `UPDATE inventory
             SET available_stock = ?, reserved_stock = ?, sold_quantity = ?, size_stock_json = ?, updated_at = datetime('now')
             WHERE product_id = ?`
          ).run(newAvail, newRes, newSold, JSON.stringify(sizeStock), pid);

          db.prepare(
            `INSERT INTO inventory_transactions (
              product_id, order_id, change_type, quantity_delta,
              previous_available, new_available, previous_reserved, new_reserved, note, performed_by
            ) VALUES (?, ?, 'order_confirmed', ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            pid,
            orderId,
            -qty,
            prevAvail,
            newAvail,
            prevRes,
            newRes,
            `Order #${orderRow.order_number} confirmed (${status}) — deducted ${qty} unit(s)`,
            req.admin?.name || 'Admin'
          );
        }

        stockDeducted = 1;
        stockReserved = 0;
      }

      // CASE 2: Cancelling an order
      if (isCancelling) {
        const qtyByProd = new Map<number, number>();
        for (const item of orderItems) {
          if (item.product_id) {
            qtyByProd.set(
              Number(item.product_id),
              (qtyByProd.get(Number(item.product_id)) || 0) + Number(item.quantity)
            );
          }
        }

        for (const [pid, qty] of qtyByProd.entries()) {
          const inv = db
            .prepare('SELECT * FROM inventory WHERE product_id = ?')
            .get(pid) as any;
          if (!inv) continue;

          const prevAvail = Number(inv.available_stock);
          const prevRes = Number(inv.reserved_stock);
          const prevSold = Number(inv.sold_quantity);

          if (stockDeducted === 1) {
            // Order was previously confirmed; restore available stock & decrement sold_quantity
            const sizeStock = parseSizeStock(inv.size_stock_json, prevAvail);
            const prodOrderItems = orderItems.filter((oi) => Number(oi.product_id) === pid);
            for (const oi of prodOrderItems) {
              const itemSize = String(oi.selected_size || '').trim();
              const itemQty = Number(oi.quantity) || 0;
              if (STANDARD_SIZES.includes(itemSize)) {
                sizeStock[itemSize] = (sizeStock[itemSize] ?? 0) + itemQty;
              } else {
                sizeStock['Medium'] = (sizeStock['Medium'] ?? 0) + itemQty;
              }
            }
            const newAvail = Object.values(sizeStock).reduce((sum, n) => sum + n, 0);
            const newSold = Math.max(0, prevSold - qty);

            db.prepare(
              `UPDATE inventory
               SET available_stock = ?, sold_quantity = ?, size_stock_json = ?, updated_at = datetime('now')
               WHERE product_id = ?`
            ).run(newAvail, newSold, JSON.stringify(sizeStock), pid);

            db.prepare(
              `INSERT INTO inventory_transactions (
                product_id, order_id, change_type, quantity_delta,
                previous_available, new_available, previous_reserved, new_reserved, note, performed_by
              ) VALUES (?, ?, 'order_cancelled', ?, ?, ?, ?, ?, ?, ?)`
            ).run(
              pid,
              orderId,
              qty,
              prevAvail,
              newAvail,
              prevRes,
              prevRes,
              `Order #${orderRow.order_number} cancelled — restored ${qty} unit(s) to available stock`,
              req.admin?.name || 'Admin'
            );
          } else if (stockReserved === 1) {
            // Order was Pending (reserved); release reserved stock
            const newRes = Math.max(0, prevRes - qty);

            db.prepare(
              `UPDATE inventory
               SET reserved_stock = ?, updated_at = datetime('now')
               WHERE product_id = ?`
            ).run(newRes, pid);

            db.prepare(
              `INSERT INTO inventory_transactions (
                product_id, order_id, change_type, quantity_delta,
                previous_available, new_available, previous_reserved, new_reserved, note, performed_by
              ) VALUES (?, ?, 'order_cancelled', 0, ?, ?, ?, ?, ?, ?)`
            ).run(
              pid,
              orderId,
              prevAvail,
              prevAvail,
              prevRes,
              newRes,
              `Pending Order #${orderRow.order_number} cancelled — released ${qty} reserved unit(s)`,
              req.admin?.name || 'Admin'
            );
          }
        }

        stockDeducted = 0;
        stockReserved = 0;
      }

      db.prepare(
        `UPDATE orders
         SET status = ?, stock_deducted = ?, stock_reserved = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(status, stockDeducted, stockReserved, orderId);

      db.exec('COMMIT');

      const updatedOrderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
      const settings = getStoreSettings();
      const orderObj = {
        ...updatedOrderRow,
        subtotal: Number(updatedOrderRow.subtotal),
        shipping_charges: Number(updatedOrderRow.shipping_charges),
        total_amount: Number(updatedOrderRow.total_amount),
        stock_deducted: Boolean(updatedOrderRow.stock_deducted),
        stock_reserved: Boolean(updatedOrderRow.stock_reserved),
        items: orderItems,
      };

      const adminToCustomerMsg = buildAdminToCustomerWhatsAppMessage(
        orderObj,
        settings.store_name,
        settings.contact_phone
      );
      const customerWhatsappUrl = createWhatsAppUrl(
        updatedOrderRow.customer_phone,
        adminToCustomerMsg
      );

      tryAutoSendWhatsAppToClient(updatedOrderRow.customer_phone, adminToCustomerMsg).catch(
        () => {}
      );

      res.json({
        order: {
          ...orderObj,
          customer_whatsapp_message: adminToCustomerMsg,
          customer_whatsapp_url: customerWhatsappUrl,
        },
      });
    } catch (txErr: any) {
      db.exec('ROLLBACK');
      res.status(400).json({ error: txErr.message || 'Failed to update order status' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error updating order status' });
  }
});

// ============================================================================
// ADMIN STORE SETTINGS
// ============================================================================

app.get('/api/admin/settings', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ settings: getStoreSettings() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load settings' });
  }
});

app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const current = getStoreSettings();
    const {
      store_name = current.store_name,
      store_tagline = current.store_tagline,
      logo_url = current.logo_url,
      contact_email = current.contact_email,
      contact_phone = current.contact_phone,
      whatsapp_number = current.whatsapp_number,
      shipping_charges = current.shipping_charges,
      free_shipping_threshold = current.free_shipping_threshold,
      low_stock_threshold = current.low_stock_threshold,
      announcement_text = current.announcement_text,
      hero_badge = current.hero_badge,
      hero_title = current.hero_title,
      hero_subtitle = current.hero_subtitle,
      promo_banner_title = current.promo_banner_title,
      promo_banner_subtitle = current.promo_banner_subtitle,
      instagram_url = current.instagram_url,
      youtube_url = current.youtube_url,
      tiktok_url = current.tiktok_url,
      facebook_url = current.facebook_url,
      payment_methods = current.payment_methods,
    } = req.body;

    const paymentJson = JSON.stringify(
      Array.isArray(payment_methods) && payment_methods.length > 0
        ? payment_methods
        : ['Cash on Delivery (COD)', 'Bank Transfer (Confirm via WhatsApp)']
    );

    db.prepare(
      `UPDATE store_settings SET
        store_name = ?,
        store_tagline = ?,
        logo_url = ?,
        contact_email = ?,
        contact_phone = ?,
        whatsapp_number = ?,
        shipping_charges = ?,
        free_shipping_threshold = ?,
        low_stock_threshold = ?,
        announcement_text = ?,
        hero_badge = ?,
        hero_title = ?,
        hero_subtitle = ?,
        promo_banner_title = ?,
        promo_banner_subtitle = ?,
        instagram_url = ?,
        youtube_url = ?,
        tiktok_url = ?,
        facebook_url = ?,
        payment_methods_json = ?,
        updated_at = datetime('now')
       WHERE id = 1`
    ).run(
      String(store_name).trim(),
      String(store_tagline).trim(),
      String(logo_url).trim(),
      String(contact_email).trim(),
      String(contact_phone).trim(),
      String(whatsapp_number).trim(),
      Math.max(0, Number(shipping_charges) || 0),
      Math.max(0, Number(free_shipping_threshold) || 0),
      Math.max(1, Number(low_stock_threshold) || 5),
      String(announcement_text).trim(),
      String(hero_badge).trim(),
      String(hero_title).trim(),
      String(hero_subtitle).trim(),
      String(promo_banner_title).trim(),
      String(promo_banner_subtitle).trim(),
      String(instagram_url).trim(),
      String(youtube_url).trim(),
      String(tiktok_url).trim(),
      String(facebook_url).trim(),
      paymentJson
    );

    res.json({ settings: getStoreSettings() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update store settings' });
  }
});

// Serve built frontend in production if dist exists
const DIST_DIR = path.join(ROOT_DIR, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/assets') || req.path.startsWith('/uploads')) {
      next();
      return;
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✨ Rang e Rosh E-Commerce Backend API running on http://localhost:${PORT}`);
});
