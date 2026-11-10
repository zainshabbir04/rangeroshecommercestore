import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Printer,
  Eye,
  X,
  Phone,
  MapPin,
  Calendar,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { api, formatPrice } from '../../services/api';
import { useStore } from '../../context/StoreContext';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const AdminOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refreshStorefront } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'All');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('highlight') || '');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [customWhatsappMsg, setCustomWhatsappMsg] = useState<string>('');
  const [copiedMsg, setCopiedMsg] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrders({
        status: statusFilter,
        search: searchTerm,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setOrders(res.orders);
      if (selectedOrder) {
        const refreshed = res.orders.find((o) => o.id === selectedOrder.id);
        if (refreshed) {
          setSelectedOrder(refreshed);
          setCustomWhatsappMsg(refreshed.customer_whatsapp_message || '');
        }
      }
    } catch {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, dateFrom, dateTo, selectedOrder?.id]);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, searchTerm, dateFrom, dateTo]);

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setStatusError(null);
    setCustomWhatsappMsg(order.customer_whatsapp_message || '');
  };

  const handleStatusUpdate = async (
    orderId: number,
    newStatus: OrderStatus,
    openWhatsApp = false
  ) => {
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      const updated = res.order;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSelectedOrder(updated);
      setCustomWhatsappMsg(updated.customer_whatsapp_message || '');
      if (openWhatsApp && updated.customer_whatsapp_url) {
        window.open(updated.customer_whatsapp_url, '_blank', 'noopener,noreferrer');
      }
      await refreshStorefront();
    } catch (err: any) {
      setStatusError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getCustomerWhatsAppLink = (phone: string, msg: string) => {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    else if (digits.startsWith('0') && digits.length === 11) digits = '92' + digits.slice(1);
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  };

  const handleCopyWhatsApp = () => {
    if (!customWhatsappMsg) return;
    navigator.clipboard.writeText(customWhatsappMsg);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5D9C5] p-5 rounded-xs no-print">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C2D56]">
            Store Owner Order Desk
          </span>
          <h2 className="font-serif-editorial text-3xl font-bold text-[#161F33]">
            Orders & WhatsApp Confirmation
          </h2>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="px-4 py-2 bg-[#FAF6F0] border border-[#E5D9C5] hover:border-[#3A1042] rounded-xs text-xs font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-[#E5D9C5] p-4 rounded-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center no-print">
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, Customer Name, Phone, City..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-xs focus:outline-none focus:border-[#3A1042]"
          />
        </div>

        <div className="lg:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by order status"
            className="w-full py-2 px-3 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-xs font-semibold text-[#161F33]"
          >
            <option value="All">All Order Statuses</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full py-2 px-2 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-xs"
            title="From Date"
          />
        </div>

        <div className="lg:col-span-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full py-2 px-2 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-xs"
            title="To Date"
          />
        </div>

        <div className="lg:col-span-1 text-right">
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setDateFrom('');
              setDateTo('');
            }}
            className="text-xs text-[#8C2D56] hover:underline font-medium cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E5D9C5] rounded-xs overflow-hidden no-print">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#161F33]/60">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <h3 className="font-serif-editorial text-2xl font-bold text-[#161F33]">
              No Orders Found
            </h3>
            <p className="text-xs text-[#161F33]/60">
              No incoming orders match your current search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F3ECE0] border-b border-[#E5D9C5] text-[#161F33]/75 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Products Ordered</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D9C5]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF6F0]/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#3A1042]">
                      #{ord.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-[#161F33]/70 whitespace-nowrap">
                      {ord.created_at.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#161F33]">{ord.customer_name}</div>
                      <div className="text-[11px] text-[#161F33]/65">
                        {ord.customer_phone} • {ord.city}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="truncate text-[#161F33]/85">
                          <strong>{it.quantity}×</strong> {it.product_name}{' '}
                          {it.selected_size ? `(${it.selected_size})` : ''}
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#3A1042] whitespace-nowrap">
                      {formatPrice(ord.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#161F33]/75">{ord.payment_method}</td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      {ord.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(ord.id, 'Confirmed', true)}
                          className="px-2.5 py-1.5 bg-[#2E6F73] hover:bg-[#23585B] text-white rounded-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Confirm Order, Deduct Stock & Open WhatsApp to Client"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Confirm & WhatsApp Client</span>
                        </button>
                      )}
                      {ord.customer_whatsapp_url && (
                        <a
                          href={ord.customer_whatsapp_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 border border-[#2E6F73] text-[#2E6F73] hover:bg-[#2E6F73] hover:text-white rounded-xs font-semibold inline-flex items-center gap-1"
                          title={`Send WhatsApp message to ${ord.customer_phone}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenOrder(ord)}
                        className="px-3 py-1.5 bg-[#3A1042] hover:bg-[#8C2D56] text-white rounded-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail & WhatsApp Confirmation Modal (Also serves as Printable Invoice!) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-[#161F33]/65 backdrop-blur-xs no-print"
          />

          <div className="relative z-10 w-full max-w-4xl bg-white border-2 border-[#B8862D] rounded-xs shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-[#3A1042] text-white flex items-center justify-between no-print">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#D8B572] font-semibold">
                  Order Management & Customer WhatsApp Confirmation
                </span>
                <h3 className="font-serif-editorial text-2xl font-bold">
                  Order #{selectedOrder.order_number} — {selectedOrder.customer_name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xs text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 hover:bg-white/15 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Printable Invoice Header (visible when printing) */}
              <div className="border-b border-[#E5D9C5] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif-editorial text-3xl font-bold text-[#161F33]">
                    RANG e ROSH — Official Order Invoice
                  </h2>
                  <p className="text-xs text-[#161F33]/70">
                    Order #{selectedOrder.order_number} • Placed on{' '}
                    {selectedOrder.created_at.slice(0, 16).replace('T', ' ')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-xs text-xs font-bold uppercase tracking-wider ${
                    selectedOrder.status === 'Pending'
                      ? 'bg-[#B8862D]/20 text-[#B8862D]'
                      : selectedOrder.status === 'Cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-[#2E6F73]/15 text-[#2E6F73]'
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              {statusError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xs no-print">
                  {statusError}
                </div>
              )}

              {/* Quick Confirm / Reject / Status Controls */}
              <div className="p-4 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#161F33]">
                    Update Status:
                  </span>
                  {ORDER_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updatingStatus || selectedOrder.status === st}
                      onClick={() => handleStatusUpdate(selectedOrder.id, st)}
                      className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-all cursor-pointer ${
                        selectedOrder.status === st
                          ? 'bg-[#3A1042] text-white shadow-xs'
                          : 'bg-white border border-[#E5D9C5] text-[#161F33] hover:border-[#3A1042]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {selectedOrder.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'Confirmed', true)}
                        className="px-4 py-2 bg-[#2E6F73] hover:bg-[#23585B] text-white text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Send WhatsApp to Client</span>
                      </button>
                      <button
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'Cancelled')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject / Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Customer Info & Items (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="p-4 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs space-y-2 text-xs">
                    <h4 className="font-serif-editorial text-xl font-bold text-[#161F33]">
                      Customer & Delivery Details
                    </h4>
                    <p>
                      <strong>Customer Name:</strong> {selectedOrder.customer_name}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#3A1042]" />
                      <strong>Phone / WhatsApp:</strong> {selectedOrder.customer_phone}
                    </p>
                    {selectedOrder.customer_email && (
                      <p>
                        <strong>Email:</strong> {selectedOrder.customer_email}
                      </p>
                    )}
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8C2D56] shrink-0 mt-0.5" />
                      <span>
                        <strong>Shipping Address:</strong> {selectedOrder.shipping_address},{' '}
                        {selectedOrder.city}
                      </span>
                    </p>
                    <p>
                      <strong>Payment Method:</strong> {selectedOrder.payment_method}
                    </p>
                    {selectedOrder.order_notes && (
                      <p>
                        <strong>Customer Notes:</strong> {selectedOrder.order_notes}
                      </p>
                    )}
                    <p className="pt-1 text-[11px] text-[#2E6F73] font-semibold">
                      Inventory Status:{' '}
                      {selectedOrder.stock_deducted
                        ? 'Confirmed & Deducted from Available Stock'
                        : selectedOrder.stock_reserved
                          ? 'Reserved (Pending Order Confirmation)'
                          : 'Released (Cancelled)'}
                    </p>
                  </div>

                  {/* Ordered Items */}
                  <div className="border border-[#E5D9C5] rounded-xs overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F3ECE0] border-b border-[#E5D9C5]">
                          <th className="py-2.5 px-3">Item</th>
                          <th className="py-2.5 px-3">Price</th>
                          <th className="py-2.5 px-3">Qty</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5D9C5]">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-3">
                              <div className="font-bold text-[#161F33]">{item.product_name}</div>
                              <div className="text-[11px] text-[#161F33]/65">
                                SKU: {item.product_sku}
                                {item.selected_size ? ` • ${item.selected_size}` : ''}
                              </div>
                            </td>
                            <td className="py-3 px-3">{formatPrice(item.unit_price)}</td>
                            <td className="py-3 px-3 font-semibold">{item.quantity}</td>
                            <td className="py-3 px-3 text-right font-bold text-[#3A1042]">
                              {formatPrice(item.line_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="p-4 bg-[#FAF6F0] border-t border-[#E5D9C5] space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Charges</span>
                        <span className="font-semibold">
                          {selectedOrder.shipping_charges === 0
                            ? 'FREE'
                            : formatPrice(selectedOrder.shipping_charges)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-[#E5D9C5] flex justify-between text-sm font-bold text-[#3A1042]">
                        <span>Grand Total</span>
                        <span>{formatPrice(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Store Owner -> Customer WhatsApp Confirmation Generator (5 cols) */}
                <div className="lg:col-span-5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs p-4 space-y-3 no-print">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-editorial text-xl font-bold text-[#161F33] flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-[#2E6F73]" />
                      <span>WhatsApp to Customer</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleCopyWhatsApp}
                      className="px-2.5 py-1 bg-white border border-[#E5D9C5] rounded-xs text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedMsg ? (
                        <>
                          <Check className="w-3 h-3 text-[#2E6F73]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#161F33]/75 leading-relaxed">
                    Review or customize the confirmation message below, then click{' '}
                    <strong>Open WhatsApp to Send to Customer</strong> (addressed to{' '}
                    <strong>{selectedOrder.customer_phone}</strong>). You will manually press Send
                    inside WhatsApp.
                  </p>

                  <textarea
                    rows={12}
                    value={customWhatsappMsg}
                    onChange={(e) => setCustomWhatsappMsg(e.target.value)}
                    className="w-full p-3 bg-white border border-[#E5D9C5] rounded-xs text-xs font-sans leading-relaxed focus:outline-none focus:border-[#3A1042]"
                  />

                  <a
                    href={getCustomerWhatsAppLink(
                      selectedOrder.customer_phone,
                      customWhatsappMsg
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-[#2E6F73] hover:bg-[#23585B] text-white text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp & Send to Customer</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
