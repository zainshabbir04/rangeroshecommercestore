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
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('==========================================================');
  console.log('🧪 RANG E ROSH — END-TO-END WORKFLOW TEST SUITE');
  console.log('==========================================================\n');

  initializeDatabase();

  // 1. Storefront Initialization & 6 Initial Products Check
  console.log('1️⃣  Testing Storefront Init & 6 Imported Products...');
  const initRes = await fetchJson('/api/storefront/init');
  assert.strictEqual(initRes.status, 200, 'Storefront init should return 200');
  assert.strictEqual(initRes.data.products.length, 6, 'Should have all 6 initial products');
  const names = initRes.data.products.map((p: any) => p.name).sort();
  assert.deepStrictEqual(names, ['ANNA', 'HAZEL', 'OLIVIA', 'ORCHID', 'SABZ', 'ZAYNA']);
  console.log('   ✅ Verified all 6 products:', names.join(', '));

  // 2. Product Details Lookup
  console.log('2️⃣  Testing Product Detail Endpoint (/api/products/anna)...');
  const prodRes = await fetchJson('/api/products/anna');
  assert.strictEqual(prodRes.status, 200);
  assert.strictEqual(prodRes.data.product.name, 'ANNA');
  assert.strictEqual(prodRes.data.product.regular_price, 7490);
  assert.ok(prodRes.data.product.images.length === 9, 'ANNA should have 9 product images');
  assert.ok(prodRes.data.product.video_url, 'ANNA should include its official studio video URL');
  console.log('   ✅ Verified ANNA product details, 9 images & video URL.');

  // 3. Prevent Overselling (Ordering more than available stock)
  console.log('3️⃣  Testing Inventory Protection Against Overselling...');
  const annaInitialStock = prodRes.data.product.inventory.available_stock;
  const oversellRes = await fetchJson('/api/orders', {
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
          selected_size: 'Relaxed / Straight Fit',
          selected_color: prodRes.data.product.color_name,
        },
      ],
    }),
  });
  assert.strictEqual(oversellRes.status, 400, 'Overselling should be rejected with 400');
  console.log('   ✅ Oversell attempt blocked:', oversellRes.data.error);

  // 4. Customer Order Creation & WhatsApp Message Generation
  console.log('4️⃣  Testing Customer Checkout, Order Creation & WhatsApp Prefill...');
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
          quantity: 2,
          selected_size: 'Relaxed / Straight Fit',
          selected_color: prodRes.data.product.color_name,
        },
      ],
    }),
  });
  assert.strictEqual(orderCreateRes.status, 201, 'Order should be created with 201');
  const createdOrder = orderCreateRes.data.order;
  assert.strictEqual(createdOrder.status, 'Pending', 'Initial order status must be Pending');
  assert.ok(createdOrder.whatsapp_message.includes(createdOrder.order_number));
  assert.ok(
    createdOrder.whatsapp_url.startsWith('https://wa.me/923001234567?text='),
    'WhatsApp URL should target the client WhatsApp number directly'
  );
  console.log(`   ✅ Created Order #${createdOrder.order_number} (Status: ${createdOrder.status})`);
  console.log(`   ✅ Generated Store-to-Client WhatsApp URL: ${createdOrder.whatsapp_url.slice(0, 65)}...`);

  // Verify stock is reserved (not yet deducted from available_stock while Pending)
  const afterPendingProd = await fetchJson('/api/products/anna');
  assert.strictEqual(
    afterPendingProd.data.product.inventory.available_stock,
    annaInitialStock,
    'Pending order should reserve stock without deducting available_stock yet'
  );
  assert.strictEqual(
    afterPendingProd.data.product.inventory.reserved_stock,
    2,
    'Reserved stock should be 2'
  );
  console.log('   ✅ Verified Pending order reserved 2 units without premature deduction.');

  // 5. Admin Authentication
  console.log('5️⃣  Testing Admin Login & Protected Route Security...');
  const unauthRes = await fetchJson('/api/admin/dashboard');
  assert.strictEqual(unauthRes.status, 401, 'Unauthenticated admin access must be rejected');

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
  console.log('   ✅ Admin authenticated & unauthorized request blocked.');

  // 6. Store Owner Order Confirmation -> Atomic Stock Deduction & Customer WhatsApp Confirmation
  console.log('6️⃣  Testing Admin Order Confirmation & Atomic Stock Deduction...');
  const confirmRes = await fetchJson(`/api/admin/orders/${createdOrder.id}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'Confirmed' }),
  });
  assert.strictEqual(confirmRes.status, 200);
  assert.strictEqual(confirmRes.data.order.status, 'Confirmed');
  assert.ok(
    confirmRes.data.order.customer_whatsapp_url.startsWith('https://wa.me/923001234567?text='),
    'Should generate customer WhatsApp confirmation URL'
  );

  const afterConfirmProd = await fetchJson('/api/products/anna');
  assert.strictEqual(
    afterConfirmProd.data.product.inventory.available_stock,
    annaInitialStock - 2,
    'Available stock must be deducted by 2 upon confirmation'
  );
  assert.strictEqual(
    afterConfirmProd.data.product.inventory.reserved_stock,
    0,
    'Reserved stock must be released upon confirmation'
  );
  assert.strictEqual(
    afterConfirmProd.data.product.inventory.sold_quantity,
    2,
    'Sold quantity must increment by 2'
  );
  console.log(
    `   ✅ Confirmed Order #${createdOrder.order_number}: Available Stock ${annaInitialStock} -> ${afterConfirmProd.data.product.inventory.available_stock}, Sold: 2`
  );

  // 7. Order Cancellation -> Inventory Restoration
  console.log('7️⃣  Testing Order Cancellation & Inventory Restoration...');
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
    0,
    'Sold quantity must be decremented after cancellation'
  );
  console.log(
    `   ✅ Cancelled Order #${createdOrder.order_number}: Stock restored to ${afterCancelProd.data.product.inventory.available_stock}`
  );

  // 8. Admin Add, Edit, Low-Stock Trigger & Delete Product
  console.log('8️⃣  Testing Admin Add Product, Edit Product, Low-Stock Warning & Delete...');
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
      sizes: ['Small', 'Medium', 'Large'],
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
  console.log(
    `   ✅ Created test product "${tempProduct.name}" with Low Stock warning (${tempProduct.inventory.stock_status}).`
  );

  // Edit product & adjust stock
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

  // Delete temporary test product
  const delProdRes = await fetchJson(`/api/admin/products/${tempProduct.id}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  assert.strictEqual(delProdRes.status, 200);
  console.log('   ✅ Edited and deleted temporary test product cleanly.');

  // Clean up test order & customer so database stays pristine for the user
  db.prepare('DELETE FROM inventory_transactions WHERE order_id = ?').run(createdOrder.id);
  db.prepare('DELETE FROM orders WHERE id = ?').run(createdOrder.id);
  db.prepare('DELETE FROM customers WHERE phone = ?').run('03001234567');

  console.log('\n==========================================================');
  console.log('🎉 ALL CUSTOMER, ADMIN & INVENTORY TESTS PASSED!');
  console.log('==========================================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
