import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../services/api';

export const CartPage: React.FC = () => {
  const {
    items,
    totalItemsCount,
    subtotal,
    shippingCharges,
    grandTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQty = (key: string, nextQty: number) => {
    const res = updateQuantity(key, nextQty);
    if (!res.success && res.message) {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(null), 3500);
    } else {
      setErrorMsg(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-[#F3ECE0] border border-[#E5D9C5] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-9 h-9 text-[#3A1042]/70" />
        </div>
        <h1 className="font-serif-editorial text-4xl font-bold text-[#161F33]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-sm text-[#161F33]/75 max-w-md mx-auto">
          Discover our 6 signature stitched ensembles from the Rang e Rosh Pret Collection.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#3A1042] text-white text-xs font-semibold tracking-[0.16em] uppercase hover:bg-[#8C2D56] transition-colors rounded-xs"
        >
          <span>Explore Pret Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const freeThreshold = settings?.free_shipping_threshold ?? 15000;
  const remainingForFree = Math.max(0, freeThreshold - subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-[#E5D9C5] pb-5">
        <div>
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#8C2D56]">
            Rang e Rosh Bag
          </span>
          <h1 className="font-serif-editorial text-4xl font-bold text-[#161F33] mt-1">
            Shopping Bag ({totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'})
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-gray-500 hover:text-[#8C2D56] underline self-start sm:self-auto cursor-pointer"
        >
          Clear Shopping Bag
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items Table */}
        <div className="lg:col-span-8 bg-white border border-[#E5D9C5] rounded-xs divide-y divide-[#E5D9C5]">
          {items.map((item) => (
            <div
              key={item.key}
              className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              <Link
                to={`/product/${item.slug}`}
                className="w-24 h-32 shrink-0 bg-[#F3ECE0] rounded-xs overflow-hidden border border-[#E5D9C5]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-top"
                />
              </Link>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-serif-editorial text-2xl font-bold text-[#161F33] hover:text-[#3A1042]"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#161F33]/60 font-mono">SKU: {item.sku}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.key)}
                    className="p-1.5 text-gray-400 hover:text-[#8C2D56] cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#161F33]/80">
                  <strong>Color:</strong> {item.selected_color}
                </p>
                {item.selected_size && (
                  <p className="text-xs text-[#8C2D56] font-medium">
                    <strong>Size / Fit:</strong> {item.selected_size}
                  </p>
                )}

                <div className="pt-3 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center border border-[#E5D9C5] bg-[#FAF6F0] rounded-xs">
                      <button
                        type="button"
                        onClick={() => handleQty(item.key, item.quantity - 1)}
                        className="p-2 text-[#161F33] hover:bg-white cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-semibold text-[#161F33]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQty(item.key, item.quantity + 1)}
                        className="p-2 text-[#161F33] hover:bg-white cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[#161F33]/60">
                      ({item.max_available} available in stock)
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold text-[#3A1042]">
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                    <p className="text-[11px] text-[#161F33]/60">
                      {formatPrice(item.unit_price)} each
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white border border-[#E5D9C5] rounded-xs p-6 space-y-5 sticky top-28">
          <h2 className="font-serif-editorial text-2xl font-bold text-[#161F33] border-b border-[#E5D9C5] pb-3">
            Order Summary
          </h2>

          {freeThreshold > 0 && (
            <div className="p-3.5 bg-[#F3ECE0] rounded-xs text-xs text-[#161F33] flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#B8862D] shrink-0 mt-0.5" />
              {remainingForFree === 0 ? (
                <span className="text-[#2E6F73] font-medium">
                  Your order qualifies for <strong>Complimentary Nationwide Shipping!</strong>
                </span>
              ) : (
                <span>
                  Add <strong>{formatPrice(remainingForFree)}</strong> more for{' '}
                  <strong>Complimentary Shipping</strong>.
                </span>
              )}
            </div>
          )}

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-[#161F33]/80">
              <span>Subtotal ({totalItemsCount} items)</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#161F33]/80">
              <span>Shipping Charges</span>
              <span className="font-semibold">
                {shippingCharges === 0 ? (
                  <span className="text-[#2E6F73]">FREE</span>
                ) : (
                  formatPrice(shippingCharges)
                )}
              </span>
            </div>
            <div className="pt-3 border-t border-[#E5D9C5] flex justify-between items-baseline">
              <span className="font-semibold text-[#161F33]">Grand Total</span>
              <span className="font-serif-editorial text-3xl font-bold text-[#3A1042]">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full py-4 px-6 bg-[#3A1042] hover:bg-[#8C2D56] text-[#FAF6F0] text-xs font-semibold tracking-[0.16em] uppercase rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/shop"
            className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-[#3A1042] hover:text-[#8C2D56] flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>

          <div className="pt-3 border-t border-[#E5D9C5] flex items-center gap-2 text-[11px] text-[#161F33]/65">
            <ShieldCheck className="w-4 h-4 text-[#2E6F73] shrink-0" />
            <span>Instant WhatsApp order confirmation upon checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
