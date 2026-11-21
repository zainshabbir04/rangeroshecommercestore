import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { DashboardData, Order } from '../../types';
import { api, formatPrice } from '../../services/api';

function buildDetailedClientWhatsappMessage(ord: Order): string {
  if (ord.customer_whatsapp_message && ord.customer_whatsapp_message.includes('ORDER CONFIRMATION')) {
    return ord.customer_whatsapp_message;
  }
  const itemLines = (ord.items || [])
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.product_name}* (${it.selected_size || 'Small'}${it.selected_color ? ` • ${it.selected_color}` : ''})\n   Qty: ${it.quantity} × PKR ${Number(it.unit_price || 0).toLocaleString('en-PK')} = *PKR ${Number(it.line_total || 0).toLocaleString('en-PK')}*`
    )
    .join('\n\n');

  return [
    `Assalam-o-Alaikum *${ord.customer_name}*!`,
    ``,
    `Great news from *Rang e Rosh*! ✨`,
    `Your order *#${ord.order_number}* has been *CONFIRMED* ✅ and is being prepared for dispatch.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🛍️ *ORDER CONFIRMATION: #${ord.order_number}*`,
    `📌 *Status:* Confirmed ✅`,
    `💳 *Payment:* ${ord.payment_method || 'Cash on Delivery (COD)'}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👗 *PRODUCT & ORDER DETAILS*`,
    itemLines,
    ``,
    `• Subtotal: PKR ${Number(ord.subtotal || ord.total_amount || 0).toLocaleString('en-PK')}`,
    `• Delivery: ${Number(ord.shipping_charges || 0) === 0 ? 'FREE' : `PKR ${Number(ord.shipping_charges || 0).toLocaleString('en-PK')}`}`,
    `💰 *Total Payable: PKR ${Number(ord.total_amount || 0).toLocaleString('en-PK')}*`,
    ``,
    `📍 *DELIVERY DETAILS*`,
    `• Name: ${ord.customer_name}`,
    `• Phone: ${ord.customer_phone}`,
    `• Address: ${ord.shipping_address}, ${ord.city}`,
    ...(ord.order_notes ? [`• Notes: ${ord.order_notes}`] : []),
    ``,
    `Thank you for shopping with *Rang e Rosh*!`,
    `📞 Official WhatsApp: 03130888048`,
  ].join('\n');
}

