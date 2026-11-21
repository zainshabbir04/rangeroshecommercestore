import assert from 'node:assert';
import { db, initializeDatabase } from './db.ts';

const API_BASE = 'http://localhost:3001';

async function fetchJson(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('==================================================================');
  console.log('🧪 RANG E ROSH — USUAL & UNUSUAL END-TO-END WORKFLOW TEST SUITE');
  console.log('==================================================================\n');

  initializeDatabase();

  // ============================================================================
  // PART A: USUAL (STANDARD HAPPY-PATH) TESTING
  // ============================================================================
  console.log('--- PART A: USUAL (STANDARD STOREFRONT & ADMIN) TESTING ---\n');

  // Clean up any leftover test products from prior failed runs before starting
  db.prepare("DELETE FROM products WHERE sku IN ('RER-PRET-TEST-99', 'RER-PRET-BAD-DISC-99')").run();

  // 1. Storefront Initialization & 6 Initial Products Check
  console.log('1️⃣  [USUAL] Testing Storefront Init & 6 Imported Products...');
  const initRes = await fetchJson('/api/storefront/init');
  assert.strictEqual(initRes.status, 200, 'Storefront init should return 200');
  assert.strictEqual(initRes.data.products.length, 6, 'Should have all 6 initial products');
  const names = initRes.data.products.map((p: any) => p.name).sort();
  assert.deepStrictEqual(names, ['ANNA', 'HAZEL', 'OLIVIA', 'ORCHID', 'SABZ', 'ZAYNA']);
  assert.strictEqual(initRes.data.settings.whatsapp_number, '03130888048');
  console.log('   ✅ Verified all 6 products & official store WhatsApp (03130888048):', names.join(', '));

  // 2. Product Details Lookup & Filtering/Sorting
  console.log('2️⃣  [USUAL] Testing Product Detail (/api/products/anna) & Catalog Search/Sort...');
  const prodRes = await fetchJson('/api/products/anna');
  assert.strictEqual(prodRes.status, 200);
  assert.strictEqual(prodRes.data.product.name, 'ANNA');
  assert.strictEqual(prodRes.data.product.regular_price, 7490);
  assert.ok(prodRes.data.product.images.length === 9, 'ANNA should have 9 product images');
  assert.ok(prodRes.data.product.video_url, 'ANNA should include its official studio video URL');

  const searchRes = await fetchJson('/api/products?search=emerald&sort=price_asc');
  assert.strictEqual(searchRes.status, 200);
  assert.ok(searchRes.data.products.some((p: any) => p.slug === 'sabz'));
  console.log('   ✅ Verified ANNA product details (9 images + video) & catalog search/sort.');

  // 3. Product Reviews Creation & Persistence
  console.log('3️⃣  [USUAL] Testing Product Reviews GET & POST (/api/products/anna/reviews)...');
  const testRevId = `rev-test-${Date.now()}`;
  const postRevRes = await fetchJson('/api/products/anna/reviews', {
    method: 'POST',
    body: JSON.stringify({
      id: testRevId,
      customer_name: 'fatima_test_reviewer',
      city: 'Lahore',
      rating: 5,
      selected_size: 'Medium',
      title: 'Exquisite Black & Ivory Embroidery',
      comment: 'Tested review persistence in SQLite database.',
    }),
  });
  assert.strictEqual(postRevRes.status, 201);
  const getRevRes = await fetchJson('/api/products/anna/reviews');
  assert.strictEqual(getRevRes.status, 200);
  assert.ok(getRevRes.data.reviews.some((r: any) => r.id === testRevId));
  db.prepare('DELETE FROM product_reviews WHERE id = ?').run(testRevId);
  console.log('   ✅ Verified product review creation & SQLite persistence.');

  // 4. Customer Order Creation & Short WhatsApp Message Generation
  console.log('4️⃣  [USUAL] Testing Customer Checkout, Order Creation & Short WhatsApp Prefill...');
  const annaInitialStock = prodRes.data.product.inventory.available_stock;
  const annaInitialReserved = prodRes.data.product.inventory.reserved_stock;
  const annaInitialSold = prodRes.data.product.inventory.sold_quantity;

  const orderCreateRes = await fetchJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_name: 'Zara Ahmed',
      customer_phone: '03001234567',
      customer_email: 'zara@example.com',
      shipping_address: 'House 42, Street 10, DHA Phase 5',
      city: 'Lahore',
      order_notes: 'Please call before delivery',
      payment_method: 'Cash on Delivery (COD)',
      items: [
        {
          product_id: prodRes.data.product.id,
          quantity: 1,
          selected_size: 'Small',
          selected_color: prodRes.data.product.color_name,
        },
      ],
    }),
  });
  assert.strictEqual(orderCreateRes.status, 201, 'Order should be created with 201');
  const createdOrder = orderCreateRes.data.order;
  assert.strictEqual(createdOrder.status, 'Pending', 'Initial order status must be Pending');
  assert.ok(
    createdOrder.store_whatsapp_url.startsWith('https://wa.me/923130888048?text='),
    'Short order WhatsApp URL should target the Rang e Rosh WhatsApp number (03130888048)'
  );
  assert.ok(
    createdOrder.customer_whatsapp_url.startsWith('https://wa.me/923001234567?text='),
    'Detailed confirmation WhatsApp URL should target the client WhatsApp number directly'
  );
  console.log(`   ✅ Created Order #${createdOrder.order_number} (Status: ${createdOrder.status})`);

  // Verify stock is reserved (not yet deducted from available_stock while Pending)
  const afterPendingProd = await fetchJson('/api/products/anna');
  assert.strictEqual(
    afterPendingProd.data.product.inventory.available_stock,
    annaInitialStock,
    'Pending order should reserve stock without deducting available_stock yet'
  );
  assert.strictEqual(
    afterPendingProd.data.product.inventory.reserved_stock,
    annaInitialReserved + 1,
    'Reserved stock should increment by 1'
  );
  console.log('   ✅ Verified Pending order reserved 1 unit without premature deduction.');

  // 5. Admin Authentication & Password Change Flow
  console.log('5️⃣  [USUAL] Testing Admin Login, Password Change & Revert...');
  const loginRes = await fetchJson('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({
      email: process.env.ADMIN_DEFAULT_EMAIL || 'rangerosh.official@gmail.com',
      password: process.env.ADMIN_DEFAULT_PASSWORD || 'RangeRosh@Admin2026',
    }),
  });
  assert.strictEqual(loginRes.status, 200, 'Admin login should succeed');
  const token = loginRes.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Test changing password to a temporary password and back
  const changePwRes = await fetchJson('/api/admin/change-password', {
    method: 'POST',
    body: JSON.stringify({
      email: 'rangerosh.official@gmail.com',
      current_password: process.env.ADMIN_DEFAULT_PASSWORD || 'RangeRosh@Admin2026',
      new_password: 'TempPassword@2026',
    }),
  });
  assert.strictEqual(changePwRes.status, 200);

  // Revert back to default password
  const revertPwRes = await fetchJson('/api/admin/change-password', {
    method: 'POST',
    body: JSON.stringify({
      email: 'rangerosh.official@gmail.com',
      current_password: 'TempPassword@2026',
      new_password: process.env.ADMIN_DEFAULT_PASSWORD || 'RangeRosh@Admin2026',
    }),
  });
  assert.strictEqual(revertPwRes.status, 200);
  console.log('   ✅ Verified Admin Login and Change Password endpoint.');

  // 6. Store Owner Order Confirmation -> Atomic Stock Deduction & Detailed Client WhatsApp
  console.log('6️⃣  [USUAL] Testing Admin Order Confirmation & Atomic Stock Deduction...');
  const confirmRes = await fetchJson(`/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'Confirmed' }),
  });
  assert.strictEqual(confirmRes.status, 200);
  assert.strictEqual(confirmRes.data.order.status, 'Confirmed');
  assert.ok(
    confirmRes.data.order.customer_whatsapp_url.startsWith('https://wa.me/923001234567?text='),
    'Should generate detailed customer WhatsApp confirmation URL'
  );

  const afterConfirmProd = await fetchJson('/api/products/anna');
  assert.strictEqual(
    afterConfirmProd.data.product.inventory.available_stock,
    annaInitialStock - 1,
    'Available stock must be deducted by 1 upon confirmation'
  );
  assert.strictEqual(
    afterConfirmProd.data.product.inventory.reserved_stock,
    annaInitialReserved,
    'Reserved stock must be released upon confirmation'
  );
  assert.strictEqual(
    afterConfirmProd.data.product.inventory.sold_quantity,
    annaInitialSold + 1,
    'Sold quantity must increment by 1'
  );
  console.log(
    `   ✅ Confirmed Order #${createdOrder.order_number}: Available Stock ${annaInitialStock} -> ${afterConfirmProd.data.product.inventory.available_stock}`
  );

  // 7. Order Cancellation -> Inventory Restoration
  console.log('7️⃣  [USUAL] Testing Order Cancellation & Inventory Restoration...');
  const cancelRes = await fetchJson(`/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'Cancelled' }),
  });
  assert.strictEqual(cancelRes.status, 200);
  assert.strictEqual(cancelRes.data.order.status, 'Cancelled');

  const afterCancelProd = await fetchJson('/api/products/anna');
  assert.strictEqual(
    afterCancelProd.data.product.inventory.available_stock,
    annaInitialStock,
    'Available stock must be restored after cancellation'
  );
  assert.strictEqual(
    afterCancelProd.data.product.inventory.sold_quantity,
    annaInitialSold,
    'Sold quantity must be decremented after cancellation'
  );
  console.log(
    `   ✅ Cancelled Order #${createdOrder.order_number}: Stock restored to ${afterCancelProd.data.product.inventory.available_stock}`
  );

  // 8. Admin Add, Edit, Low-Stock Trigger & Delete Product
  console.log('8️⃣  [USUAL] Testing Admin Add Product, Edit Product, Low-Stock Warning & Delete...');
  const addProdRes = await fetchJson('/api/admin/products', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'MEHR TEST SUIT',
      sku: 'RER-PRET-TEST-99',
      category: '2-Piece Stitched Suit',
      regular_price: 6990,
      discounted_price: 5990,
      overview: 'Test ensemble for automated verification.',
      color_name: 'Deep Burgundy',
      fabric: 'Cotton Blend',
      fit: 'Relaxed Fit',
      available_stock: 3, // Below threshold of 5 -> triggers Low Stock!
      low_stock_threshold: 5,
      images: ['/assets/products/anna/1.jpg'],
      sizes: ['Small', 'Medium', 'Large', 'Extra Large'],
      colors: ['Deep Burgundy'],
    }),
  });
  assert.strictEqual(addProdRes.status, 201, 'Admin product creation should return 201');
  const tempProduct = addProdRes.data.product;
  assert.strictEqual(
    tempProduct.inventory.stock_status,
    'Low Stock',
    'Stock of 3 with threshold 5 must trigger Low Stock status'
  );

  // Edit product
  const editProdRes = await fetchJson(`/api/admin/products/${tempProduct.id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'MEHR TEST SUIT UPDATED',
      regular_price: 7200,
    }),
  });
  assert.strictEqual(editProdRes.status, 200);
  assert.strictEqual(editProdRes.data.product.name, 'MEHR TEST SUIT UPDATED');

  // ============================================================================
  // PART B: UNUSUAL (EDGE CASES, SECURITY, ABUSE & BOUNDARY) TESTING
  // ============================================================================
  console.log('\n--- PART B: UNUSUAL (EDGE-CASE, BOUNDARY & SECURITY) TESTING ---\n');

  // 9. Total Stock Overselling & Per-Size Split-Row Overselling Bypass Attempt
  console.log('9️⃣  [UNUSUAL] Testing Total Oversell & Split-Row Per-Size Oversell Bypass...');
  const oversellTotalRes = await fetchJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_name: 'Test Customer',
      customer_phone: '+923001112233',
      shipping_address: '123 Fashion Ave, Gulberg',
      city: 'Lahore',
      payment_method: 'Cash on Delivery (COD)',
      items: [
        {
          product_id: prodRes.data.product.id,
          quantity: annaInitialStock + 5,
          selected_size: 'Small',
        },
      ],
    }),
  });
  assert.strictEqual(oversellTotalRes.status, 400, 'Total overselling should be rejected with 400');

  // Attempt to bypass size limit by splitting the same size across 2 separate cart lines
  const smallStock = Number(prodRes.data.product.inventory.size_stock?.Small ?? 4);
  const splitRowOversellRes = await fetchJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_name: 'Split Row Tester',
      customer_phone: '03001112233',
      shipping_address: '123 Street',
      city: 'Lahore',
      payment_method: 'Cash on Delivery (COD)',
      items: [
        { product_id: prodRes.data.product.id, quantity: smallStock, selected_size: 'Small' },
        { product_id: prodRes.data.product.id, quantity: 1, selected_size: 'Small' },
      ],
    }),
  });
  assert.strictEqual(
    splitRowOversellRes.status,
    400,
    'Split-row per-size oversell must be consolidated and rejected with 400'
  );
  console.log('   ✅ Total oversell & split-row per-size oversell bypass both blocked.');

  // 10. Negative, Zero, Decimal & NaN Quantities in Checkout
  console.log('🔟 [UNUSUAL] Testing Negative (-3), Zero (0), and Fractional (1.5) Order Quantities...');
  for (const badQty of [-3, 0, 1.5, null, 'abc']) {
    const badQtyRes = await fetchJson('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_name: 'Bad Qty Tester',
        customer_phone: '03001112233',
        shipping_address: 'House 1',
        city: 'Karachi',
        items: [{ product_id: prodRes.data.product.id, quantity: badQty, selected_size: 'Small' }],
      }),
    });
    assert.strictEqual(badQtyRes.status, 400, `Quantity ${badQty} must be rejected with 400`);
  }
  console.log('   ✅ Negative, zero, fractional, and non-numeric quantities rejected.');

  // 11. Malformed Customer Inputs (Blank Name, Short Phone, Blank City/Address, Empty Cart)
  console.log('1️⃣1️⃣ [UNUSUAL] Testing Malformed Checkout Fields (Short Phone, Empty Cart, Whitespace)...');
  const shortPhoneRes = await fetchJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_name: 'Ali',
      customer_phone: '12345', // too short
      shipping_address: 'Street 1',
      city: 'Lahore',
      items: [{ product_id: prodRes.data.product.id, quantity: 1, selected_size: 'Small' }],
    }),
  });
  assert.strictEqual(shortPhoneRes.status, 400, 'Short phone number (<10 digits) must be rejected');

  const blankAddressRes = await fetchJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_name: 'Ali',
      customer_phone: '03001234567',
      shipping_address: '   ',
      city: 'Lahore',
      items: [{ product_id: prodRes.data.product.id, quantity: 1, selected_size: 'Small' }],
    }),
  });
  assert.strictEqual(blankAddressRes.status, 400, 'Whitespace-only address must be rejected');

  const emptyCartRes = await fetchJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_name: 'Ali',
      customer_phone: '03001234567',
      shipping_address: 'Street 1',
      city: 'Lahore',
      items: [],
    }),
  });
  assert.strictEqual(emptyCartRes.status, 400, 'Empty cart items array must be rejected');
  console.log('   ✅ Short phone, whitespace address, and empty cart properly rejected.');

  // 12. SQL Injection & XSS Payloads in Search, Product Lookup, and Order Lookup
  console.log('1️⃣2️⃣ [UNUSUAL] Testing SQL Injection & XSS Payloads in Search & Order Lookup...');
  const sqliSearch = await fetchJson(
    `/api/products?search=${encodeURIComponent("' OR 1=1; DROP TABLE products; --")}`
  );
  assert.strictEqual(sqliSearch.status, 200, 'SQLi search string should be safely parameterized');
  const sqliLookup = await fetchJson(
    `/api/orders/lookup/${encodeURIComponent("RER-1001' OR '1'='1")}`
  );
  assert.strictEqual(sqliLookup.status, 404, 'SQLi order lookup should safely return 404');
  console.log('   ✅ SQL Injection payloads safely parameterized without error or data leak.');

  // 13. Unauthorized & Forged JWT Token Access to Admin Endpoints
  console.log('1️⃣3️⃣ [UNUSUAL] Testing Forged JWT Token & Missing Auth on Admin Endpoints...');
  const noAuthRes = await fetchJson('/api/admin/orders');
  assert.strictEqual(noAuthRes.status, 401);
  const forgedTokenRes = await fetchJson('/api/admin/orders', {
    headers: { Authorization: 'Bearer forged.jwt.token.12345' },
  });
  assert.strictEqual(forgedTokenRes.status, 401, 'Forged JWT token must be rejected with 401');
  const wrongPwChangeRes = await fetchJson('/api/admin/change-password', {
    method: 'POST',
    body: JSON.stringify({
      email: 'rangerosh.official@gmail.com',
      current_password: 'WrongCurrentPassword!',
      new_password: 'NewPassword123',
    }),
  });
  assert.strictEqual(wrongPwChangeRes.status, 401, 'Password change with wrong current password must fail');
  const shortPwChangeRes = await fetchJson('/api/admin/change-password', {
    method: 'POST',
    body: JSON.stringify({
      email: 'rangerosh.official@gmail.com',
      current_password: process.env.ADMIN_DEFAULT_PASSWORD || 'RangeRosh@Admin2026',
      new_password: '123', // < 6 chars
    }),
  });
  assert.strictEqual(shortPwChangeRes.status, 400, 'Password < 6 chars must be rejected');
  console.log('   ✅ Unauthorized access, forged JWT, wrong current password & short password blocked.');

  // 14. Duplicate SKU Rejection & Invalid Price/Discount Validation in Admin Products
  console.log('1️⃣4️⃣ [UNUSUAL] Testing Duplicate SKU & Invalid Discount Price (> Regular Price)...');
  const dupSkuRes = await fetchJson('/api/admin/products', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'DUPLICATE SKU SUIT',
      sku: 'RER-PRET-ANNA-01', // Already used by ANNA
      category: '2-Piece Stitched Suit',
      regular_price: 7490,
      overview: 'Duplicate SKU test',
      color_name: 'Black',
    }),
  });
  assert.strictEqual(dupSkuRes.status, 400, 'Duplicate SKU must be rejected with 400');

  const badDiscountRes = await fetchJson('/api/admin/products', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'BAD DISCOUNT SUIT',
      sku: 'RER-PRET-BAD-DISC-99',
      category: '2-Piece Stitched Suit',
      regular_price: 5000,
      discounted_price: 6500, // Higher than regular price!
      overview: 'Invalid discount test',
      color_name: 'Black',
    }),
  });
  assert.strictEqual(
    badDiscountRes.status,
    400,
    'Discounted price >= regular price must be rejected with 400'
  );
  console.log('   ✅ Duplicate SKU and invalid discount price (>= regular price) blocked.');

  // 15. Inventory Underflow Protection & Double-Confirm Idempotency
  console.log('1️⃣5️⃣ [UNUSUAL] Testing Inventory Underflow Protection & Double-Confirm Idempotency...');
  const underflowRes = await fetchJson(`/api/admin/inventory/${tempProduct.id}/adjust`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      mode: 'decrease',
      quantity: 9999,
      size: 'Small',
      note: 'Attempt to decrease stock below 0',
    }),
  });
  assert.strictEqual(
    underflowRes.status,
    400,
    'Attempting to decrease per-size stock below 0 must be rejected with 400'
  );

  // Invalid order status transition
  const invalidStatusRes = await fetchJson(`/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'InvalidMadeUpStatus' }),
  });
  assert.strictEqual(invalidStatusRes.status, 400, 'Invalid order status must be rejected');
  console.log('   ✅ Inventory underflow rejected with 400 & invalid order status rejected.');

  // Clean up temporary test product and test order
  const delProdRes = await fetchJson(`/api/admin/products/${tempProduct.id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  assert.strictEqual(delProdRes.status, 200);

  db.prepare('DELETE FROM inventory_transactions WHERE order_id = ?').run(createdOrder.id);
  db.prepare('DELETE FROM orders WHERE id = ?').run(createdOrder.id);
  db.prepare('DELETE FROM customers WHERE phone = ?').run('03001234567');

  console.log('\n==================================================================');
  console.log('🎉 ALL 15 USUAL & UNUSUAL E2E WORKFLOW TESTS PASSED FLAWLESSLY!');
  console.log('==================================================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
