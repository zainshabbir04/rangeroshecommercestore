# Rang e Rosh — Luxury Ladies Stitched Suits E-Commerce Platform

Official full-stack e-commerce storefront, inventory engine, WhatsApp order-confirmation workflow, and protected Admin Dashboard for **Rang e Rosh** (`Ladies Stitched Suits — Pret Collection`).

---

## 1. Brand Identity & Color Palette (Extracted from Original Logo)

All visual tokens are derived directly from `website logo/website logo.jpg`:

| Token | Hex | Source in Logo & Usage |
| :--- | :--- | :--- |
| **Warm Ivory Canvas** | `#FAF6F0` | Primary logo background canvas; main page background |
| **Soft Alabaster Cream** | `#F3ECE0` | Secondary section backgrounds & gallery frames |
| **Deep Royal Plum** | `#3A1042` | Dominant serif `"R"` monogram; primary buttons, headers & badges |
| **Berry Rose Script** | `#8C2D56` | Italic script `"e"` & ribbon accent; secondary accents & hover states |
| **Midnight Navy** | `#161F33` | `"RANG"` & `"ROSH"` serif typography; body text & footer background |
| **Antique Burnished Gold** | `#B8862D` | Circular double frame, `"CLOTHING"` lettering & lotus motif; borders & highlights |
| **Peacock Teal** | `#2E6F73` | Botanical wreath & inner `"R"` stroke; In-Stock & WhatsApp confirmation badges |

---

## 2. Imported Initial Products (All 6 Original Ensembles)

All 6 original product folders and descriptions in `product name pic & detail/` are non-destructively synced to `public/assets/products/` and seeded into the database:

1. **ANNA** (`RER-PRET-ANNA-01`) — **PKR 7,490**
   - *Source Folder:* `ANNA Black 7490` (9 high-res photos + 1 studio video reel)
   - *Description File:* `ANNA Product  Review.txt`
   - *Color:* Classic Black with Ivory/Off-White Embroidery
   - *Fit:* Relaxed / Straight Fit (`2-Piece Stitched Suit (Shirt + Trouser)`)
2. **HAZEL** (`RER-PRET-HAZEL-02`) — **PKR 7,490**
   - *Source Folder:* `HAZEL Red 7490` (9 high-res photos + 1 studio video reel)
   - *Description File:* `HAZEL Product  Review.txt`
   - *Color:* Cranberry Red with Floral Embroidery
   - *Fit:* Relaxed / Straight Fit (`2-Piece Stitched Suit (Shirt + Trouser)`)
3. **OLIVIA** (`RER-PRET-OLIVIA-03`) — **PKR 8,999**
   - *Source Folder:* `4-Nishat Green 8999` (6 high-res photos)
   - *Description File:* `OLIVIA Product  Review.txt`
   - *Color:* Deep Olive Green with Multi-color (Magenta, Teal, Gold) Threadwork
   - *Fabric & Fit:* Premium Cotton / Linen Blend — Relaxed Straight Fit
4. **ORCHID** (`RER-PRET-ORCHID-04`) — **PKR 11,450**
   - *Source Folder:* `5-AZURE Orchid Purple 11450` (8 high-res photos)
   - *Description File:* `Orchid Product  Review.txt`
   - *Color:* Deep Plum / Royal Purple with Peach, Lavender & Ochre Embroidery
   - *Fabric & Fit:* Premium Smooth Viscose / Cotton Blend — Relaxed Straight Silhouette with Graceful Drape
5. **SABZ** (`RER-PRET-SABZ-05`) — **PKR 8,450**
   - *Source Folder:* `6-daria 8450 Green` (11 high-res photos)
   - *Description File:* `SABZ Product  Review.txt`
   - *Color:* Deep Emerald Green with Antique Gold & Tonal Green Threadwork
   - *Fabric & Fit:* Premium Smooth Viscose Silk / Cotton Blend — Relaxed Longline Straight Cut
