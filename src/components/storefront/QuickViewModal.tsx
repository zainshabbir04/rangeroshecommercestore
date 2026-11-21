import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Check, Plus, Minus, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../services/api';
import { STANDARD_SIZES } from '../../types';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct } = useStore();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedImage(quickViewProduct.primary_image);
      const sizeStockMap = quickViewProduct.inventory.size_stock || {};
      const firstAvail =
        STANDARD_SIZES.find((s) => (sizeStockMap[s] ?? 1) > 0) ||
        quickViewProduct.sizes[0] ||
        'Small';
      setSelectedSize(firstAvail);
      setSelectedColor(quickViewProduct.colors[0] || quickViewProduct.color_name || '');
      setQuantity(1);
      setFeedback(null);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const sizeStockMap = quickViewProduct.inventory.size_stock || {};
  const getSizeStock = (s: string) =>
    s in sizeStockMap
      ? Number(sizeStockMap[s] ?? 0)
      : Math.max(0, Math.floor(quickViewProduct.inventory.available_stock / 4));

  const selectedSizeStock = selectedSize
    ? getSizeStock(selectedSize)
    : quickViewProduct.inventory.available_stock;
  const isOutOfStock = quickViewProduct.inventory.available_stock <= 0 || selectedSizeStock <= 0;
  const maxStock = selectedSizeStock;

  const handleAdd = (buyNow = false) => {
    const res = addToCart(
      quickViewProduct,
      quantity,
      selectedSize,
      selectedColor,
      !buyNow
    );
    if (!res.success) {
      setFeedback({ type: 'error', text: res.message });
      return;
    }
    if (buyNow) {
      setQuickViewProduct(null);
      navigate('/checkout');
    } else {
      setQuickViewProduct(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-[#161F33]/70 backdrop-blur-xs"
      />

      <div className="relative z-10 w-full max-w-4xl bg-[#FAF6F0] border border-[#E5D9C5] rounded-xs shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 text-[#161F33] hover:bg-[#3A1042] hover:text-white transition-colors cursor-pointer shadow-sm"
          aria-label="Close quick view"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Image Gallery */}
        <div className="bg-[#F3ECE0] p-4 flex flex-col gap-3 overflow-y-auto">
          <div className="aspect-[3/4] w-full bg-white rounded-xs overflow-hidden border border-[#E5D9C5]">
            <img
              src={selectedImage || quickViewProduct.primary_image}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {quickViewProduct.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickViewProduct.images.slice(0, 6).map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-14 h-20 shrink-0 rounded-xs overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === img.image_url
                      ? 'border-[#3A1042] scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#8C2D56]">
                {quickViewProduct.collection_name}
              </p>
              <h2 className="font-serif-editorial text-3xl font-bold text-[#161F33] mt-1">
                {quickViewProduct.name}
              </h2>
              <p className="text-xs text-[#161F33]/60 mt-0.5">SKU: {quickViewProduct.sku}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-[#3A1042]">
                {formatPrice(quickViewProduct.effective_price)}
              </span>
              {quickViewProduct.discounted_price &&
                quickViewProduct.discounted_price < quickViewProduct.regular_price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(quickViewProduct.regular_price)}
                  </span>
                )}
              <span
                className={`ml-auto px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-xs ${
                  isOutOfStock
                    ? 'bg-red-100 text-red-800'
                    : 'bg-[#2E6F73]/15 text-[#2E6F73]'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
              </span>
            </div>

            <p className="text-sm text-[#161F33]/80 leading-relaxed line-clamp-4">
              {quickViewProduct.overview}
            </p>

            <div className="space-y-3 pt-2 border-t border-[#E5D9C5]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#161F33]/70">
                  Color:{' '}
                </span>
                <span className="text-xs font-medium text-[#161F33]">
                  {selectedColor || quickViewProduct.color_name}
                </span>
                {quickViewProduct.colors.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {quickViewProduct.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1 text-xs border rounded-xs cursor-pointer ${
                          selectedColor === c
                            ? 'border-[#3A1042] bg-[#3A1042] text-white'
                            : 'border-[#E5D9C5] bg-white text-[#161F33]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#161F33]/70">
                  Select Size:{' '}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                  {STANDARD_SIZES.map((s) => {
                    const st = getSizeStock(s);
                    const soldOut = st <= 0;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={soldOut}
                        onClick={() => {
                          setSelectedSize(s);
                          setQuantity((q) => Math.min(q, Math.max(1, st)));
                        }}
                        className={`px-2.5 py-2 text-xs font-bold border rounded-lg transition-colors flex flex-col items-center ${
                          soldOut
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : selectedSize === s
                              ? 'border-[#3A1042] bg-[#3A1042] text-white cursor-pointer'
                              : 'border-[#E5D9C5] bg-white text-[#161F33] hover:border-[#3A1042] cursor-pointer'
                        }`}
                      >
                        <span>{s}</span>
                        <span
                          className={`text-[10px] font-medium ${
                            soldOut
                              ? 'text-red-400'
                              : selectedSize === s
                                ? 'text-[#F7E3B5]'
                                : 'text-[#2E6F73]'
                          }`}
                        >
                          {soldOut ? 'Sold Out' : 'In Stock'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xs text-xs font-medium ${
                  feedback.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {feedback.text}
              </div>
            )}
          </div>

          <div className="pt-5 mt-5 border-t border-[#E5D9C5] space-y-3">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="inline-flex items-center border border-[#E5D9C5] bg-white rounded-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="p-2.5 text-[#161F33] hover:bg-[#F3ECE0] disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-semibold text-[#161F33]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxStock || 1, q + 1))}
                  disabled={isOutOfStock || quantity >= maxStock}
                  className="p-2.5 text-[#161F33] hover:bg-[#F3ECE0] disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAdd(false)}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-4 bg-[#3A1042] text-[#FAF6F0] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-[#8C2D56] disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2 rounded-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleAdd(true)}
                disabled={isOutOfStock}
                className="flex-1 py-2.5 px-4 border border-[#B8862D] bg-[#B8862D]/10 text-[#3A1042] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-[#B8862D] hover:text-white disabled:opacity-40 transition-colors rounded-xs cursor-pointer"
              >
                Buy It Now
              </button>

              <Link
                to={`/product/${quickViewProduct.slug}`}
                onClick={() => setQuickViewProduct(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3A1042] hover:text-[#8C2D56] uppercase tracking-wider"
              >
                <span>Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
