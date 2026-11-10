export interface OrderForWhatsApp {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  city: string;
  order_notes?: string;
  payment_method: string;
  subtotal: number;
  shipping_charges: number;
  total_amount: number;
  status: string;
  created_at?: string;
  items: Array<{
    product_name: string;
    product_sku: string;
    selected_size?: string;
    selected_color?: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }>;
}

/**
 * Normalizes a Pakistani or international phone number into digits-only format suitable for wa.me links.
 * E.g. "+923 200 300 552" -> "923200300552", "0300-1234567" -> "923001234567"
 */
export function normalizeWhatsAppNumber(rawPhone: string): string {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) {
    return digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    // Pakistani local format 03XX... -> 923XX...
    return '92' + digits.slice(1);
  }
  if (digits.length === 10 && digits.startsWith('3')) {
    // 3001234567 -> 923001234567
    return '92' + digits;
  }
  return digits;
}

export function formatPKR(amount: number): string {
  return `PKR ${Number(amount || 0).toLocaleString('en-PK')}`;
}

/**
 * Generates the WhatsApp Order Confirmation message sent FROM the Store Owner's WhatsApp
 * TO the Client's WhatsApp number (`customer_phone`) after an order is placed or updated.
 */
export function buildAdminToCustomerWhatsAppMessage(
  order: OrderForWhatsApp,
  storeName = 'Rang e Rosh',
  storePhone = '+923 130 888 048'
): string {
  const itemLines = order.items
    .map((item, idx) => {
      const variantParts = [item.selected_size, item.selected_color].filter(Boolean).join(' | ');
      const variantSuffix = variantParts ? ` (${variantParts})` : '';
      return `${idx + 1}. *${item.product_name}*${variantSuffix}\n   SKU: ${item.product_sku} | Qty: ${item.quantity} × ${formatPKR(item.unit_price)} = *${formatPKR(item.line_total)}*`;
    })
    .join('\n\n');

  let statusHeader = `Thank you for placing your order with *${storeName}*! ✨\nWe have received your order *#${order.order_number}* and are pleased to share your order confirmation details below:`;
  if (order.status === 'Confirmed') {
    statusHeader = `Great news from *${storeName}*! ✨\nYour order *#${order.order_number}* has been *CONFIRMED* and is being prepared for dispatch.`;
  } else if (order.status === 'Processing') {
    statusHeader = `Update from *${storeName}*: Your order *#${order.order_number}* is now *IN PROCESSING* at our atelier.`;
  } else if (order.status === 'Shipped') {
    statusHeader = `Exciting news from *${storeName}*! 🚚\nYour order *#${order.order_number}* has been *SHIPPED* and is on its way to you.`;
  } else if (order.status === 'Delivered') {
    statusHeader = `Your *${storeName}* order *#${order.order_number}* has been marked as *DELIVERED*. We hope you love wearing your ensemble!`;
  } else if (order.status === 'Cancelled') {
    statusHeader = `Hello from *${storeName}*. Regarding your order *#${order.order_number}*, please note that this order has been *CANCELLED*.`;
  }

  const lines = [
    `Assalam-o-Alaikum *${order.customer_name}*!`,
    ``,
    statusHeader,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🛍️ *ORDER CONFIRMATION: #${order.order_number}*`,
    `📌 *Order Status:* ${order.status}`,
    `💳 *Payment Method:* ${order.payment_method}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 *CLIENT & DELIVERY DETAILS*`,
    `• Name: ${order.customer_name}`,
    `• Phone/WhatsApp: ${order.customer_phone}`,
    ...(order.customer_email ? [`• Email: ${order.customer_email}`] : []),
    `• Delivery Address: ${order.shipping_address}, ${order.city}`,
    ...(order.order_notes ? [`• Order Notes: ${order.order_notes}`] : []),
    ``,
    `👗 *ORDERED ITEMS*`,
    itemLines,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `• Subtotal: ${formatPKR(order.subtotal)}`,
    `• Shipping Charges: ${order.shipping_charges === 0 ? 'FREE' : formatPKR(order.shipping_charges)}`,
    `💰 *TOTAL AMOUNT: ${formatPKR(order.total_amount)}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Please reply *"YES"* to confirm your delivery address, or let us know if you need any assistance.`,
    ``,
    `Warm regards,`,
    `*${storeName} — Ladies Stitched Suits*`,
    `📞 ${storePhone}`,
  ];

  return lines.join('\n');
}

