import crypto from 'node:crypto';

export interface Env {
  DB?: any; // Optional Cloudflare D1Database binding (`[[d1_databases]] binding = "DB"`)
  ASSETS?: { fetch: (req: Request) => Promise<Response> };
  NEXT_PUBLIC_FACEBOOK_PIXEL_ID?: string;
  VITE_FACEBOOK_PIXEL_ID?: string;
  META_ACCESS_TOKEN?: string;
  META_TEST_EVENT_CODE?: string;
  ADMIN_DEFAULT_EMAIL?: string;
  ADMIN_DEFAULT_PASSWORD?: string;
  WEBHOOK_SECRET?: string;
}

const STANDARD_SIZES = ['Small', 'Medium', 'Large', 'Extra Large'];
const OFFICIAL_LOGO_URL = '/assets/logo/rang-e-rosh-logo-v2.jpg';

const DEFAULT_SETTINGS = {
  id: 1,
  store_name: 'Rang e Rosh',
  store_tagline: 'Ladies Stitched Suits — Pret Collection',
  logo_url: OFFICIAL_LOGO_URL,
  contact_email: 'rangerosh.official@gmail.com',
  contact_phone: '03130888048',
  whatsapp_number: '03130888048',
  whatsapp_clean: '923130888048',
  shipping_charges: 250,
  free_shipping_threshold: 10000,
  low_stock_threshold: 5,
  currency: 'PKR',
  announcement_text:
    'Welcome to Rang e Rosh — Free Nationwide Delivery on Orders Above PKR 10,000 | Instant WhatsApp Order Confirmation',
  hero_badge: 'NEW PRET COLLECTION 2026',
  hero_title: 'Timeless Craftsmanship in Every Thread',
  hero_subtitle:
    'Discover the signature Rang e Rosh 2-Piece Stitched Pret Collection. Precision tailoring, rich seasonal textures, and intricate embroidery designed for effortless grace.',
  promo_banner_title: 'Artisanal Embroidery Meets Modern Silhouette',
  promo_banner_subtitle:
    'Every Rang e Rosh ensemble is crafted with high-density seam tailoring, structured necklines, and fluid trousers for everyday luxury.',
  instagram_url: 'https://www.instagram.com/rangerosh/',
  youtube_url: 'https://www.youtube.com/@RangeRosh',
  tiktok_url: 'https://www.tiktok.com/@rangerosh',
  facebook_url: 'https://www.facebook.com/RangeRosh/',
  payment_methods: ['Cash on Delivery (COD)', 'Bank Transfer (Confirm via WhatsApp)'],
  updated_at: new Date().toISOString(),
};

function computeStockStatus(available: number, threshold: number): string {
  if (available <= 0) return 'Out of Stock';
  if (available <= threshold) return 'Low Stock';
  return 'In Stock';
}

function distributeStock(total: number): Record<string, number> {
  const safe = Math.max(0, Math.floor(Number(total) || 0));
  const base = Math.floor(safe / 4);
  const rem = safe % 4;
  return {
    Small: base + (0 < rem ? 1 : 0),
    Medium: base + (1 < rem ? 1 : 0),
    Large: base + (2 < rem ? 1 : 0),
    'Extra Large': base + (3 < rem ? 1 : 0),
  };
}

function makeImages(slug: string, count: number, ext: string, primaryIdx = 0) {
  const imgs = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    image_url: `/assets/products/${slug}/${i + 1}.${ext}`,
    alt_text: `${slug.toUpperCase()} View ${i + 1}`,
    sort_order: i === primaryIdx ? 0 : i < primaryIdx ? i + 1 : i,
    is_primary: i === primaryIdx ? 1 : 0,
  }));
  imgs.sort((a, b) => a.sort_order - b.sort_order);
  return imgs;
}

function makeVariants(colorLabel: string) {
  return STANDARD_SIZES.map((s, idx) => ({
    id: idx + 1,
    size_label: s,
    color_label: colorLabel,
    sku_suffix: s === 'Extra Large' ? 'XL' : s.slice(0, 1).toUpperCase(),
    additional_price: 0,
    is_available: 1,
  }));
}

