import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  Printer,
  ShoppingBag,
  Clock,
} from 'lucide-react';
import { Order } from '../../types';
import { api, formatPrice } from '../../services/api';
import { trackMetaEvent } from '../../lib/trackMetaEvent';
import { ttqTrack } from '../../lib/tiktokPixel';

function buildClientWhatsAppUrl(phone: string, message: string): string {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = '92' + digits.slice(1);
  else if (digits.length === 10 && digits.startsWith('3')) digits = '92' + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function buildShortOrderMessage(ord: Order): string {
  if (ord.store_whatsapp_message) return ord.store_whatsapp_message;
  const shortItems = (ord.items || [])
    .map((i) => `• ${i.quantity}x *${i.product_name}* (${i.selected_size || 'Standard'})`)
    .join('\n');
  return [
    `Assalam-o-Alaikum *Rang e Rosh*!`,
    `I placed Order *#${ord.order_number}*`,
    shortItems,
    `Total: *PKR ${Number(ord.total_amount || 0).toLocaleString('en-PK')}* (${ord.payment_method})`,
    `Name: ${ord.customer_name}`,
    `City: ${ord.city}`,
    `Please confirm my order.`,
  ].join('\n');
}

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const stateOrder = (location.state as { order?: Order } | null)?.order || null;

  const [order, setOrder] = useState<Order | null>(stateOrder);
  const [editableMessage, setEditableMessage] = useState<string>(
    stateOrder ? buildShortOrderMessage(stateOrder) : ''
  );
  const [loading, setLoading] = useState(!stateOrder);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order && orderNumber) {
      setLoading(true);
      api
        .lookupOrder(orderNumber)
        .then((res) => {
          setOrder(res.order);
          setEditableMessage(buildShortOrderMessage(res.order));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (order && !editableMessage) {
      setEditableMessage(buildShortOrderMessage(order));
    }
  }, [order, orderNumber]);

  useEffect(() => {
    if (!order) return;
    try {
      const orderKey = order.order_number || order.id;
      const trackedKey = `rer_meta_purchase_${orderKey}`;
      const ttqTrackedKey = `rer_tiktok_completepayment_${orderKey}`;

      if (typeof sessionStorage === 'undefined' || !sessionStorage.getItem(ttqTrackedKey)) {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(ttqTrackedKey, '1');
        }
        ttqTrack(
          'CompletePayment',
          {
            content_type: 'product',
            value: order.total_amount,
            currency: 'PKR',
            quantity: (order.items || []).reduce((s, i) => s + i.quantity, 0),
            order_id: order.order_number,
            contents: (order.items || []).map((i) => ({
              content_id: String(i.product_sku || i.product_id),
              content_type: 'product',
              content_name: i.product_name,
              quantity: i.quantity,
              price: i.unit_price,
            })),
          },
          { event_id: `order_${orderKey}` }
        );
      }

      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(trackedKey)) {
        return;
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(trackedKey, '1');
      }
      trackMetaEvent({
        eventName: 'Purchase',
        orderId: orderKey,
        customData: {
          value: order.total_amount,
          currency: 'PKR',
          content_ids: (order.items || []).map((i) => String(i.product_sku || i.product_id)),
          content_type: 'product',
          num_items: (order.items || []).reduce((s, i) => s + i.quantity, 0),
          order_id: order.order_number,
        },
        userData: {
          fullName: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email,
          city: order.city,
          country: 'pk',
          externalId: order.order_number,
        },
      }).catch(() => {});
    } catch {
      // non-blocking
    }
  }, [order]);

  const handleCopyMessage = () => {
    if (!editableMessage) return;
    navigator.clipboard.writeText(editableMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="h-48 bg-[#F3ECE0] animate-pulse rounded-xs" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif-editorial text-4xl font-bold text-[#161F33]">Order Not Found</h1>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#3A1042] text-white text-xs font-semibold uppercase tracking-wider rounded-xs"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const storeOwnerWhatsappUrl = buildClientWhatsAppUrl('03130888048', editableMessage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Top Confirmation Banner */}
      <div className="bg-white border-2 border-[#B8862D] rounded-xs p-6 sm:p-10 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#2E6F73]/15 text-[#2E6F73] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="inline-block px-3 py-1 bg-[#2E6F73]/15 text-[#2E6F73] text-xs font-bold uppercase tracking-[0.18em] rounded-xs">
          Order Received • #{order.order_number}
        </span>
        <h1 className="font-serif-editorial text-3xl sm:text-5xl font-bold text-[#161F33]">
          Thank You, {order.customer_name}!
        </h1>
        <p className="text-sm text-[#161F33]/80 max-w-2xl mx-auto leading-relaxed">
          Your order <strong>#{order.order_number}</strong> has been received. Click below to send
          your short order message on WhatsApp to our official Rang e Rosh number (
          <strong className="text-[#3A1042]">03130888048</strong>):
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3 no-print">
          <a
            href={storeOwnerWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold tracking-[0.12em] uppercase rounded-xs shadow-md transition-all flex items-center gap-2.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Order on WhatsApp to Rang e Rosh (03130888048)</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-4 border border-[#3A1042] text-[#3A1042] hover:bg-[#F3ECE0] text-xs font-semibold tracking-[0.14em] uppercase rounded-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Order & WhatsApp Message Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Itemized Order Details (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E5D9C5] pb-3">
            <h2 className="font-serif-editorial text-2xl font-bold text-[#161F33]">
              Order Details (#{order.order_number})
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-semibold bg-[#B8862D]/15 text-[#B8862D]">
              <Clock className="w-3.5 h-3.5" />
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF6F0] p-4 rounded-xs border border-[#E5D9C5]/70">
            <div>
              <span className="text-[#161F33]/60 uppercase block">Client Name</span>
              <strong className="text-[#161F33] text-sm">{order.customer_name}</strong>
            </div>
            <div>
              <span className="text-[#161F33]/60 uppercase block">Client WhatsApp</span>
              <strong className="text-[#2E6F73] text-sm">{order.customer_phone}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[#161F33]/60 uppercase block">Delivery Address</span>
              <strong className="text-[#161F33] text-sm">
                {order.shipping_address}, {order.city}
              </strong>
            </div>
            <div>
              <span className="text-[#161F33]/60 uppercase block">Payment Method</span>
              <strong className="text-[#161F33]">{order.payment_method}</strong>
            </div>
            {order.order_notes && (
              <div>
                <span className="text-[#161F33]/60 uppercase block">Order Notes</span>
                <strong className="text-[#161F33]">{order.order_notes}</strong>
              </div>
            )}
          </div>

          <div className="divide-y divide-[#E5D9C5]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif-editorial text-lg font-bold text-[#161F33]">
                    {item.product_name}
                  </h3>
                  <p className="text-xs text-[#161F33]/70">
                    SKU: {item.product_sku}
                    {item.selected_size ? ` • ${item.selected_size}` : ''}
                    {item.selected_color ? ` • ${item.selected_color}` : ''}
                  </p>
                  <p className="text-xs text-[#8C2D56] font-medium">
                    Qty: {item.quantity} × {formatPrice(item.unit_price)}
                  </p>
                </div>
                <span className="text-sm font-bold text-[#3A1042]">
                  {formatPrice(item.line_total)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5D9C5] space-y-2 text-sm">
            <div className="flex justify-between text-[#161F33]/80">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#161F33]/80">
              <span>Shipping Charges</span>
              <span>
                {order.shipping_charges === 0 ? 'FREE' : formatPrice(order.shipping_charges)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E5D9C5] flex justify-between items-baseline font-bold text-base">
              <span>Grand Total</span>
              <span className="font-serif-editorial text-2xl text-[#3A1042]">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Short WhatsApp Order Message to Rang e Rosh (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-4 no-print">
          <div className="flex items-center justify-between border-b border-[#E5D9C5] pb-3">
            <h2 className="font-serif-editorial text-xl font-bold text-[#161F33] flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span>Short WhatsApp Message</span>
            </h2>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="px-2.5 py-1 text-xs font-semibold border border-[#E5D9C5] rounded-xs hover:bg-[#F3ECE0] flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#2E6F73]" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Text
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-[#161F33]/70">
            To Rang e Rosh Official WhatsApp: <strong className="text-[#3A1042]">03130888048</strong>
          </p>

          <textarea
            rows={9}
            value={editableMessage}
            onChange={(e) => setEditableMessage(e.target.value)}
            className="w-full p-3.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-xs text-[#161F33] font-sans leading-relaxed focus:outline-none focus:border-[#3A1042]"
          />

          <a
            href={storeOwnerWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold tracking-[0.12em] uppercase rounded-xs flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send to Rang e Rosh WhatsApp (03130888048)</span>
          </a>

          <Link
            to="/shop"
            className="w-full py-3 px-4 border border-[#3A1042] text-[#3A1042] hover:bg-[#F3ECE0] text-xs font-semibold tracking-[0.14em] uppercase rounded-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
