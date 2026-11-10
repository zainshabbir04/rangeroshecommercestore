-- ============================================================================
-- RANG E ROSH E-COMMERCE PLATFORM — RELATIONAL DATABASE SCHEMA
-- Compatible with PostgreSQL (Supabase) & SQLite
-- ============================================================================

-- 1. ADMIN USERS
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- 2. STORE SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  store_name TEXT NOT NULL DEFAULT 'Rang e Rosh',
  store_tagline TEXT NOT NULL DEFAULT 'Ladies Stitched Suits — Pret Collection',
  logo_url TEXT NOT NULL DEFAULT '/assets/logo/website-logo.jpg',
  contact_email TEXT NOT NULL DEFAULT 'rangerosh.official@gmail.com',
  contact_phone TEXT NOT NULL DEFAULT '+923 130 888 048',
  whatsapp_number TEXT NOT NULL DEFAULT '+923 200 300 552',
  shipping_charges REAL NOT NULL DEFAULT 250,
  free_shipping_threshold REAL NOT NULL DEFAULT 15000,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  currency TEXT NOT NULL DEFAULT 'PKR',
  announcement_text TEXT NOT NULL DEFAULT 'Complimentary Nationwide Shipping on Orders Above PKR 15,000 | WhatsApp Concierge Ordering Available',
  hero_badge TEXT NOT NULL DEFAULT 'RANG E ROSH — PRET COLLECTION',
  hero_title TEXT NOT NULL DEFAULT 'Timeless Craftsmanship in Every Thread',
  hero_subtitle TEXT NOT NULL DEFAULT 'Exquisitely tailored 2-piece stitched ensembles celebrating heritage embroidery, rich seasonal textures, and effortless modern silhouettes.',
  promo_banner_title TEXT NOT NULL DEFAULT 'The Artisan Embroidery Edit',
  promo_banner_subtitle TEXT NOT NULL DEFAULT 'From antique gold tilla on jewel-toned emerald to delicate schiffli cutwork on royal plum — discover statement two-piece suits tailored for poise and comfort.',
  instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/rangerosh/',
  youtube_url TEXT NOT NULL DEFAULT 'https://www.youtube.com/@rangerosh',
  tiktok_url TEXT NOT NULL DEFAULT 'https://www.tiktok.com/@rangerosh',
  facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/RangeRosh/',
  payment_methods_json TEXT NOT NULL DEFAULT '["Cash on Delivery (COD)", "Bank Transfer (Confirm via WhatsApp)"]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  collection_name TEXT NOT NULL DEFAULT 'Rang e Rosh Pret Collection',
  category TEXT NOT NULL DEFAULT '2-Piece Stitched Suit',
  regular_price REAL NOT NULL,
  discounted_price REAL,
  overview TEXT NOT NULL,
  product_type_detail TEXT NOT NULL DEFAULT '2-Piece Stitched Suit (Shirt + Trouser)',
  color_name TEXT NOT NULL,
  fabric TEXT NOT NULL DEFAULT '',
  fit TEXT NOT NULL DEFAULT 'Relaxed / Straight Fit',
  embroidered_details TEXT NOT NULL DEFAULT '',
  suit_stitching TEXT NOT NULL DEFAULT '',
  outfit_architecture TEXT NOT NULL DEFAULT '',
  wash_care TEXT NOT NULL DEFAULT '',
  color_disclaimer TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  is_featured INTEGER NOT NULL DEFAULT 1,
  is_new_arrival INTEGER NOT NULL DEFAULT 1,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. PRODUCT VARIANTS (Manageable sizes & colors via Admin Dashboard)
CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  size_label TEXT NOT NULL DEFAULT '',
  color_label TEXT NOT NULL DEFAULT '',
  sku_suffix TEXT NOT NULL DEFAULT '',
  additional_price REAL NOT NULL DEFAULT 0,
  is_available INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. INVENTORY (1-to-1 with Products for strict server-side stock & reservation tracking)
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  available_stock INTEGER NOT NULL DEFAULT 15,
  size_stock_json TEXT NOT NULL DEFAULT '{"Small":4,"Medium":4,"Large":4,"Extra Large":3}',
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. INVENTORY TRANSACTIONS (Complete audit history for every stock change)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  order_id INTEGER,
  change_type TEXT NOT NULL, -- 'initial_seed', 'manual_adjustment', 'order_reserved', 'order_confirmed', 'order_cancelled', 'restock'
  quantity_delta INTEGER NOT NULL,
  previous_available INTEGER NOT NULL,
  new_available INTEGER NOT NULL,
  previous_reserved INTEGER NOT NULL DEFAULT 0,
  new_reserved INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  performed_by TEXT NOT NULL DEFAULT 'System',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 8. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 1,
  total_spent REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 9. ORDERS
CREATE TABLE IF NOT EXISTS orders (
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
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  stock_deducted INTEGER NOT NULL DEFAULT 0, -- 1 once confirmed and deducted from available_stock
  stock_reserved INTEGER NOT NULL DEFAULT 1, -- 1 while pending (reserved), 0 after confirmed or cancelled
  whatsapp_message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- 10. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
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
  line_total REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 11. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
