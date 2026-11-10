import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../services/api';

export const CartDrawer: React.FC = () => {
  const {
    items,
    totalItemsCount,
    subtotal,
    shippingCharges,
    grandTotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [qtyError, setQtyError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings?.free_shipping_threshold ?? 15000;
  const amountRemainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress =
    freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 100;

  const handleQtyChange = (key: string, nextQty: number) => {
    const res = updateQuantity(key, nextQty);
    if (!res.success && res.message) {
      setQtyError(res.message);
      setTimeout(() => setQtyError(null), 3000);
    } else {
      setQtyError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-[#161F33]/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF6F0] shadow-2xl flex flex-col justify-between border-l border-[#E5D9C5]">
          {/* Drawer Header */}
          <div className="p-5 bg-[#3A1042] text-[#FAF6F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#D8B572]" />
              <h2 className="font-serif-editorial text-2xl font-semibold tracking-wide">
                Your Shopping Bag
              </h2>
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[#B8862D] text-white">
                {totalItemsCount}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#FAF6F0] transition-colors cursor-pointer"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          {freeShippingThreshold > 0 && items.length > 0 && (
            <div className="px-5 py-3 bg-[#F3ECE0] border-b border-[#E5D9C5]">
              <div className="flex items-center gap-2 text-xs text-[#161F33]">
                <Truck className="w-4 h-4 text-[#B8862D] shrink-0" />
                {amountRemainingForFreeShipping === 0 ? (
                  <span className="font-medium text-[#2E6F73]">
                    Congratulations! Your order qualifies for{' '}
                    <strong>Complimentary Shipping</strong>.
                  </span>
                ) : (
                  <span>
                    Add{' '}
                    <strong className="text-[#3A1042]">
                      {formatPrice(amountRemainingForFreeShipping)}
                    </strong>{' '}
                    more for <strong>Complimentary Shipping</strong>
                  </span>
                )}
              </div>
              <div className="mt-2 h-1.5 w-full bg-[#E5D9C5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3A1042] to-[#B8862D] transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {qtyError && (
            <div className="px-5 py-2 bg-[#8C2D56] text-white text-xs font-medium">
              {qtyError}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E5D9C5]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F3ECE0] flex items-center justify-center mb-4 border border-[#E5D9C5]">
                  <ShoppingBag className="w-7 h-7 text-[#3A1042]/60" />
                </div>
                <h3 className="font-serif-editorial text-2xl font-semibold text-[#161F33]">
                  Your Shopping Bag is Empty
                </h3>
                <p className="text-sm text-[#161F33]/70 mt-1 max-w-xs">
                  Explore our luxury 2-piece stitched Pret Collection to add your favourite suits.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="mt-6 px-6 py-3 bg-[#3A1042] text-[#FAF6F0] text-xs font-semibold tracking-[0.15em] uppercase hover:bg-[#8C2D56] transition-colors rounded-xs cursor-pointer"
                >
                  Explore Pret Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.key} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={() => setIsCartOpen(false)}
                    className="w-20 h-28 shrink-0 bg-[#F3ECE0] rounded-xs overflow-hidden border border-[#E5D9C5]"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif-editorial text-xl font-semibold text-[#161F33] hover:text-[#3A1042] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.key)}
                          className="text-gray-400 hover:text-[#8C2D56] transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-[#161F33]/70 truncate mt-0.5">
                        {item.selected_color}
                      </p>
                      {item.selected_size && (
                        <p className="text-[11px] text-[#8C2D56] font-medium mt-0.5">
                          Fit / Size: {item.selected_size}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-[#E5D9C5] bg-white rounded-xs">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.key, item.quantity - 1)}
                          className="p-1.5 text-[#161F33] hover:bg-[#F3ECE0] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-[#161F33]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.key, item.quantity + 1)}
                          className="p-1.5 text-[#161F33] hover:bg-[#F3ECE0] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#3A1042]">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-gray-500">
                            {formatPrice(item.unit_price)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E5D9C5] space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#161F33]/80">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#161F33]/80">
                  <span>Estimated Shipping</span>
                  <span className="font-medium">
                    {shippingCharges === 0 ? (
                      <span className="text-[#2E6F73] font-semibold">FREE</span>
                    ) : (
                      formatPrice(shippingCharges)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E5D9C5] flex justify-between items-baseline text-base font-semibold text-[#161F33]">
                  <span>Total</span>
                  <span className="font-serif-editorial text-2xl text-[#3A1042]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="py-3 px-4 border border-[#3A1042] text-[#3A1042] text-xs font-semibold tracking-[0.12em] uppercase hover:bg-[#F3ECE0] transition-colors rounded-xs cursor-pointer"
                >
                  View Bag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="py-3 px-4 bg-[#3A1042] text-[#FAF6F0] text-xs font-semibold tracking-[0.12em] uppercase hover:bg-[#8C2D56] transition-colors flex items-center justify-center gap-1.5 rounded-xs cursor-pointer"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#161F33]/60">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E6F73]" />
                <span>Direct WhatsApp Order Confirmation & Cash on Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