function buildClientWhatsappUrl(ord: Order): string {
  let clean = String(ord.customer_phone || '').replace(/\D/g, '');
  if (clean.startsWith('00')) clean = clean.slice(2);
  else if (clean.startsWith('0') && clean.length === 11) clean = '92' + clean.slice(1);
  else if (clean.length === 10 && clean.startsWith('3')) clean = '92' + clean;
  const msg = buildDetailedClientWhatsappMessage(ord);
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard('all');
      setData(res);
    } catch {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const handleSync = () => {
      loadDashboard();
    };
    window.addEventListener('rer-store-sync', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('rer-store-sync', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [loadDashboard]);

  const handleConfirmAndSendWhatsApp = async (ord: Order) => {
    const waUrl = buildClientWhatsappUrl(ord);
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    if (ord.status !== 'Confirmed') {
      setConfirmingId(ord.id);
      try {
        await api.updateOrderStatus(ord.id, 'Confirmed');
        await loadDashboard();
      } catch {
        // handled
      } finally {
        setConfirmingId(null);
      }
    }
  };

  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-28 bg-white border border-[#E5D9C5] animate-pulse rounded-xs"
          />
        ))}
      </div>
    );
  }

  const summary = data?.summary || {
    total_products: 0,
    total_orders: 0,
    pending_orders: 0,
    confirmed_orders: 0,
    cancelled_orders: 0,
    total_sales: 0,
    pending_sales: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
  };

  return (
    <div className="space-y-6">
      {/* Clean Top Header */}
      <div className="flex items-center justify-between gap-4 bg-white border border-[#E5D9C5] p-5 rounded-xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C2D56]">
            Rang e Rosh Admin
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-[#161F33]">
            Dashboard &amp; Order Confirmation
          </h2>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="px-3.5 py-2 bg-[#FAF6F0] border border-[#E5D9C5] hover:border-[#3A1042] rounded-xs text-xs font-semibold text-[#161F33] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 Essential Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#3A1042] to-[#161F33] text-white p-5 rounded-xs border border-[#B8862D] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#D8B572] font-semibold">
              Confirmed Sales
            </span>
            <TrendingUp className="w-4 h-4 text-[#D8B572]" />
          </div>
          <p className="font-serif-editorial text-2xl sm:text-3xl font-bold mt-2">
            {formatPrice(summary.total_sales)}
          </p>
        </div>

        <Link
          to="/admin/orders"
          className="bg-white p-5 rounded-xs border border-[#E5D9C5] hover:border-[#3A1042] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#161F33]/65 font-semibold">
              Total Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-[#3A1042]" />
          </div>
          <p className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#161F33] mt-2">
            {summary.total_orders}
          </p>
        </Link>

        <Link
          to="/admin/orders?status=Pending"
          className="bg-white p-5 rounded-xs border border-[#E5D9C5] hover:border-[#B8862D] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#B8862D] font-semibold">
              Pending Orders
            </span>
            <Clock className="w-4 h-4 text-[#B8862D]" />
          </div>
          <p className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#B8862D] mt-2">
            {summary.pending_orders}
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="bg-white p-5 rounded-xs border border-[#E5D9C5] hover:border-[#2E6F73] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#2E6F73] font-semibold">
              Confirmed / Products
            </span>
            <Package className="w-4 h-4 text-[#2E6F73]" />
          </div>
          <p className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#2E6F73] mt-2">
            {summary.confirmed_orders} / {summary.total_products}
          </p>
        </Link>
      </div>

      {/* Full-Width Customer Orders & One-Click Confirm Table */}
      <div className="bg-white border border-[#E5D9C5] rounded-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5D9C5] pb-3">
          <div>
            <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33]">
              Incoming Customer Orders ({data?.recent_orders.length || 0})
            </h3>
            <p className="text-xs text-[#161F33]/65 mt-0.5">
              Click <strong>Confirm &amp; Send Detailed WhatsApp</strong> to confirm the order and send full product details to the client&apos;s WhatsApp.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold uppercase tracking-wider text-[#3A1042] hover:text-[#8C2D56] flex items-center gap-1"
          >
            <span>All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!data || data.recent_orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#161F33]/60">
            No customer orders recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5D9C5] text-[#161F33]/65 uppercase tracking-wider">
                  <th className="py-2.5 pr-3">Order ID</th>
                  <th className="py-2.5 px-3">Client &amp; WhatsApp</th>
                  <th className="py-2.5 px-3">Products &amp; Delivery</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pl-3 text-right">Confirm &amp; Send Detail Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D9C5]/60">
                {data.recent_orders.map((ord) => (
                  <tr key={ord.id || ord.order_number} className="hover:bg-[#FAF6F0]/60 align-top">
                    <td className="py-3.5 pr-3 font-mono font-bold text-[#3A1042]">
                      #{ord.order_number}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#161F33]">{ord.customer_name}</div>
                      <div className="text-[11px] text-[#2E6F73] font-mono font-semibold">
                        {ord.customer_phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        {(ord.items || []).map((it, idx) => (
                          <div key={idx} className="text-[11px] font-medium text-[#161F33]">
                            {it.quantity}× <strong>{it.product_name}</strong>{' '}
                            <span className="text-[#8C2D56]">({it.selected_size || 'Small'})</span>
                          </div>
                        ))}
                      </div>
                      {ord.city && (
                        <div className="flex items-center gap-1 text-[10px] text-[#161F33]/65 mt-1">
                          <MapPin className="w-3 h-3 text-[#B8862D] shrink-0" />
                          <span className="truncate max-w-[220px]">
                            {ord.city}
                            {ord.shipping_address ? ` — ${ord.shipping_address}` : ''}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#3A1042] whitespace-nowrap">
                      {formatPrice(ord.total_amount)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-xs text-[10px] font-semibold uppercase tracking-wider ${
                          ord.status === 'Pending'
                            ? 'bg-[#B8862D]/20 text-[#B8862D]'
                            : ord.status === 'Cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-[#2E6F73]/15 text-[#2E6F73]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={confirmingId === ord.id}
                          onClick={() => handleConfirmAndSendWhatsApp(ord)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-[11px] font-bold text-white cursor-pointer shadow-xs transition-colors ${
                            ord.status === 'Pending'
                              ? 'bg-[#2E6F73] hover:bg-[#23585B]'
                              : 'bg-[#25D366] hover:bg-[#1ebe5d]'
                          }`}
                          title={`Confirm order & send detailed product message to ${ord.customer_phone}`}
                        >
                          {ord.status === 'Pending' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirm &amp; WhatsApp Client</span>
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Send Detail WhatsApp</span>
                            </>
                          )}
                        </button>

                        <Link
                          to={`/admin/orders?highlight=${ord.order_number}`}
                          className="px-2.5 py-1.5 border border-[#3A1042] text-[#3A1042] hover:bg-[#3A1042] hover:text-white rounded-xs text-[11px] font-semibold transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