6. **ZAYNA** (`RER-PRET-ZAYNA-06`) — **PKR 4,700**
   - *Source Folder:* `3-diners Rust 4700` (4 high-res photos)
   - *Description File:* `ZAYNA Product  Review.txt`
   - *Color:* Mustard Yellow with Maroon & Cream Accents
   - *Fabric & Fit:* Premium Cotton / Viscose Blend — Straight Cut / Relaxed Fit

---

## 3. Database Schema & Backend Architecture

- **Schema File:** `supabase/schema.sql` (compatible with both SQLite via Node's native `node:sqlite` and PostgreSQL / Supabase).
- **Database Entities:**
  1. `admin_users` — Authenticated store administrators (`bcrypt` password hashes + JWT tokens).
  2. `store_settings` — Store name, logo, WhatsApp numbers, shipping charges, free shipping threshold, social links, payment methods, and homepage promotional copy.
  3. `products` — Complete product catalog with unique `slug` and `sku`.
  4. `product_images` — Multi-image gallery records per product.
  5. `product_variants` — Admin-manageable size/fit and color variants.
  6. `inventory` — Server-side `available_stock`, `reserved_stock`, `sold_quantity`, and `low_stock_threshold`.
  7. `inventory_transactions` — Immutable audit log for every stock event (`initial_seed`, `order_reserved`, `order_confirmed`, `order_cancelled`, `restock`, `manual_adjustment`).
  8. `customers` — Customer profiles, contact info, order count, and lifetime spend.
  9. `orders` — Order header, status (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), stock reservation flags, and prepared WhatsApp message.
  10. `order_items` — Line items per order.
  11. `newsletter_subscribers` — Subscribed customer emails.

---

## 4. Admin Account Setup & Default Credentials

Admin credentials are configured in `.env` (see `.env.example`):

- **Admin Login URL:** `http://localhost:5173/admin/login`
- **Default Admin Email:** `rangerosh.official@gmail.com`
- **Default Admin Password:** `RangeRosh@Admin2026`

To change the default admin credentials before first seed, update `ADMIN_DEFAULT_EMAIL` and `ADMIN_DEFAULT_PASSWORD` in `.env` and run `npm run seed`.

---

## 5. WhatsApp Order Confirmation Workflow

1. **Customer Checkout (`POST /api/orders`):**
   - Validates requested quantities against live `available_stock` on the server.
   - Saves the order with status `Pending` and reserves stock in `inventory`.
   - Generates a formatted itemized WhatsApp message containing Order ID, Customer Name, Phone, Delivery Address, Product Names/Quantities/Prices, Subtotal, Shipping, and Grand Total.
   - Opens `https://wa.me/<STORE_WHATSAPP>?text=...` addressed to the configured store WhatsApp number (`+923 200 300 552`, configurable in `/admin/settings`) so the customer can review and manually press **Send**.
2. **Store Owner Confirmation (`/admin/orders`):**
   - Store owner views incoming orders, customer details, and itemized totals.
   - Clicking **Confirm Order** atomically deducts `available_stock`, releases `reserved_stock`, increments `sold_quantity`, and logs an `order_confirmed` transaction.
   - Clicking **Reject / Cancel** releases reserved stock (or restores deducted stock if previously confirmed) and logs an `order_cancelled` transaction.
   - Automatically prepares a personalized WhatsApp confirmation message addressed to the customer's phone number (`https://wa.me/<CUSTOMER_PHONE>?text=...`) for the store owner to review and manually send.

---

## 6. Local Development Instructions

```bash
# 1. Install dependencies
npm install

# 2. Initialize database & non-destructively sync original product assets
npm run seed

# 3. Start full-stack development server (Express API on :3001 + Vite Frontend on :5173)
npm run dev

# 4. Run automated end-to-end workflow test suite
npm run test:e2e
```

---

## 7. Production Build & Deployment Instructions

```bash
# 1. Build TypeScript & Vite production bundle into ./dist
npm run build

# 2. Start production server (serves both API and built frontend on PORT=3001)
npm start
```