/**
 * Generates the WhatsApp message from Customer to Store (optional secondary link).
 */
export function buildCustomerOrderWhatsAppMessage(
  order: OrderForWhatsApp,
  storeName = 'Rang e Rosh'
): string {
  const itemLines = order.items
    .map((item, idx) => {
      const variantParts = [item.selected_size, item.selected_color].filter(Boolean).join(' | ');
      const variantSuffix = variantParts ? ` (${variantParts})` : '';
      return `${idx + 1}. *${item.product_name}*${variantSuffix}\n   SKU: ${item.product_sku} | Qty: ${item.quantity} × ${formatPKR(item.unit_price)} = *${formatPKR(item.line_total)}*`;
    })
    .join('\n\n');

  const lines = [
    `Assalam-o-Alaikum *${storeName}*! ✨`,
    `I have just placed an order on your website. Please find my order details below for confirmation:`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🛍️ *ORDER ID:* #${order.order_number}`,
    `📌 *Order Status:* ${order.status}`,
    `💳 *Payment Method:* ${order.payment_method}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 *CUSTOMER DETAILS*`,
    `• Name: ${order.customer_name}`,
    `• Phone/WhatsApp: ${order.customer_phone}`,
    ...(order.customer_email ? [`• Email: ${order.customer_email}`] : []),
    `• Delivery Address: ${order.shipping_address}, ${order.city}`,
    ...(order.order_notes ? [`• Order Notes: ${order.order_notes}`] : []),
    ``,
    `👗 *ORDERED ITEMS*`,
    itemLines,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `• Subtotal: ${formatPKR(order.subtotal)}`,
    `• Shipping Charges: ${order.shipping_charges === 0 ? 'FREE' : formatPKR(order.shipping_charges)}`,
    `💰 *GRAND TOTAL: ${formatPKR(order.total_amount)}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Please confirm my order. Thank you!`,
  ];

  return lines.join('\n');
}

export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = normalizeWhatsAppNumber(phoneNumber);
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

/**
 * Optional automated background WhatsApp dispatch from Store WhatsApp to Client WhatsApp
 * if Meta WhatsApp Cloud API or UltraMsg credentials are provided in environment variables.
 */
export async function tryAutoSendWhatsAppToClient(
  clientPhone: string,
  messageText: string
): Promise<{ sent: boolean; provider?: string; error?: string }> {
  const toPhone = normalizeWhatsAppNumber(clientPhone);
  if (!toPhone) {
    return { sent: false, error: 'Invalid client phone number' };
  }

  // 1. Check Meta WhatsApp Cloud API
  const metaToken = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
  if (metaToken && metaPhoneId) {
    try {
      const resp = await fetch(
        `https://graph.facebook.com/v21.0/${metaPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${metaToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: toPhone,
            type: 'text',
            text: { preview_url: false, body: messageText },
          }),
        }
      );
      if (resp.ok) {
        return { sent: true, provider: 'whatsapp_cloud_api' };
      }
      const errData = await resp.json().catch(() => ({}));
      return {
        sent: false,
        provider: 'whatsapp_cloud_api',
        error: errData?.error?.message || `HTTP ${resp.status}`,
      };
    } catch (err: any) {
      return { sent: false, provider: 'whatsapp_cloud_api', error: err.message };
    }
  }

  // 2. Check UltraMsg WhatsApp Gateway (for personal/business WhatsApp QR-linked numbers)
  const ultramsgInstance = process.env.ULTRAMSG_INSTANCE_ID;
  const ultramsgToken = process.env.ULTRAMSG_TOKEN;
  if (ultramsgInstance && ultramsgToken) {
    try {
      const resp = await fetch(
        `https://api.ultramsg.com/${ultramsgInstance}/messages/chat`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: ultramsgToken,
            to: `+${toPhone}`,
            body: messageText,
          }),
        }
      );
      if (resp.ok) {
        return { sent: true, provider: 'ultramsg' };
      }
      return { sent: false, provider: 'ultramsg', error: `HTTP ${resp.status}` };
    } catch (err: any) {
      return { sent: false, provider: 'ultramsg', error: err.message };
    }
  }

  return { sent: false };
}