const SEED_PRODUCTS = [
  {
    id: 1,
    slug: 'anna',
    sku: 'RER-PRET-ANNA-01',
    name: 'ANNA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 7490,
    discounted_price: null,
    effective_price: 7490,
    overview:
      'ANNA from the Rang e Rosh collection features an embroidered shirt paired with a plain-dyed trouser. The intricate light-toned embroidery adds a refined, elegant touch to the rich black textured fabric, complemented by the understated simplicity of the trouser for a beautifully balanced ensemble.',
    product_type_detail: '2-Piece Stitched Suit (Shirt + Trouser)',
    color_name: 'Classic Black with Ivory/Off-White Embroidery',
    fabric: 'Rich Black Textured Fabric',
    fit: 'Relaxed / Straight Fit',
    embroidered_details:
      'Neckline: Intricate embroidery along the rounded neckline.\nFront Panel & Hemline: Delicately embroidered vertical panel borders framing the front, leading to a richly detailed floral and vine hemline (daman).\nSleeves: Wide-cut loose sleeves finished with coordinating embroidered sleeve cuffs.\nTrouser: Plain dyed trouser with a subtle tulip-style/relaxed cut.',
    suit_stitching:
      'Precision Tailoring: High-density, fine thread seams built to maintain silhouette shape and long-term durability.\nFlawless Neckline & Panel Facing: Reinforced embroidery backing ensures the panels lie flat and structured without puckering.\nClean Edge Finishing: Fully enclosed internal seams and thread-trimmed edges prevent fraying and ensure comfortable wear.',
    outfit_architecture:
      'Shirt (Kameez): Straight longline shirt featuring vertical paneling, wide bell sleeves, and a curved embroidered hemline.\nTrouser: Plain-dyed, wide-leg relaxed trousers with a comfortable elasticated waistband for effortless elegance.',
    wash_care:
      'Dry clean recommended to maintain fabric weave and embroidery integrity.\nIf hand washing, wash gently in cold water with mild detergent.\nDo not bleach, wring, or tumble dry.\nLine dry in the shade to prevent color fading.\nIron on low-to-medium heat on the reverse side; avoid direct iron contact on embroidered areas.',
    color_disclaimer:
      'Actual product colors may slightly vary from the images shown due to photographic lighting sources, professional shoot editing, or individual device screen settings.',
    video_url: '/assets/products/anna/anna-video.mp4',
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/anna/1.jpg',
    secondary_image: '/assets/products/anna/2.jpg',
    images: makeImages('anna', 9, 'jpg', 0),
    variants: makeVariants('Classic Black with Ivory/Off-White Embroidery'),
    sizes: [...STANDARD_SIZES],
    colors: ['Classic Black with Ivory/Off-White Embroidery'],
    inventory: {
      available_stock: 14,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 4, Medium: 4, Large: 3, 'Extra Large': 3 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    slug: 'hazel',
    sku: 'RER-PRET-HAZEL-02',
    name: 'HAZEL',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 7490,
    discounted_price: null,
    effective_price: 7490,
    overview:
      'Hazel is a beautifully crafted ensemble that brings together timeless elegance and contemporary charm. Featuring intricate embroidery on a textured shirt, this sophisticated design is paired with a plain-dyed trouser for a graceful, effortlessly coordinated look.',
    product_type_detail: '2-Piece Stitched Suit (Shirt + Trouser)',
    color_name: 'Cranberry Red with Floral Embroidery',
    fabric: 'Rich Seasonal Textured Fabric',
    fit: 'Relaxed / Straight Fit',
    embroidered_details:
      'Featuring intricate floral embroidery with delicate threadwork and traditional motifs along the neckline, front panel, sleeve cuffs, and matching border.',
    suit_stitching:
      'Precision Tailoring: High-density stitching ensures seamless drape, optimal durability, and pristine garment structural integrity.\nNeat Finishing: Fully finished inner seams prevent fraying and offer maximum skin comfort.',
    outfit_architecture:
      'Shirt (Kameez): A straight-cut longline shirt with a structured V-neckline, full relaxed bell sleeves, and side vents for fluid movement.\nTrouser: Straight-leg matching plain-dyed trousers designed with a comfortable elastic waistband and clean hemline.',
    wash_care:
      "Dry clean recommended to preserve the fabric's texture and intricate embroidery.\nIf washing at home, hand wash gently in cold water with a mild detergent.",
    color_disclaimer:
      'Please note that the actual product colour may vary slightly from the images displayed on our website due to lighting conditions, photography, and differences in screen settings.',
    video_url: '/assets/products/hazel/hazel-video.mp4',
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/hazel/1.jpg',
    secondary_image: '/assets/products/hazel/2.jpg',
    images: makeImages('hazel', 9, 'jpg', 0),
    variants: makeVariants('Cranberry Red with Floral Embroidery'),
    sizes: [...STANDARD_SIZES],
    colors: ['Cranberry Red with Floral Embroidery'],
    inventory: {
      available_stock: 12,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 3, Medium: 3, Large: 3, 'Extra Large': 3 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    slug: 'olivia',
    sku: 'RER-PRET-OLIVIA-03',
    name: 'OLIVIA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 8999,
    discounted_price: null,
    effective_price: 8999,
    overview:
      'OLIVIA from the Rang e Rosh Pret collection is a sophisticated 2-piece stitched ensemble in a rich olive green tone. Adorned with delicate floral embroidery in vibrant shades of magenta, teal, blue, and gold threadwork.',
    product_type_detail: '2-Piece Stitched Suit (Shirt + Trouser)',
    color_name: 'Deep Olive Green with Multi-color (Magenta, Teal, Gold) Threadwork',
    fabric: 'Premium Cotton / Linen Blend',
    fit: 'Relaxed Straight Fit',
    embroidered_details:
      'Neckline: Delicate slit neck adorned with fine floral thread embroidery.\nFront & Side Panels: Swirling vine and floral motifs extending along the side panel and hemline.',
    suit_stitching:
      'Precision Tailoring: High-density, fine thread seam construction ensures garment durability and structural integrity.',
    outfit_architecture:
      'Shirt (Kameez): A straight-cut longline tunic featuring a split V-neckline, broad relaxed sleeves, panel embroidery, and side vents.',
    wash_care: 'Dry clean recommended to preserve fabric richness and intricate threadwork.',
    color_disclaimer: 'Actual product colors may vary slightly from the images shown.',
    video_url: null,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/olivia/1.jpg',
    secondary_image: '/assets/products/olivia/2.jpg',
    images: makeImages('olivia', 6, 'jpg', 0),
    variants: makeVariants('Deep Olive Green with Multi-color Threadwork'),
    sizes: [...STANDARD_SIZES],
    colors: ['Deep Olive Green with Multi-color Threadwork'],
    inventory: {
      available_stock: 10,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 3, Medium: 3, Large: 2, 'Extra Large': 2 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    slug: 'orchid',
    sku: 'RER-PRET-ORCHID-04',
    name: 'ORCHID',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 11450,
    discounted_price: null,
    effective_price: 11450,
    overview:
      'ORCHID from the Rang e Rosh Pret collection is a regal 2-piece stitched suit presented in a deep plum purple tone. Accented with delicate floral thread embroidery and refined schiffli cutwork detailing.',
    product_type_detail: '2-Piece Stitched Suit (Kameez / Long Shirt + Straight Trouser)',
    color_name: 'Deep Plum / Royal Purple with Peach, Lavender & Ochre Embroidery',
    fabric: 'Premium Smooth Viscose / Cotton Blend',
    fit: 'Relaxed Straight Silhouette with Graceful Drape',
    embroidered_details:
      'Neckline: Delicate notch neck accented with fine floral branch embroidery.\nSleeves: Wide relaxed bell sleeves embellished with floral threadwork and schiffli cutwork borders.',
    suit_stitching:
      'Precision Seams: High-density stitching ensures structural longevity and clean garment lines.',
    outfit_architecture:
      'Shirt (Kameez): A straight, longline tunic featuring side slits, broad relaxed sleeves, notch neck, and panel embroidery.',
    wash_care: 'Dry clean recommended to retain fabric richness and delicate cutwork embroidery.',
    color_disclaimer: 'Actual product color may slightly vary from the pictures.',
    video_url: null,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/orchid/1.webp',
    secondary_image: '/assets/products/orchid/2.webp',
    images: makeImages('orchid', 8, 'webp', 0),
    variants: makeVariants('Deep Plum / Royal Purple with Peach, Lavender & Ochre Embroidery'),
    sizes: [...STANDARD_SIZES],
    colors: ['Deep Plum / Royal Purple with Peach, Lavender & Ochre Embroidery'],
    inventory: {
      available_stock: 9,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 3, Medium: 2, Large: 2, 'Extra Large': 2 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    slug: 'sabz',
    sku: 'RER-PRET-SABZ-05',
    name: 'SABZ',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 8450,
    discounted_price: null,
    effective_price: 8450,
    overview:
      'SABZ from the Rang e Rosh Pret collection is a luxurious 2-piece stitched ensemble in a rich jewel-toned emerald green. Showcasing delicate antique gold tilla and tonal threadwork.',
    product_type_detail: '2-Piece Stitched Suit (Long Shirt + Straight Trouser)',
    color_name: 'Deep Emerald Green with Antique Gold & Tonal Green Threadwork',
    fabric: 'Premium Smooth Viscose Silk / Cotton Blend',
    fit: 'Relaxed Longline Straight Cut',
    embroidered_details:
      'Neckline & Placket: Intricate split V-neckline adorned with delicate antique gold hand-accented stitchwork.',
    suit_stitching:
      'Master Tailoring: High-density, fine-thread seaming designed for a smooth drape and structural permanence.',
    outfit_architecture:
      'Shirt (Kameez): An extended longline straight tunic with a V-split neckline.',
    wash_care: 'Dry clean recommended to retain deep jewel tones and preserve delicate tilla embroidery.',
    color_disclaimer: 'Actual product colors may vary slightly from the images shown.',
    video_url: null,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/sabz/5.png',
    secondary_image: '/assets/products/sabz/1.png',
    images: makeImages('sabz', 11, 'png', 4),
    variants: makeVariants('Deep Emerald Green with Antique Gold & Tonal Green Threadwork'),
    sizes: [...STANDARD_SIZES],
    colors: ['Deep Emerald Green with Antique Gold & Tonal Green Threadwork'],
    inventory: {
      available_stock: 11,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 3, Medium: 3, Large: 3, 'Extra Large': 2 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    slug: 'zayna',
    sku: 'RER-PRET-ZAYNA-06',
    name: 'ZAYNA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    regular_price: 4700,
    discounted_price: null,
    effective_price: 4700,
    overview:
      'ZAYNA from the Rang e Rosh collection is a vibrant 2-piece stitched suit crafted in a warm mustard-yellow shade. Featuring traditional embroidered motifs scattered across the shirt.',
    product_type_detail: '2-Piece Stitched Suit (Shirt + Trouser)',
    color_name: 'Mustard Yellow with Maroon & Cream Accents',
    fabric: 'Premium Cotton / Viscose Blend',
    fit: 'Straight Cut / Relaxed Fit',
    embroidered_details:
      'Neckline & Placket: Embroidered round neckline with an extended placket detailed with delicate contrast stitchwork.',
    suit_stitching:
      'Precision Tailoring: High-density, fine thread seams crafted for structural durability and a smooth fit.',
    outfit_architecture:
      'Shirt (Kameez): A straight longline tunic with a split keyhole neckline, broad statement sleeves with slit cuffs.',
    wash_care: 'Dry clean recommended to preserve fabric quality and detailed embroidery work.',
    color_disclaimer: 'Product colors may vary slightly from the images shown.',
    video_url: null,
    is_featured: true,
    is_new_arrival: true,
    is_published: true,
    primary_image: '/assets/products/zayna/1.webp',
    secondary_image: '/assets/products/zayna/2.webp',
    images: makeImages('zayna', 4, 'webp', 0),
    variants: makeVariants('Mustard Yellow with Maroon & Cream Accents'),
    sizes: [...STANDARD_SIZES],
    colors: ['Mustard Yellow with Maroon & Cream Accents'],
    inventory: {
      available_stock: 15,
      reserved_stock: 0,
      sold_quantity: 0,
      low_stock_threshold: 5,
      stock_status: 'In Stock',
      size_stock: { Small: 4, Medium: 4, Large: 4, 'Extra Large': 3 },
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Global isolate memory state (used alongside optional Cloudflare D1 `env.DB`)
const memoryState: {
  settings: any;
  products: any[];
  orders: any[];
  transactions: any[];
  reviews: Record<string, any[]>;
  admin_auth: { email: string; password: string };
} = {
  settings: { ...DEFAULT_SETTINGS },
  products: JSON.parse(JSON.stringify(SEED_PRODUCTS)),
  orders: [],
  transactions: [],
  reviews: {},
  admin_auth: {
    email: 'rangerosh.official@gmail.com',
    password: 'RangeRosh@Admin2026',
  },
};

let d1Initialized = false;

/**
 * Ensures Cloudflare D1 tables exist if `env.DB` binding is configured in `wrangler.toml`.
 */
async function ensureD1Schema(db: any): Promise<void> {
  if (!db || d1Initialized) return;
  try {
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT NOT NULL UNIQUE,
          customer_id INTEGER,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT DEFAULT '',
          shipping_address TEXT NOT NULL,
          city TEXT NOT NULL,
          order_notes TEXT DEFAULT '',
          payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery (COD)',
          subtotal REAL NOT NULL,
          shipping_charges REAL NOT NULL,
          total_amount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'Pending',
          stock_deducted INTEGER NOT NULL DEFAULT 0,
          stock_reserved INTEGER NOT NULL DEFAULT 1,
          whatsapp_message TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )`
      )
      .run();

    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER,
          product_name TEXT NOT NULL,
          product_sku TEXT NOT NULL,
          product_image TEXT NOT NULL DEFAULT '',
          selected_size TEXT DEFAULT '',
          selected_color TEXT DEFAULT '',
          unit_price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          line_total REAL NOT NULL
        )`
      )
      .run();

    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS product_reviews (
          id TEXT PRIMARY KEY,
          product_slug TEXT NOT NULL,
          customer_name TEXT NOT NULL,
          city TEXT NOT NULL DEFAULT 'Pakistan',
          rating INTEGER NOT NULL DEFAULT 5,
          selected_size TEXT NOT NULL DEFAULT 'Medium',
          title TEXT NOT NULL DEFAULT '',
          comment TEXT NOT NULL DEFAULT '',
          verified INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )`
      )
      .run();

    d1Initialized = true;
  } catch (err: any) {
    console.error('[Cloudflare Worker D1 Init Error]', {
      message: err?.message,
      stack: err?.stack,
    });
  }
}

/**
 * Hydrates in-memory orders from Cloudflare D1 (`env.DB`) if bound.
 */
async function loadOrdersFromD1IfAvailable(db: any): Promise<any[]> {
  if (!db) return memoryState.orders;
  await ensureD1Schema(db);
  try {
    const ordersRes = await db
      .prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 200')
      .all();
    const rows = ordersRes?.results || [];
    if (rows.length === 0) return memoryState.orders;

    const hydrated: any[] = [];
    for (const o of rows) {
      const itemsRes = await db
        .prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC')
        .bind(o.id)
        .all();
      const resolvedItems = itemsRes?.results || [];
      const msgs = buildOrderWhatsAppLinks(o, resolvedItems);
      hydrated.push({
        ...o,
        subtotal: Number(o.subtotal),
        shipping_charges: Number(o.shipping_charges),
        total_amount: Number(o.total_amount),
        stock_deducted: Boolean(o.stock_deducted),
        stock_reserved: Boolean(o.stock_reserved),
        items: resolvedItems,
        ...msgs,
      });
    }
    memoryState.orders = hydrated;
    return hydrated;
  } catch (err: any) {
    console.error('[Cloudflare Worker D1 Read Orders Error]', {
      message: err?.message,
    });
    return memoryState.orders;
  }
}

function buildOrderWhatsAppLinks(orderData: any, items: any[]) {
  const orderNumber = orderData.order_number;
  const totalAmount = Number(orderData.total_amount || 0);
  const subtotal = Number(orderData.subtotal || totalAmount);
  const shipping = Number(orderData.shipping_charges || 0);

  const shortItems = (items || [])
    .map((i: any) => `• ${i.quantity}x *${i.product_name}* (${i.selected_size || 'Small'})`)
    .join('\n');

  const shortStoreMsg = [
    `Assalam-o-Alaikum *${memoryState.settings.store_name}*!`,
    `I placed Order *#${orderNumber}*`,
    shortItems,
    `Total: *PKR ${totalAmount.toLocaleString('en-PK')}* (${orderData.payment_method || 'Cash on Delivery (COD)'})`,
    `Name: ${orderData.customer_name}`,
    `City: ${orderData.city}`,
    `Please confirm my order.`,
  ].join('\n');

  const detailedItemsLines = (items || [])
    .map(
      (i: any, idx: number) =>
        `${idx + 1}. *${i.product_name}* (${i.selected_size || 'Small'}${i.selected_color ? ` • ${i.selected_color}` : ''})\n   SKU: ${i.product_sku} | Qty: ${i.quantity} × PKR ${Number(i.unit_price || 0).toLocaleString('en-PK')} = *PKR ${Number(i.line_total || 0).toLocaleString('en-PK')}*`
    )
    .join('\n\n');

  const detailedClientMsg = [
    `Assalam-o-Alaikum *${orderData.customer_name}*!`,
    ``,
    `Great news from *${memoryState.settings.store_name}*! ✨`,
    `Your order *#${orderNumber}* has been *CONFIRMED* ✅ and is being prepared for dispatch.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🛍️ *ORDER CONFIRMATION: #${orderNumber}*`,
    `📌 *Status:* Confirmed ✅`,
    `💳 *Payment:* ${orderData.payment_method || 'Cash on Delivery (COD)'}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👗 *PRODUCT & ORDER DETAILS*`,
    detailedItemsLines,
    ``,
    `• Subtotal: PKR ${subtotal.toLocaleString('en-PK')}`,
    `• Delivery: ${shipping === 0 ? 'FREE' : `PKR ${shipping.toLocaleString('en-PK')}`}`,
    `💰 *Total Payable: PKR ${totalAmount.toLocaleString('en-PK')}*`,
    ``,
    `📍 *DELIVERY DETAILS*`,
    `• Name: ${orderData.customer_name}`,
    `• Phone: ${orderData.customer_phone}`,
    `• Address: ${orderData.shipping_address}, ${orderData.city}`,
    ...(orderData.order_notes ? [`• Notes: ${orderData.order_notes}`] : []),
    ``,
    `Thank you for shopping with *${memoryState.settings.store_name}*!`,
    `📞 Official WhatsApp: 03130888048`,
  ].join('\n');

  let cleanCustomerPhone = String(orderData.customer_phone || '').replace(/\D/g, '');
  if (cleanCustomerPhone.startsWith('00')) cleanCustomerPhone = cleanCustomerPhone.slice(2);
  else if (cleanCustomerPhone.startsWith('0') && cleanCustomerPhone.length === 11) {
    cleanCustomerPhone = '92' + cleanCustomerPhone.slice(1);
  } else if (cleanCustomerPhone.length === 10 && cleanCustomerPhone.startsWith('3')) {
    cleanCustomerPhone = '92' + cleanCustomerPhone;
  }

  return {
    whatsapp_message: shortStoreMsg,
    whatsapp_url: `https://wa.me/923130888048?text=${encodeURIComponent(shortStoreMsg)}`,
    customer_whatsapp_message: detailedClientMsg,
    customer_whatsapp_url: `https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(detailedClientMsg)}`,
    store_whatsapp_message: shortStoreMsg,
    store_whatsapp_url: `https://wa.me/923130888048?text=${encodeURIComponent(shortStoreMsg)}`,
    store_whatsapp: '03130888048',
  };
}

function sha256Hash(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const cleaned = String(value).trim().toLowerCase();
  if (!cleaned) return undefined;
  if (/^[a-f0-9]{64}$/.test(cleaned)) return cleaned;
  return crypto.createHash('sha256').update(cleaned, 'utf8').digest('hex');
}

function hashPhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = '92' + digits.slice(1);
  else if (digits.length === 10 && digits.startsWith('3')) digits = '92' + digits;
  return sha256Hash(digits);
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Signature',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const urlObj = new URL(request.url);
    const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
    const method = request.method.toUpperCase();

    // Handle CORS preflight immediately
    if (method === 'OPTIONS' && pathname.startsWith('/api/')) {
      return new Response(null, { status: 200, headers: CORS_HEADERS });
    }

    // Serve static SPA assets for non-API routes
    if (!pathname.startsWith('/api/')) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response('Not Found', { status: 404 });
    }

    // Parse raw body text first so both JSON routes and signature-verified webhooks work cleanly
    let rawBodyText = '';
    let body: any = {};
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        rawBodyText = await request.text();
        body = rawBodyText ? JSON.parse(rawBodyText) : {};
      } catch (parseErr: any) {
        console.error('[Cloudflare Worker JSON Parse Error]', {
          pathname,
          method,
          error: parseErr?.message,
        });
        return jsonResponse({ error: 'Invalid JSON request payload.' }, 400);
      }
    }

    try {
      // 0. Meta Conversions API (CAPI)
      if (pathname === '/api/meta-capi' && method === 'POST') {
        const eventName = String(body.event_name || '').trim();
        if (!eventName) {
          return jsonResponse({ error: 'event_name is required.' }, 400);
        }
        const eventId = String(body.event_id || `evt_${Date.now()}`).trim();
        const pixelId =
          env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || env.VITE_FACEBOOK_PIXEL_ID || '';
        const accessToken = env.META_ACCESS_TOKEN || '';
        const testEventCode = env.META_TEST_EVENT_CODE || '';

        const clientIp =
          request.headers.get('cf-connecting-ip') ||
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          request.headers.get('x-real-ip') ||
          undefined;
        const userAgent =
          request.headers.get('user-agent') ||
          body.user_data?.client_user_agent ||
          undefined;

        const inputUser = body.user_data || {};
        const userData: Record<string, any> = {};
        const em = sha256Hash(inputUser.em);
        if (em) userData.em = [em];
        const ph = hashPhone(inputUser.ph);
        if (ph) userData.ph = [ph];
        const fn = sha256Hash(inputUser.fn);
        if (fn) userData.fn = [fn];
        const ln = sha256Hash(inputUser.ln);
        if (ln) userData.ln = [ln];
        const ct = sha256Hash(
          inputUser.ct ? String(inputUser.ct).replace(/[^a-zA-Z]/g, '') : undefined
        );
        if (ct) userData.ct = [ct];
        const country = sha256Hash(inputUser.country || 'pk');
        if (country) userData.country = [country];
        const externalId = sha256Hash(inputUser.external_id);
        if (externalId) userData.external_id = [externalId];

        if (inputUser.fbp) userData.fbp = String(inputUser.fbp).trim();
        if (inputUser.fbc) userData.fbc = String(inputUser.fbc).trim();
        if (inputUser.client_ip_address || clientIp) {
          userData.client_ip_address = String(
            inputUser.client_ip_address || clientIp
          ).trim();
        }
        if (userAgent) userData.client_user_agent = userAgent;

        const eventPayload = {
          event_name: eventName,
          event_time: Number(body.event_time) || Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          event_source_url:
            body.event_source_url || request.headers.get('referer') || undefined,
          user_data: userData,
          ...(body.custom_data && Object.keys(body.custom_data).length > 0
            ? { custom_data: body.custom_data }
            : {}),
        };

        if (!pixelId || !accessToken) {
          return jsonResponse({
            sent: false,
            skipped: true,
            reason:
              'Missing NEXT_PUBLIC_FACEBOOK_PIXEL_ID or META_ACCESS_TOKEN in Worker environment',
            event_id: eventId,
            prepared_event: eventPayload,
          });
        }

        const graphBody = {
          data: [eventPayload],
          ...(testEventCode.trim() ? { test_event_code: testEventCode.trim() } : {}),
        };

        const graphRes = await fetch(
          `https://graph.facebook.com/v26.0/${encodeURIComponent(
            pixelId
          )}/events?access_token=${encodeURIComponent(accessToken)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(graphBody),
          }
        );
        const graphData = await graphRes.json().catch(() => ({}));
        return jsonResponse(
          {
            sent: graphRes.ok,
            event_id: eventId,
            response: graphData,
          },
          graphRes.ok ? 200 : graphRes.status
        );
      }

      // 1. Storefront Init
      if (pathname === '/api/storefront/init' && method === 'GET') {
        const published = memoryState.products.filter((p) => p.is_published);
        const categories = Array.from(new Set(published.map((p) => p.category)));
        return jsonResponse({
          settings: memoryState.settings,
          products: published,
          categories,
        });
      }

      // 2. Public Products List
      if (pathname === '/api/products' && method === 'GET') {
        let list = memoryState.products.filter((p) => p.is_published);
        const category = urlObj.searchParams.get('category');
        const availability = urlObj.searchParams.get('availability');
        const search = urlObj.searchParams.get('search');
        const sort = urlObj.searchParams.get('sort');

        if (category && category !== 'All') {
          list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
        }
        if (availability === 'in_stock') {
          list = list.filter((p) => p.inventory.available_stock > 0);
        } else if (availability === 'out_of_stock') {
          list = list.filter((p) => p.inventory.available_stock <= 0);
        }
        if (search && search.trim()) {
          const q = search.trim().toLowerCase();
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q) ||
              p.color_name.toLowerCase().includes(q) ||
              p.overview.toLowerCase().includes(q)
          );
        }
        if (sort === 'price_asc') {
          list.sort((a, b) => a.effective_price - b.effective_price);
        } else if (sort === 'price_desc') {
          list.sort((a, b) => b.effective_price - a.effective_price);
        }
        return jsonResponse({ products: list });
      }

      // 2.5 Product Reviews
      const revMatch = pathname.match(/^\/api\/products\/([^/]+)\/reviews$/);
      if (revMatch) {
        const slugKey = decodeURIComponent(revMatch[1]).toLowerCase();
        if (method === 'GET') {
          if (env.DB) {
            await ensureD1Schema(env.DB);
            const d1Revs = await env.DB.prepare(
              'SELECT * FROM product_reviews WHERE product_slug = ? ORDER BY rowid DESC'
            )
              .bind(slugKey)
              .all();
            if (d1Revs?.results?.length) {
              return jsonResponse({
                reviews: d1Revs.results.map((r: any) => ({
                  ...r,
                  verified: Boolean(r.verified),
                })),
              });
            }
          }
          return jsonResponse({ reviews: memoryState.reviews[slugKey] || [] });
        }
        if (method === 'POST') {
          const newRev = {
            id: body.id || `rev-${slugKey}-${Date.now()}`,
            product_slug: slugKey,
            customer_name: String(body.customer_name || 'Verified Customer').trim(),
            city: String(body.city || 'Pakistan').trim(),
            rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
            selected_size: String(body.selected_size || 'Medium').trim(),
            title: String(body.title || '').trim(),
            comment: String(body.comment || '').trim(),
            verified: true,
            created_at: body.created_at || 'Just now',
          };
          memoryState.reviews[slugKey] = [
            newRev,
            ...(memoryState.reviews[slugKey] || []),
          ];
          if (env.DB) {
            await ensureD1Schema(env.DB);
            await env.DB.prepare(
              `INSERT OR REPLACE INTO product_reviews (
                id, product_slug, customer_name, city, rating, selected_size, title, comment, verified, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
            )
              .bind(
                newRev.id,
                newRev.product_slug,
                newRev.customer_name,
                newRev.city,
                newRev.rating,
                newRev.selected_size,
                newRev.title,
                newRev.comment,
                newRev.created_at
              )
              .run();
          }
          return jsonResponse(
            { review: newRev, reviews: memoryState.reviews[slugKey] },
            201
          );
        }
      }

      // 3. Public Product Detail
      if (pathname.startsWith('/api/products/') && method === 'GET') {
        const slugOrId = decodeURIComponent(pathname.slice('/api/products/'.length));
        const all = memoryState.products.filter((p) => p.is_published);
        const product = all.find(
          (p) => p.slug === slugOrId || String(p.id) === slugOrId
        );
        if (!product) return jsonResponse({ error: 'Product not found' }, 404);
        const relatedProducts = all.filter((p) => p.id !== product.id);
        return jsonResponse({ product, relatedProducts });
      }

      // 4. Create Order (Checkout Submission + D1 / Memory Persistence + Structured Logging)
      if (pathname === '/api/orders' && method === 'POST') {
        const customerName = String(body.customer_name || '').trim();
        const customerPhone = String(body.customer_phone || '').trim();
        const customerEmail = String(body.customer_email || '').trim();
        const shippingAddress = String(body.shipping_address || '').trim();
        const city = String(body.city || '').trim();
        const orderNotes = String(body.order_notes || '').trim();
        const paymentMethod = String(
          body.payment_method || 'Cash on Delivery (COD)'
        ).trim();
        const items = Array.isArray(body.items) ? body.items : [];

        if (!customerName) {
          return jsonResponse({ error: 'Customer full name is required.' }, 400);
        }
        if (customerPhone.replace(/\D/g, '').length < 10) {
          return jsonResponse(
            { error: 'A valid WhatsApp / mobile phone number is required.' },
            400
          );
        }
        if (!shippingAddress) {
          return jsonResponse({ error: 'Complete shipping address is required.' }, 400);
        }
        if (!city) {
          return jsonResponse({ error: 'City is required.' }, 400);
        }
        if (items.length === 0) {
          return jsonResponse(
            { error: 'Your cart is empty. Please add at least one item.' },
            400
          );
        }

        // Consolidate quantities by product & size to prevent split-row overselling
        const qtyByProdSize = new Map<string, number>();
        for (const item of items) {
          const pid = Number(item.product_id);
          const qty = Number(item.quantity);
          if (!pid || !Number.isInteger(qty) || qty <= 0) {
            return jsonResponse({ error: 'Invalid product quantity in order.' }, 400);
          }
          const selSize = String(item.selected_size || 'Small').trim();
          const key = `${pid}::${selSize}`;
          qtyByProdSize.set(key, (qtyByProdSize.get(key) || 0) + qty);
        }

        for (const [key, totalReqQty] of qtyByProdSize.entries()) {
          const [pidStr, selSize] = key.split('::');
          const prod = memoryState.products.find((p) => p.id === Number(pidStr));
          if (!prod) {
            return jsonResponse({ error: 'Selected product is no longer available.' }, 400);
          }
          const sizeAvail = Number(
            prod.inventory.size_stock?.[selSize] ?? prod.inventory.available_stock
          );
          if (totalReqQty > sizeAvail || totalReqQty > prod.inventory.available_stock) {
            return jsonResponse(
              {
                error: `Insufficient stock for "${prod.name}" (${selSize}). Only ${sizeAvail} available.`,
              },
              400
            );
          }
        }

        let subtotal = 0;
        const resolvedItems = items.map((item: any) => {
          const prod = memoryState.products.find(
            (p) => p.id === Number(item.product_id)
          )!;
          const qty = Number(item.quantity);
          const selSize = String(item.selected_size || 'Small').trim();
          const lineTotal = prod.effective_price * qty;
          subtotal += lineTotal;

          prod.inventory.reserved_stock =
            Number(prod.inventory.reserved_stock || 0) + qty;

          return {
            product_id: prod.id,
            product_name: prod.name,
            product_sku: prod.sku,
            product_image: prod.primary_image,
            selected_size: selSize,
            selected_color: item.selected_color || prod.color_name,
            unit_price: prod.effective_price,
            quantity: qty,
            line_total: lineTotal,
          };
        });

        await loadOrdersFromD1IfAvailable(env.DB);

        const shipping =
          memoryState.settings.free_shipping_threshold > 0 &&
          subtotal >= memoryState.settings.free_shipping_threshold
            ? 0
            : memoryState.settings.shipping_charges;
        const totalAmount = subtotal + shipping;
        const orderNumber = `RER-${1001 + memoryState.orders.length}`;
        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

        const baseOrder = {
          id: memoryState.orders.length + 1,
          order_number: orderNumber,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          shipping_address: shippingAddress,
          city,
          order_notes: orderNotes,
          payment_method: paymentMethod,
          subtotal,
          shipping_charges: shipping,
          total_amount: totalAmount,
          status: 'Pending',
          stock_deducted: false,
          stock_reserved: true,
          items: resolvedItems,
          created_at: nowStr,
          updated_at: nowStr,
        };

        const msgs = buildOrderWhatsAppLinks(baseOrder, resolvedItems);
        const newOrder: any = {
          ...baseOrder,
          ...msgs,
        };

        // Always await Cloudflare D1 database persistence before returning Response
        if (env.DB) {
          try {
            await ensureD1Schema(env.DB);
            const insertOrderRes = await env.DB.prepare(
              `INSERT INTO orders (
                order_number, customer_name, customer_phone, customer_email,
                shipping_address, city, order_notes, payment_method,
                subtotal, shipping_charges, total_amount, status,
                stock_deducted, stock_reserved, whatsapp_message, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?, ?)`
            )
              .bind(
                newOrder.order_number,
                newOrder.customer_name,
                newOrder.customer_phone,
                newOrder.customer_email,
                newOrder.shipping_address,
                newOrder.city,
                newOrder.order_notes,
                newOrder.payment_method,
                newOrder.subtotal,
                newOrder.shipping_charges,
                newOrder.total_amount,
                newOrder.status,
                newOrder.whatsapp_message,
                newOrder.created_at,
                newOrder.updated_at
              )
              .run();

            const insertedOrderId =
              Number(insertOrderRes?.meta?.last_row_id) || newOrder.id;
            newOrder.id = insertedOrderId;

            for (const rItem of resolvedItems) {
              await env.DB.prepare(
                `INSERT INTO order_items (
                  order_id, product_id, product_name, product_sku, product_image,
                  selected_size, selected_color, unit_price, quantity, line_total
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
              )
                .bind(
                  insertedOrderId,
                  rItem.product_id,
                  rItem.product_name,
                  rItem.product_sku,
                  rItem.product_image,
                  rItem.selected_size,
                  rItem.selected_color,
                  rItem.unit_price,
                  rItem.quantity,
                  rItem.line_total
                )
                .run();
            }
          } catch (d1Err: any) {
            console.error('[Cloudflare Worker D1 Order Insert Failed]', {
              order_number: newOrder.order_number,
              customer_phone: newOrder.customer_phone,
              error: d1Err?.message,
              stack: d1Err?.stack,
            });
            return jsonResponse(
              {
                error: `Database write failed while saving order: ${d1Err?.message || 'D1 Error'}`,
              },
              500
            );
          }
        }

        memoryState.orders.unshift(newOrder);

        // Mirror order to secondary cloud API in background using ctx.waitUntil so Worker doesn't kill it early
        if (ctx && typeof ctx.waitUntil === 'function') {
          ctx.waitUntil(
            fetch('https://rangeroshecommercestore.vercel.app/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            }).catch((syncErr) => {
              console.error('[Cloudflare Worker Background Order Mirror Error]', {
                order_number: newOrder.order_number,
                error: syncErr?.message,
              });
            })
          );
        }

        return jsonResponse({ order: newOrder }, 201);
      }

      // 4.5 Payment / Order Webhook Handler (Verifies Raw Body Signature & Awaits DB Update)
      if (pathname === '/api/webhooks/payment' && method === 'POST') {
        const signature = request.headers.get('x-webhook-signature') || '';
        if (env.WEBHOOK_SECRET) {
          const expectedSig = crypto
            .createHmac('sha256', env.WEBHOOK_SECRET)
            .update(rawBodyText, 'utf8')
            .digest('hex');
          if (signature !== expectedSig) {
            console.error('[Cloudflare Worker Webhook Invalid Signature]', {
              signature,
            });
            return jsonResponse({ error: 'Invalid webhook signature' }, 401);
          }
        }

        const orderNumber = String(body.order_number || '').trim();
        const nextStatus = String(body.status || 'Confirmed').trim();
        if (!orderNumber) {
          return jsonResponse({ error: 'order_number is required in webhook payload' }, 400);
        }

        await loadOrdersFromD1IfAvailable(env.DB);
        const ord = memoryState.orders.find(
          (o) => o.order_number.toUpperCase() === orderNumber.toUpperCase()
        );
        if (!ord) {
          return jsonResponse({ error: `Order ${orderNumber} not found` }, 404);
        }

        ord.status = nextStatus;
        if (env.DB) {
          await env.DB.prepare(
            "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE order_number = ?"
          )
            .bind(nextStatus, ord.order_number)
            .run();
        }
        return jsonResponse({ received: true, order_number: ord.order_number, status: ord.status });
      }

      // 5. Order Lookup
      if (pathname.startsWith('/api/orders/lookup/') && method === 'GET') {
        await loadOrdersFromD1IfAvailable(env.DB);
        const orderNumber = decodeURIComponent(
          pathname.slice('/api/orders/lookup/'.length)
        );
        const order = memoryState.orders.find(
          (o) => o.order_number.toUpperCase() === orderNumber.trim().toUpperCase()
        );
        if (!order) {
          return jsonResponse(
            { error: `No order found with ID "${orderNumber}".` },
            404
          );
        }
        return jsonResponse({ order });
      }

      // 6. Admin Login, Session & Password Change
      if (pathname === '/api/admin/login' && method === 'POST') {
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        const savedEmail = String(
          memoryState.admin_auth?.email ||
            env.ADMIN_DEFAULT_EMAIL ||
            'rangerosh.official@gmail.com'
        )
          .trim()
          .toLowerCase();
        const savedPassword = String(
          memoryState.admin_auth?.password ||
            env.ADMIN_DEFAULT_PASSWORD ||
            'RangeRosh@Admin2026'
        );
        const isCustom =
          savedPassword &&
          savedPassword !== 'RangeRosh@Admin2026' &&
          savedPassword !== 'RangERosh@2026';

        const validPassword = isCustom
          ? password === savedPassword
          : password === savedPassword ||
            password === 'RangERosh@2026' ||
            password === 'RangeRosh@Admin2026';

        if (email === savedEmail && validPassword) {
          return jsonResponse({
            token: 'rer-cloud-admin-token-2026',
            admin: {
              id: 1,
              email: savedEmail,
              name: 'Rang e Rosh Admin',
              role: 'super_admin',
            },
          });
        }
        return jsonResponse({ error: 'Invalid admin email or password.' }, 401);
      }

      if (pathname === '/api/admin/change-password' && method === 'POST') {
        const currentPassword = String(body.current_password || '');
        const newPassword = String(body.new_password || '').trim();
        const savedPassword = String(
          memoryState.admin_auth?.password || 'RangeRosh@Admin2026'
        );
        const isCustom =
          savedPassword &&
          savedPassword !== 'RangeRosh@Admin2026' &&
          savedPassword !== 'RangERosh@2026';

        const validCurrent = isCustom
          ? currentPassword === savedPassword
          : currentPassword === savedPassword ||
            currentPassword === 'RangERosh@2026' ||
            currentPassword === 'RangeRosh@Admin2026';

        if (!validCurrent) {
          return jsonResponse({ error: 'Current password is incorrect.' }, 401);
        }
        if (newPassword.length < 6) {
          return jsonResponse(
            { error: 'New password must be at least 6 characters long.' },
            400
          );
        }
        memoryState.admin_auth = {
          email:
            body.email?.trim() ||
            memoryState.admin_auth?.email ||
            'rangerosh.official@gmail.com',
          password: newPassword,
        };
        return jsonResponse({ message: 'Admin password updated successfully!' });
      }

      if (pathname === '/api/admin/me' && method === 'GET') {
        return jsonResponse({
          admin: {
            id: 1,
            email: memoryState.admin_auth.email,
            name: 'Rang e Rosh Admin',
            role: 'super_admin',
          },
        });
      }

      // 7. Admin Dashboard
      if (pathname === '/api/admin/dashboard' && method === 'GET') {
        await loadOrdersFromD1IfAvailable(env.DB);
        const confirmedStatuses = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
        const confirmedOrders = memoryState.orders.filter((o) =>
          confirmedStatuses.includes(o.status)
        );
        const pendingOrders = memoryState.orders.filter((o) => o.status === 'Pending');
        const cancelledOrders = memoryState.orders.filter(
          (o) => o.status === 'Cancelled'
        );
        const totalSales = confirmedOrders.reduce((s, o) => s + o.total_amount, 0);
        const pendingSales = pendingOrders.reduce((s, o) => s + o.total_amount, 0);
        const lowStock = memoryState.products.filter(
          (p) => p.inventory.stock_status === 'Low Stock'
        );
        const outOfStock = memoryState.products.filter(
          (p) => p.inventory.stock_status === 'Out of Stock'
        );

        return jsonResponse({
          summary: {
            total_products: memoryState.products.length,
            total_orders: memoryState.orders.length,
            pending_orders: pendingOrders.length,
            confirmed_orders: confirmedOrders.length,
            cancelled_orders: cancelledOrders.length,
            total_sales: totalSales,
            pending_sales: pendingSales,
            low_stock_count: lowStock.length,
            out_of_stock_count: outOfStock.length,
          },
          low_stock_products: lowStock,
          out_of_stock_products: outOfStock,
          top_selling_products: [...memoryState.products].sort(
            (a, b) => b.inventory.sold_quantity - a.inventory.sold_quantity
          ),
          daily_analytics: [],
          recent_orders: memoryState.orders.slice(0, 15),
        });
      }

      // 8. Admin Products CRUD
      if (pathname === '/api/admin/products' && method === 'GET') {
        return jsonResponse({ products: memoryState.products });
      }

      if (pathname === '/api/admin/products' && method === 'POST') {
        const newId =
          memoryState.products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
        const slug =
          String(body.name || `product-${newId}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') || `product-${newId}`;
        const sizeStock =
          body.size_stock || distributeStock(Number(body.available_stock) || 12);
        const totalStock = Object.values(sizeStock).reduce(
          (s: number, n: any) => s + Number(n || 0),
          0
        );
        const regPrice = Number(body.regular_price) || 0;
        if (regPrice <= 0) {
          return jsonResponse({ error: 'Regular price must be greater than 0.' }, 400);
        }
        const discPrice = body.discounted_price ? Number(body.discounted_price) : null;
        if (discPrice !== null && (discPrice < 0 || discPrice >= regPrice)) {
          return jsonResponse(
            {
              error:
                'Discounted price must be greater than 0 and less than the regular price.',
            },
            400
          );
        }
        const cleanSku = String(body.sku || `RER-PRET-0${newId}`)
          .trim()
          .toUpperCase();
        if (
          memoryState.products.some(
            (p) => String(p.sku || '').toUpperCase() === cleanSku
          )
        ) {
          return jsonResponse(
            { error: `A product with SKU "${cleanSku}" already exists.` },
            400
          );
        }
        const effPrice = discPrice && discPrice < regPrice ? discPrice : regPrice;
        const imgs = Array.isArray(body.images) ? body.images : [];

        const newProd = {
          id: newId,
          slug,
          sku: cleanSku,
          name: body.name,
          collection_name: body.collection_name || 'Rang e Rosh Pret Collection',
          category: body.category || '2-Piece Stitched Suit',
          regular_price: regPrice,
          discounted_price: discPrice,
          effective_price: effPrice,
          overview: body.overview || '',
          product_type_detail:
            body.product_type_detail || '2-Piece Stitched Suit (Shirt + Trouser)',
          color_name: body.color_name || '',
          fabric: body.fabric || '',
          fit: body.fit || 'Relaxed / Straight Fit',
          embroidered_details: body.embroidered_details || '',
          suit_stitching: body.suit_stitching || '',
          outfit_architecture: body.outfit_architecture || '',
          wash_care: body.wash_care || '',
          color_disclaimer: body.color_disclaimer || '',
          video_url: body.video_url || null,
          is_featured: Boolean(body.is_featured),
          is_new_arrival: Boolean(body.is_new_arrival),
          is_published: Boolean(body.is_published),
          primary_image: imgs[0] || memoryState.settings.logo_url || OFFICIAL_LOGO_URL,
          secondary_image:
            imgs[1] || imgs[0] || memoryState.settings.logo_url || OFFICIAL_LOGO_URL,
          images: imgs.map((url: string, idx: number) => ({
            id: idx + 1,
            image_url: url,
            alt_text: `${body.name} View ${idx + 1}`,
            sort_order: idx,
            is_primary: idx === 0 ? 1 : 0,
          })),
          variants: makeVariants(body.color_name || ''),
          sizes: [...STANDARD_SIZES],
          colors: [body.color_name || 'Standard'],
          inventory: {
            available_stock: totalStock,
            reserved_stock: 0,
            sold_quantity: 0,
            low_stock_threshold: Number(body.low_stock_threshold) || 5,
            stock_status: computeStockStatus(
              totalStock,
              Number(body.low_stock_threshold) || 5
            ),
            size_stock: sizeStock,
            updated_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        memoryState.products.push(newProd);
        return jsonResponse({ product: newProd }, 201);
      }

      if (pathname.startsWith('/api/admin/products/') && method === 'PUT') {
        const id = Number(pathname.slice('/api/admin/products/'.length));
        const idx = memoryState.products.findIndex((p) => p.id === id);
        if (idx === -1) return jsonResponse({ error: 'Product not found' }, 404);
        const existing = memoryState.products[idx];

        const regPrice =
          body.regular_price !== undefined
            ? Number(body.regular_price)
            : existing.regular_price;
        const discPrice =
          body.discounted_price !== undefined
            ? body.discounted_price
              ? Number(body.discounted_price)
              : null
            : existing.discounted_price;
        const effPrice = discPrice && discPrice < regPrice ? discPrice : regPrice;

        const sizeStock = body.size_stock
          ? { ...existing.inventory.size_stock, ...body.size_stock }
          : existing.inventory.size_stock ||
            distributeStock(existing.inventory.available_stock);
        const totalStock = Object.values(sizeStock).reduce(
          (s: number, n: any) => s + Number(n || 0),
          0
        );
        const imgs = Array.isArray(body.images)
          ? body.images.map((url: string, i: number) => ({
              id: i + 1,
              image_url: url,
              alt_text: `${body.name || existing.name} View ${i + 1}`,
              sort_order: i,
              is_primary: i === 0 ? 1 : 0,
            }))
          : existing.images;

        const updated = {
          ...existing,
          ...body,
          regular_price: regPrice,
          discounted_price: discPrice,
          effective_price: effPrice,
          primary_image: imgs[0]?.image_url || existing.primary_image,
          secondary_image:
            imgs[1]?.image_url || imgs[0]?.image_url || existing.secondary_image,
          images: imgs,
          sizes: [...STANDARD_SIZES],
          inventory: {
            ...existing.inventory,
            available_stock: totalStock,
            low_stock_threshold:
              body.low_stock_threshold !== undefined
                ? Number(body.low_stock_threshold)
                : existing.inventory.low_stock_threshold,
            size_stock: sizeStock,
            stock_status: computeStockStatus(
              totalStock,
              body.low_stock_threshold !== undefined
                ? Number(body.low_stock_threshold)
                : existing.inventory.low_stock_threshold
            ),
            updated_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        };

        memoryState.products[idx] = updated;
        return jsonResponse({ product: updated });
      }

      if (pathname.startsWith('/api/admin/products/') && method === 'DELETE') {
        const id = Number(pathname.slice('/api/admin/products/'.length));
        memoryState.products = memoryState.products.filter((p) => p.id !== id);
        return jsonResponse({ message: 'Product deleted successfully.' });
      }

      // 9. Admin Inventory
      if (pathname === '/api/admin/inventory' && method === 'GET') {
        return jsonResponse({
          products: memoryState.products,
          transactions: memoryState.transactions,
        });
      }

      const invMatch = pathname.match(/^\/api\/admin\/inventory\/(\d+)\/adjust$/);
      if (invMatch && method === 'POST') {
        const productId = Number(invMatch[1]);
        const idx = memoryState.products.findIndex((p) => p.id === productId);
        if (idx === -1) return jsonResponse({ error: 'Product not found' }, 404);
        const prod = memoryState.products[idx];
        const prevAvail = prod.inventory.available_stock;
        const sizeStock = {
          ...(prod.inventory.size_stock || distributeStock(prevAvail)),
        };
        const qty = Math.max(0, Math.floor(Number(body.quantity) || 0));

        if (body.size && STANDARD_SIZES.includes(body.size)) {
          const cur = Number(sizeStock[body.size] ?? 0);
          if (body.mode === 'set') sizeStock[body.size] = qty;
          else if (body.mode === 'increase') sizeStock[body.size] = cur + qty;
          else if (body.mode === 'decrease') {
            if (cur - qty < 0) {
              return jsonResponse(
                { error: `Cannot decrease ${body.size} stock below 0.` },
                400
              );
            }
            sizeStock[body.size] = cur - qty;
          }
        } else {
          let nextTotal = prevAvail;
          if (body.mode === 'set') nextTotal = qty;
          else if (body.mode === 'increase') nextTotal = prevAvail + qty;
          else if (body.mode === 'decrease') nextTotal = Math.max(0, prevAvail - qty);
          Object.assign(sizeStock, distributeStock(nextTotal));
        }

        const newAvail = Object.values(sizeStock).reduce(
          (s: number, n: any) => s + Number(n || 0),
          0
        );
        const threshold =
          body.low_stock_threshold !== undefined
            ? Number(body.low_stock_threshold)
            : prod.inventory.low_stock_threshold;

        prod.inventory = {
          ...prod.inventory,
          available_stock: newAvail,
          low_stock_threshold: threshold,
          size_stock: sizeStock,
          stock_status: computeStockStatus(newAvail, threshold),
          updated_at: new Date().toISOString(),
        };

        memoryState.transactions.unshift({
          id: memoryState.transactions.length + 1,
          product_id: prod.id,
          product_name: prod.name,
          product_sku: prod.sku,
          order_id: null,
          order_number: null,
          change_type: newAvail >= prevAvail ? 'restock' : 'manual_adjustment',
          quantity_delta: newAvail - prevAvail,
          previous_available: prevAvail,
          new_available: newAvail,
          previous_reserved: prod.inventory.reserved_stock,
          new_reserved: prod.inventory.reserved_stock,
          note: body.note || `Adjusted ${body.size || 'stock'} (${body.mode})`,
          performed_by: 'Admin',
          created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });

        memoryState.products[idx] = prod;
        return jsonResponse({ product: prod });
      }

      // 10. Admin Orders
      if (pathname === '/api/admin/orders' && method === 'GET') {
        await loadOrdersFromD1IfAvailable(env.DB);
        let orders = [...memoryState.orders];
        const status = urlObj.searchParams.get('status');
        const search = urlObj.searchParams.get('search');
        if (status && status !== 'All') {
          orders = orders.filter((o) => o.status === status);
        }
        if (search && search.trim()) {
          const q = search.trim().toLowerCase();
          orders = orders.filter(
            (o) =>
              o.order_number.toLowerCase().includes(q) ||
              o.customer_name.toLowerCase().includes(q) ||
              o.customer_phone.toLowerCase().includes(q)
          );
        }
        return jsonResponse({ orders });
      }

      const orderStatusMatch = pathname.match(/^\/api\/admin\/orders\/(\d+)\/status$/);
      if (orderStatusMatch && method === 'PATCH') {
        await loadOrdersFromD1IfAvailable(env.DB);
        const id = Number(orderStatusMatch[1]);
        const idx = memoryState.orders.findIndex((o) => o.id === id);
        if (idx === -1) return jsonResponse({ error: 'Order not found' }, 404);
        const order = memoryState.orders[idx];
        const status = body.status;
        const validStatuses = [
          'Pending',
          'Confirmed',
          'Processing',
          'Shipped',
          'Delivered',
          'Cancelled',
        ];
        if (!status || !validStatuses.includes(status)) {
          return jsonResponse({ error: 'Invalid order status.' }, 400);
        }

        const isConfirming = [
          'Confirmed',
          'Processing',
          'Shipped',
          'Delivered',
        ].includes(status);

        if (isConfirming && !order.stock_deducted) {
          for (const item of order.items || []) {
            const p = memoryState.products.find((pr) => pr.id === item.product_id);
            if (p && p.inventory.size_stock) {
              const sz = item.selected_size || 'Small';
              p.inventory.size_stock[sz] = Math.max(
                0,
                (p.inventory.size_stock[sz] || 0) - item.quantity
              );
              p.inventory.available_stock = Object.values(p.inventory.size_stock).reduce(
                (s: number, n: any) => s + Number(n || 0),
                0
              );
              p.inventory.sold_quantity += item.quantity;
              p.inventory.reserved_stock = Math.max(
                0,
                p.inventory.reserved_stock - item.quantity
              );
            }
          }
          order.stock_deducted = true;
          order.stock_reserved = false;
        }

        order.status = status;
        memoryState.orders[idx] = order;

        if (env.DB) {
          await env.DB.prepare(
            `UPDATE orders
             SET status = ?, stock_deducted = ?, stock_reserved = ?, updated_at = datetime('now')
             WHERE id = ?`
          )
            .bind(
              order.status,
              order.stock_deducted ? 1 : 0,
              order.stock_reserved ? 1 : 0,
              order.id
            )
            .run();
        }

        return jsonResponse({ order });
      }

      // 11. Admin Settings
      if (pathname === '/api/admin/settings' && method === 'GET') {
        return jsonResponse({ settings: memoryState.settings });
      }

      if (pathname === '/api/admin/settings' && method === 'PUT') {
        const cleanWa = String(
          body.whatsapp_number || memoryState.settings.whatsapp_number || ''
        )
          .replace(/\D/g, '')
          .replace(/^0/, '92');
        memoryState.settings = {
          ...memoryState.settings,
          ...body,
          whatsapp_clean: cleanWa || memoryState.settings.whatsapp_clean,
          updated_at: new Date().toISOString(),
        };
        return jsonResponse({ settings: memoryState.settings });
      }

      return jsonResponse({ error: `Endpoint not found: ${method} ${pathname}` }, 404);
    } catch (err: any) {
      console.error('[Cloudflare Worker Unhandled API Error]', {
        pathname,
        method,
        message: err?.message,
        stack: err?.stack,
      });
      return jsonResponse({ error: err?.message || 'Internal Worker Error' }, 500);
    }
  },
};
