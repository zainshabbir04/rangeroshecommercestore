import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { api, formatPrice } from '../../services/api';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, shippingCharges, grandTotal, clearCart } = useCart();
  const { settings, refreshStorefront } = useStore();
  const navigate = useNavigate();

  const paymentMethods =
    settings?.payment_methods && settings.payment_methods.length > 0
      ? settings.payment_methods
      : ['Cash on Delivery (COD)', 'Bank Transfer (Confirm via WhatsApp)'];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif-editorial text-4xl font-bold text-[#161F33]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-[#161F33]/75">
          Please add at least one suit to your bag before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="inline-block px-7 py-3.5 bg-[#3A1042] text-white text-xs font-semibold uppercase tracking-wider rounded-xs"
        >
          Browse Pret Collection
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (customerPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid WhatsApp / mobile phone number (at least 10 digits).');
      return;
    }
    if (!shippingAddress.trim()) {
      setError('Please enter your complete delivery address.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter your city.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim(),
        shipping_address: shippingAddress.trim(),
        city: city.trim(),
        order_notes: orderNotes.trim(),
        payment_method: paymentMethod,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          selected_size: i.selected_size,
          selected_color: i.selected_color,
        })),
      });

      const createdOrder = res.order;
      clearCart();
      await refreshStorefront();

      // Open WhatsApp with the prefilled Order Confirmation message from your WhatsApp directly to the Client's WhatsApp number
      const targetWhatsappUrl =
        createdOrder.customer_whatsapp_url || createdOrder.whatsapp_url;
      if (targetWhatsappUrl) {
        window.open(targetWhatsappUrl, '_blank', 'noopener,noreferrer');
      }

      // Navigate to the Order Confirmation page where the user can also review and click Send on WhatsApp
      navigate(`/order-confirmation/${createdOrder.order_number}`, {
        state: { order: createdOrder },
      });
    } catch (err: any) {
      setError(err.message || 'Unable to place order. Please verify stock availability.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-14 animate-page-enter">
      <div className="mb-8 p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#200626] via-[#3A1042] to-[#1A051E] text-white border-2 border-[#D8B572] shadow-lg">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F7E3B5] hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
        <h1 className="wordmark-3d font-serif-editorial text-3xl sm:text-5xl font-bold text-white mt-2">
          Checkout & Delivery Details
        </h1>
        <p className="text-xs sm:text-sm text-[#FAF6F0]/80 mt-1">
          Complete your shipping details below. Once placed, your order will be saved and a
          pre-filled WhatsApp confirmation message will open for you to review and send.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium rounded-2xl flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmitOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left: Customer & Delivery Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border-2 border-[#D8B572]/60 rounded-3xl p-5 sm:p-8 space-y-6 shadow-md">
          <div className="border-b border-[#E5D9C5] pb-3 flex items-center justify-between">
            <h2 className="font-serif-editorial text-2xl font-bold text-[#161F33]">
              1. Customer & Shipping Information
            </h2>
            <span className="text-[11px] text-[#8C2D56] font-semibold uppercase tracking-wider">
              * Required Fields
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1.5">
                Customer Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Ayesha Khan"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                />
              </div>
            </div>

            {/* WhatsApp / Mobile Number */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1.5">
                WhatsApp / Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g., +92 300 1234567"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1.5">
                Email Address <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="ayesha@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                />
              </div>
            </div>

            {/* City */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1.5">
                City *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Lahore, Karachi, Islamabad"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                />
              </div>
            </div>

            {/* Complete Shipping Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1.5">
                Complete Shipping Address *
              </label>
              <textarea
                rows={3}
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="House / Apartment No., Street, Sector / Phase, Nearest Landmark..."
                className="w-full p-3.5 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
              />
            </div>

            {/* Additional Order Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#161F33] mb-1.5">
                Additional Order Notes <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Special delivery instructions, preferred delivery time, or gift note..."
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs text-sm focus:outline-none focus:border-[#3A1042]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="pt-4 border-t border-[#E5D9C5] space-y-3">
            <h2 className="font-serif-editorial text-2xl font-bold text-[#161F33] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#B8862D]" />
              <span>2. Payment Method</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-3 p-3.5 border rounded-xs cursor-pointer transition-all ${
                    paymentMethod === method
                      ? 'border-[#3A1042] bg-[#3A1042]/5 ring-1 ring-[#3A1042]'
                      : 'border-[#E5D9C5] bg-[#FAF6F0] hover:border-[#3A1042]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-[#3A1042]"
                  />
                  <span className="text-xs font-semibold text-[#161F33]">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Place Order Button (5 cols) */}
        <div className="lg:col-span-5 bg-white border-2 border-[#D8B572]/60 rounded-3xl p-5 sm:p-8 space-y-6 lg:sticky lg:top-28 shadow-md">
          <h2 className="font-serif-editorial text-2xl font-bold text-[#161F33] border-b border-[#E5D9C5] pb-3">
            Your Order Summary
          </h2>

          {/* Ordered Products List */}
          <div className="divide-y divide-[#E5D9C5] max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.key} className="py-3.5 first:pt-0 flex items-center gap-3.5">
                <div className="w-14 h-20 shrink-0 rounded-xl overflow-hidden bg-[#F3ECE0] border border-[#E5D9C5]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif-editorial text-lg font-bold text-[#161F33] truncate">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[#161F33]/70 truncate">
                    {item.selected_size} • {item.selected_color}
                  </p>
                  <p className="text-xs text-[#8C2D56] font-medium mt-0.5">
                    Qty: {item.quantity} × {formatPrice(item.unit_price)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#3A1042]">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Breakdown */}
          <div className="pt-4 border-t border-[#E5D9C5] space-y-2.5 text-sm">
            <div className="flex justify-between text-[#161F33]/80">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#161F33]/80">
              <span>Shipping Charges</span>
              <span className="font-semibold">
                {shippingCharges === 0 ? (
                  <span className="text-[#2E6F73] font-bold">FREE</span>
                ) : (
                  formatPrice(shippingCharges)
                )}
              </span>
            </div>
            <div className="pt-3 border-t border-[#E5D9C5] flex justify-between items-baseline">
              <span className="text-base font-bold text-[#161F33]">Grand Total</span>
              <span className="font-serif-editorial text-3xl font-bold text-[#3A1042]">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          {/* WhatsApp Confirmation Explanation Box */}
          <div className="p-4 bg-[#2E6F73]/10 border border-[#2E6F73]/30 rounded-2xl space-y-1.5 text-xs text-[#161F33]">
            <div className="flex items-center gap-2 font-semibold text-[#2E6F73]">
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp Order Confirmation to Client</span>
            </div>
            <p className="text-[#161F33]/80 leading-relaxed">
              Clicking <strong>Place Order</strong> saves the order with a unique Order ID and
              automatically opens your WhatsApp with a pre-filled{' '}
              <strong>Rang e Rosh Order Confirmation Message</strong> addressed directly to the
              client&apos;s WhatsApp number{' '}
              {customerPhone.trim() ? <strong>({customerPhone.trim()})</strong> : ''} so you can
              review and press Send.
            </p>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-5 bg-gradient-to-r from-[#3A1042] via-[#541860] to-[#3A1042] hover:from-[#8C2D56] hover:to-[#681B3C] disabled:bg-gray-400 text-[#FAF6F0] text-xs font-extrabold tracking-[0.14em] uppercase rounded-full border border-[#D8B572]/60 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
          >
            <MessageCircle className="w-4 h-4 text-[#D8B572] shrink-0" />
            <span>
              {submitting
                ? 'Saving Order & Opening WhatsApp...'
                : 'Place Order & Send WhatsApp to Client'}
            </span>
          </button>

          <div className="flex items-center justify-center gap-4 text-[11px] text-[#161F33]/60 pt-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#B8862D]" /> Server-Validated Stock
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E6F73]" /> Official Store
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
