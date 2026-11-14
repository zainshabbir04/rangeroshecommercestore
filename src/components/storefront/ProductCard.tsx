import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Check, AlertCircle, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const PRODUCT_DISPLAY_META: Record<
  string,
  { fullTitle: string; rating: string; comparePrice: number; savePercent: number }
> = {
  anna: {
    fullTitle: 'Anna Black 2Pc - Stitched Embroidered Dress',
    rating: '4.8',
    comparePrice: 10500,
    savePercent: 29,
  },
  hazel: {
    fullTitle: 'Hazel Red 2Pc - Stitched Embroidered Dress',
    rating: '4.7',
    comparePrice: 10500,
    savePercent: 29,
  },
  olivia: {
    fullTitle: 'Olivia Green 2Pc - Stitched Embroidered Dress',
    rating: '4.9',
    comparePrice: 12500,
    savePercent: 28,
  },
  orchid: {
    fullTitle: 'Orchid Purple 2Pc - Stitched Embroidered Dress',
    rating: '4.9',
    comparePrice: 15990,
    savePercent: 28,
  },
  sabz: {
    fullTitle: 'Sabz Emerald 2Pc - Stitched Embroidered Dress',
    rating: '4.8',
    comparePrice: 11990,
    savePercent: 30,
  },
  zayna: {
    fullTitle: 'Zayna Mustard 2Pc - Stitched Embroidered Lawn Dress',
    rating: '4.7',
    comparePrice: 6990,
    savePercent: 33,
  },
};

function formatRsPrice(amount: number): string {
  return `Rs.${Number(amount || 0).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { setQuickViewProduct } = useStore();
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOutOfStock = product.inventory.available_stock <= 0;
  const isLowStock =
    product.inventory.available_stock > 0 &&
    product.inventory.available_stock <= product.inventory.low_stock_threshold;

  const meta = PRODUCT_DISPLAY_META[product.slug];
  const displayTitle =
    meta?.fullTitle ||
    `${product.name} ${product.color_name ? product.color_name.split(' ')[0] : ''} 2Pc - Stitched Embroidered Dress`;
  const ratingValue = meta?.rating || '4.8';

  const compareAtPrice =
    product.discounted_price !== null &&
    product.discounted_price > 0 &&
    product.discounted_price < product.regular_price
      ? product.regular_price
      : meta?.comparePrice || Math.round((product.effective_price * 1.3) / 100) * 100;

  const savePercent =
    compareAtPrice > product.effective_price
      ? Math.round(((compareAtPrice - product.effective_price) / compareAtPrice) * 100)
      : meta?.savePercent || 25;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const res = addToCart(
      product,
      1,
      product.sizes[0] || product.fit,
      product.colors[0] || product.color_name,
      true
    );

    if (res.success) {
      setAddedFeedback(true);
      setErrorMsg(null);
      setTimeout(() => setAddedFeedback(false), 1800);
    } else {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  return (
    <div
      style={{ animationDelay: `${(index % 6) * 0.35}s` }}
      className="product-card-animated group relative flex flex-col bg-white rounded-xl p-2.5 border border-[#D8B572]/55 shadow-[0_8px_24px_-8px_rgba(58,16,66,0.12)] hover:shadow-[0_20px_42px_-10px_rgba(58,16,66,0.24)] hover:border-[#B8862D] overflow-hidden"
    >
      {/* Top Animated Gold Shimmer Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3A1042] via-[#D8B572] to-[#8C2D56]" />

      {/* Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#F4EDE2] block"
      >
        {/* Subtle Light Sweep Shimmer Over Image */}
        <div className="logo-3d-sheen opacity-20 group-hover:opacity-60" />

        {/* Primary Image */}
        <img
          src={product.primary_image}
          alt={displayTitle}
          loading="lazy"
          className={`h-full w-full object-cover object-top transition-all duration-700 ease-out ${
            product.secondary_image && product.secondary_image !== product.primary_image
              ? 'group-hover:opacity-0 group-hover:scale-105'
              : 'group-hover:scale-105'
          }`}
        />

        {/* Secondary Image on Hover */}
        {product.secondary_image && product.secondary_image !== product.primary_image && (
          <img
            src={product.secondary_image}
            alt={`${displayTitle} alternate view`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top opacity-0 scale-100 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Top-Left Animated Save / Stock Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#161F33] text-white rounded-xs shadow-sm">
              Sold Out
            </span>
          ) : (
            <>
              <span className="save-badge-animated px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#C92A2A] text-white rounded-xs">
                SAVE {savePercent}%
              </span>
              <span className="px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-[#2E6F73]/95 text-white rounded-xs shadow-xs w-fit">
                In Stock
              </span>
            </>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#161F33]/80 via-[#161F33]/35 to-transparent opacity-100 sm:opacity-0 sm:translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-3 text-[11px] font-bold tracking-[0.12em] uppercase flex items-center justify-center gap-1.5 transition-all rounded-md cursor-pointer shadow-md ${
              isOutOfStock
                ? 'bg-gray-400/80 text-white cursor-not-allowed'
                : addedFeedback
                  ? 'bg-[#2E6F73] text-white'
                  : 'bg-[#3A1042] text-[#FAF6F0] hover:bg-[#8C2D56] border border-[#D8B572]/50'
            }`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : addedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#D8B572]" /> Add to Bag
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            title="Quick View"
            className="p-2.5 bg-[#FAF6F0] text-[#3A1042] hover:bg-[#B8862D] hover:text-white transition-colors rounded-md cursor-pointer shadow-md"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </Link>

      {/* Error Toast if Stock Exceeded */}
      {errorMsg && (
        <div className="mt-2 px-3 py-1.5 bg-[#8C2D56] text-white text-[11px] rounded-md flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{errorMsg}</span>
        </div>
      )}

      {/* Centered Product Details Container (Matching Reference Layout + Luxury Styling) */}
      <div className="pt-4 pb-2.5 px-2 text-center flex flex-col items-center justify-between flex-1">
        {/* Descriptive 2Pc Stitched Title */}
        <Link
          to={`/product/${product.slug}`}
          className="text-[14px] sm:text-[15px] font-medium text-[#161F33] hover:text-[#8C2D56] transition-colors leading-snug line-clamp-2 max-w-[260px]"
        >
          {displayTitle}
        </Link>

        {/* Price + Strikethrough Compare Price + 5-Star Rating */}
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[14px] sm:text-[15px] font-semibold text-[#D62828]">
              {formatRsPrice(product.effective_price)}
            </span>
            {compareAtPrice > product.effective_price && (
              <span className="text-[13px] sm:text-[14px] text-[#161F33]/55 line-through">
                {formatRsPrice(compareAtPrice)}
              </span>
            )}
          </div>

          {/* 5 Golden Stars + Rating Number */}
          <div className="flex items-center justify-center gap-1">
            <div className="flex items-center gap-0.5 text-[#F59E0B]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              ))}
            </div>
            <span className="text-xs text-[#161F33]/65 font-medium ml-1">({ratingValue})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
