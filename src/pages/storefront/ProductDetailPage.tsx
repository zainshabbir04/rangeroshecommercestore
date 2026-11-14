import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  Image as ImageIcon,
  ShieldCheck,
  Truck,
  MessageCircle,
  AlertCircle,
  Sparkles,
  Ruler,
  Star,
  Scissors,
  Layers,
  Droplets,
  Palette,
  ChevronDown,
} from 'lucide-react';
import { Product, STANDARD_SIZES } from '../../types';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/storefront/ProductCard';
import { UniversalVideoPlayer } from '../../components/common/UniversalVideoPlayer';

const PRODUCT_META_LOOKUP: Record<
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

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { settings, setIsSizeChartOpen } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('');

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api
      .getProductDetail(slug)
      .then((res) => {
        setProduct(res.product);
        setRelatedProducts(res.relatedProducts);
        setActiveMediaIndex(0);
        setShowVideo(false);
        const sizeStockMap = res.product.inventory.size_stock || {};
        const firstAvailableSize =
          STANDARD_SIZES.find((s) => (sizeStockMap[s] ?? 1) > 0) ||
          res.product.sizes[0] ||
          'Small';
        setSelectedSize(firstAvailableSize);
        setSelectedColor(res.product.colors[0] || res.product.color_name || '');
        setQuantity(1);
        setFeedback(null);
        document.title = `${res.product.name} — ${res.product.collection_name} | Rang e Rosh`;
      })
      .catch((err) => {
        setError(err.message || 'Product not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="h-28 bg-[#F3ECE0] animate-pulse rounded-3xl border border-[#E5D9C5]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-[3/4] bg-[#F3ECE0] animate-pulse rounded-3xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-12 bg-[#F3ECE0] animate-pulse w-3/4 rounded-2xl" />
            <div className="h-36 bg-[#F3ECE0] animate-pulse w-full rounded-2xl" />
            <div className="h-48 bg-[#F3ECE0] animate-pulse w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif-editorial text-4xl font-bold text-[#161F33]">
          Ensemble Not Found
        </h1>
        <p className="text-sm text-[#161F33]/70">
          {error || 'The requested product could not be found.'}
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#3A1042] text-white text-xs font-semibold uppercase tracking-wider rounded-full"
        >
          Return to Pret Collection
        </Link>
      </div>
    );
  }

  const sizeOptions = STANDARD_SIZES;
  const sizeStockMap = product.inventory.size_stock || {};
  const getSizeStock = (sizeName: string): number => {
    if (sizeName in sizeStockMap) {
      return Number(sizeStockMap[sizeName] ?? 0);
    }
    return Math.max(0, Math.floor(product.inventory.available_stock / 4));
  };

  const selectedSizeStock = selectedSize ? getSizeStock(selectedSize) : product.inventory.available_stock;
  const isOutOfStock = product.inventory.available_stock <= 0 || selectedSizeStock <= 0;
  const maxStock = selectedSizeStock;

  const meta = PRODUCT_META_LOOKUP[product.slug];
  const fullDescriptiveTitle =
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

  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            id: 0,
            image_url: product.primary_image,
            alt_text: product.name,
            sort_order: 0,
            is_primary: 1,
          },
        ];

  const currentImage = images[activeMediaIndex] || images[0];

  const handleAddToCart = (buyNow = false) => {
    const res = addToCart(product, quantity, selectedSize, selectedColor, !buyNow);
    if (!res.success) {
      setFeedback({ type: 'error', text: res.message });
      return;
    }
    setFeedback({ type: 'success', text: res.message });
    if (buyNow) {
      navigate('/checkout');
    } else {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const whatsappInquiryMsg = encodeURIComponent(
    `Assalam-o-Alaikum Rang e Rosh! I would like to inquire about *${fullDescriptiveTitle}* (SKU: ${product.sku}, Size: ${selectedSize || 'Medium'}, Price: ${formatRsPrice(product.effective_price)}).`
  );
  const whatsappClean = settings?.whatsapp_clean || '923200300552';

  const accordionSections = [
    {
      id: 'embroidered',
      title: 'Embroidered Details',
      content: product.embroidered_details,
      Icon: Sparkles,
      badgeColor: 'bg-[#3A1042] text-[#F7E3B5]',
    },
    {
      id: 'stitching',
      title: 'Suit Stitching & Construction',
      content: product.suit_stitching,
      Icon: Scissors,
      badgeColor: 'bg-[#B8862D] text-white',
    },
    {
      id: 'architecture',
      title: 'Outfit Architecture',
      content: product.outfit_architecture,
      Icon: Layers,
      badgeColor: 'bg-[#2E6F73] text-white',
    },
    {
      id: 'wash',
      title: 'Wash & Care Instructions',
      content: product.wash_care,
      Icon: Droplets,
      badgeColor: 'bg-[#8C2D56] text-white',
    },
    {
      id: 'disclaimer',
      title: 'Colour Disclaimer',
      content: product.color_disclaimer,
      Icon: Palette,
      badgeColor: 'bg-[#161F33] text-[#F7E3B5]',
    },
  ].filter((sec) => Boolean(sec.content));

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10 space-y-8 sm:space-y-10 animate-page-enter">
      {/* 1. TOP LUXURY PRODUCT HEADING BANNER (Shown Directly Above the Images) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#200626] via-[#3A1042] to-[#1A051E] text-white border-2 border-[#D8B572] p-4 sm:p-7 shadow-[0_16px_40px_-12px_rgba(58,16,66,0.38)]">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B8862D] via-[#F7E3B5] to-[#8C2D56]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Breadcrumb + Collection Pill */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#FAF6F0]/75">
              <Link to="/" className="hover:text-[#F7E3B5] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-[#F7E3B5] transition-colors">
                Pret Collection
              </Link>
              <span>/</span>
              <span className="text-[#F7E3B5] font-bold">{product.name}</span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/10 border border-[#D8B572]/40 text-[10px] font-mono text-[#F7E3B5]">
                SKU: {product.sku}
              </span>
            </div>

            {/* Main Product Heading Above Images */}
            <h1 className="wordmark-3d font-serif-editorial text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {fullDescriptiveTitle}
            </h1>

            <p className="text-xs sm:text-sm text-[#F7E3B5]/90 font-medium">
              {product.product_type_detail} • {product.color_name}
            </p>
          </div>

          {/* Right Side of Top Banner: Price, Save Badge & 5-Star Rating */}
          <div className="flex flex-wrap lg:flex-col lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/15 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="save-badge-animated px-3 py-1 rounded-full bg-[#C92A2A] text-white text-xs font-extrabold uppercase tracking-wider">
                SAVE {savePercent}%
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  isOutOfStock
                    ? 'bg-red-950/80 text-red-200 border-red-400/40'
                    : 'bg-[#2E6F73] text-white border-[#8CE0E5]/50'
                }`}
              >
                {isOutOfStock ? 'Sold Out' : 'In Stock'}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="font-serif-editorial text-2xl sm:text-3xl font-bold text-[#F7E3B5]">
                {formatRsPrice(product.effective_price)}
              </span>
              {compareAtPrice > product.effective_price && (
                <span className="text-sm text-white/55 line-through">
                  {formatRsPrice(compareAtPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              ))}
              <span className="text-xs text-[#FAF6F0]/85 font-semibold ml-1">
                ({ratingValue} / 5.0 Customer Rating)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN PRODUCT SHOWCASE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column (7 cols): Interactive Gallery + 4 Multi-Color Spec Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gallery Box */}
          <div className="bg-white border-2 border-[#D8B572]/60 rounded-3xl p-4 sm:p-5 shadow-[0_14px_38px_-12px_rgba(58,16,66,0.14)] space-y-4">
            {/* Top Bar Inside Gallery: Product Mini Title + Photo/Video Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5D9C5]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8862D]" />
                <span className="font-couture-unique text-xs font-bold uppercase tracking-wider text-[#3A1042]">
                  {product.name} — Studio Lookbook ({activeMediaIndex + 1}/{images.length})
                </span>
              </div>

              {product.video_url && (
                <div className="inline-flex rounded-full p-1 bg-[#FAF6F0] border border-[#D8B572]/50">
                  <button
                    type="button"
                    onClick={() => setShowVideo(false)}
                    className={`px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      !showVideo
                        ? 'bg-[#3A1042] text-white shadow-xs'
                        : 'text-[#161F33]/75 hover:text-[#3A1042]'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photos ({images.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVideo(true)}
                    className={`px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      showVideo
                        ? 'bg-[#3A1042] text-white shadow-xs'
                        : 'text-[#161F33]/75 hover:text-[#3A1042]'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current text-[#D8B572]" />
                    <span>Video Reel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Craftsmanship & Care Tabs Directly Above the Image */}
            {accordionSections.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {accordionSections.map((sec) => {
                    const IconComp = sec.Icon;
                    const isActive = openAccordion === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setOpenAccordion(isActive ? '' : sec.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer border ${
                          isActive
                            ? 'bg-gradient-to-r from-[#3A1042] via-[#541860] to-[#3A1042] text-[#F7E3B5] border-[#D8B572] shadow-md scale-[1.02]'
                            : 'bg-[#FAF6F0] text-[#161F33] border-[#E5D9C5] hover:border-[#B8862D] hover:bg-white'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-[#D8B572] text-[#200626]' : sec.badgeColor
                          }`}
                        >
                          <IconComp className="w-3 h-3" />
                        </span>
                        <span>{sec.title}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-300 ${
                            isActive ? 'rotate-180 text-[#F7E3B5]' : 'text-[#B8862D]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Active Tab Content Panel (Shown Right Above the Image When Selected) */}
                {accordionSections.map((sec) => {
                  if (openAccordion !== sec.id) return null;
                  const IconComp = sec.Icon;
                  return (
                    <div
                      key={sec.id}
                      className="rounded-2xl bg-gradient-to-br from-[#FAF6F0] via-white to-[#F9F3FB] border-2 border-[#D8B572] p-4 shadow-md space-y-2 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E5D9C5]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${sec.badgeColor}`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                          </span>
                          <h3 className="font-serif-editorial text-base sm:text-lg font-bold text-[#3A1042]">
                            {sec.title}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOpenAccordion('')}
                          className="px-2.5 py-0.5 rounded-full bg-[#3A1042]/10 hover:bg-[#3A1042] text-[#3A1042] hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Close ✕
                        </button>
                      </div>
                      <div className="text-xs sm:text-[13px] text-[#161F33]/85 whitespace-pre-line leading-relaxed">
                        {sec.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Side-by-Side Thumbnails + Main Image Viewer */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
              {/* Vertical Thumbnail Strip on Desktop (2 cols) */}
              <div className="order-2 sm:order-1 sm:col-span-2 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[540px] pb-1 sm:pb-0 sm:pr-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => {
                      setShowVideo(false);
                      setActiveMediaIndex(idx);
                    }}
                    className={`w-16 sm:w-full aspect-[3/4] shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      !showVideo && activeMediaIndex === idx
                        ? 'border-[#3A1042] ring-2 ring-[#B8862D] scale-[1.03]'
                        : 'border-[#E5D9C5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}

                {product.video_url && (
                  <button
                    type="button"
                    onClick={() => setShowVideo(true)}
                    className={`w-16 sm:w-full aspect-[3/4] shrink-0 rounded-xl overflow-hidden border-2 bg-[#3A1042] text-[#FAF6F0] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      showVideo ? 'border-[#B8862D] ring-2 ring-[#B8862D]' : 'border-[#3A1042]/60'
                    }`}
                  >
                    <Play className="w-5 h-5 fill-current text-[#D8B572]" />
                    <span className="text-[9px] uppercase tracking-wider font-bold">Video</span>
                  </button>
                )}
              </div>

              {/* Main Portrait Image Frame (10 cols) */}
              <div className="order-1 sm:order-2 sm:col-span-10 relative aspect-[3/4] w-full bg-[#F4EDE2] rounded-2xl overflow-hidden border border-[#D8B572]/50 shadow-md">
                {showVideo && product.video_url ? (
                  <UniversalVideoPlayer
                    src={product.video_url}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={currentImage.image_url}
                      alt={currentImage.alt_text || fullDescriptiveTitle}
                      className="w-full h-full object-cover object-top transition-all duration-500"
                    />

                    {/* Top Overlay Title Pill on Image */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-[#200626]/85 border border-[#D8B572]/60 backdrop-blur-xs text-[#F7E3B5] text-[11px] font-bold tracking-wider uppercase truncate">
                        {product.name} • {formatRsPrice(product.effective_price)}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#161F33]/80 text-white text-[11px] font-semibold">
                        {activeMediaIndex + 1} / {images.length}
                      </span>
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMediaIndex((idx) => (idx - 1 + images.length) % images.length)
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#161F33] hover:bg-[#3A1042] hover:text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMediaIndex((idx) => (idx + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#161F33] hover:bg-[#3A1042] hover:text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Purchase Console & 4 Multi-Color Product Specification Cards */}
        <div className="lg:col-span-5 space-y-5">
          {/* Boutique Purchase Console Card */}
          <div className="bg-white border-2 border-[#D8B572]/60 rounded-3xl p-5 sm:p-6 shadow-[0_14px_38px_-12px_rgba(58,16,66,0.14)] space-y-5">
            {/* Overview */}
            <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#E5D9C5] space-y-1.5">
              <span className="font-couture-unique text-[10px] font-bold uppercase tracking-wider text-[#8C2D56] block">
                Atelier Overview
              </span>
              <p className="text-xs sm:text-sm text-[#161F33]/85 leading-relaxed">
                {product.overview}
              </p>
            </div>

            {/* Color Selector */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold uppercase tracking-wider text-[#161F33]/70">
                  Color Selection
                </span>
                <span className="font-semibold text-[#3A1042]">
                  {selectedColor || product.color_name}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.colors.length > 0 ? product.colors : [product.color_name]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                      selectedColor === c
                        ? 'border-[#D8B572] bg-gradient-to-r from-[#3A1042] to-[#561961] text-white shadow-sm'
                        : 'border-[#E5D9C5] bg-[#FAF6F0] text-[#161F33] hover:border-[#3A1042]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector (Small, Medium, Large, Extra Large) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-[#161F33]/75">
                    Select Size:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3A1042] text-[#F7E3B5] text-[11px] font-bold">
                    {selectedSize}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3A1042]/10 text-[#3A1042] hover:bg-[#3A1042] hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#B8862D]" />
                  <span>Size Chart</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {sizeOptions.map((size) => {
                  const stockForThisSize = getSizeStock(size);
                  const isSizeSoldOut = stockForThisSize <= 0;
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isSizeSoldOut}
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity((q) => Math.min(q, Math.max(1, stockForThisSize)));
                        setFeedback(null);
                      }}
                      className={`py-2.5 px-2.5 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isSizeSoldOut
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 line-through'
                          : isSelected
                            ? 'border-[#D8B572] bg-gradient-to-r from-[#3A1042] to-[#561961] text-[#FAF6F0] shadow-md scale-[1.02] cursor-pointer'
                            : 'border-[#E5D9C5] bg-[#FAF6F0] text-[#161F33] hover:border-[#3A1042] cursor-pointer'
                      }`}
                    >
                      <span className="text-xs font-extrabold tracking-wide">{size}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isSizeSoldOut
                            ? 'text-red-500'
                            : isSelected
                              ? 'text-[#F7E3B5]'
                              : 'text-[#2E6F73]'
                        }`}
                      >
                        {isSizeSoldOut ? 'Sold Out' : 'In Stock'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Banner */}
            {feedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  feedback.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-[#2E6F73]/15 text-[#1D4E52] border border-[#2E6F73]/40'
                }`}
              >
                {feedback.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <Check className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Quantity + Add to Bag */}
            <div className="flex items-center gap-3 pt-1">
              <div className="inline-flex items-center border-2 border-[#D8B572]/60 bg-[#FAF6F0] rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="w-9 h-9 rounded-full text-[#161F33] hover:bg-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-[#161F33]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxStock || 1, q + 1))}
                  disabled={isOutOfStock || quantity >= maxStock}
                  className="w-9 h-9 rounded-full text-[#161F33] hover:bg-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-5 bg-gradient-to-r from-[#3A1042] via-[#541860] to-[#3A1042] hover:from-[#8C2D56] hover:to-[#681B3C] disabled:opacity-40 text-[#FAF6F0] text-xs font-extrabold tracking-[0.14em] uppercase rounded-full border border-[#D8B572]/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <ShoppingBag className="w-4 h-4 text-[#F7E3B5]" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
              </button>
            </div>

            {/* Express Buy Now & WhatsApp Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={isOutOfStock}
                className="py-3 px-4 bg-gradient-to-r from-[#8B6217] via-[#B8862D] to-[#8B6217] hover:opacity-95 disabled:opacity-40 text-white text-[11px] font-extrabold tracking-[0.14em] uppercase rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buy It Now</span>
              </button>

              <a
                href={`https://wa.me/${whatsappClean}?text=${whatsappInquiryMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-gradient-to-r from-[#1A4B4E] to-[#2E6F73] hover:opacity-95 text-white text-[11px] font-extrabold tracking-[0.14em] uppercase rounded-full transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Inquiry</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E5D9C5] text-[11px] font-semibold">
              <div className="p-2.5 bg-[#FAF6F0] rounded-xl flex items-center gap-2 text-[#3A1042]">
                <Truck className="w-4 h-4 text-[#B8862D] shrink-0" />
                <span>3–4 Days Delivery</span>
              </div>
              <div className="p-2.5 bg-[#FAF6F0] rounded-xl flex items-center gap-2 text-[#1D4E52]">
                <ShieldCheck className="w-4 h-4 text-[#2E6F73] shrink-0" />
                <span>7-Day Easy Return</span>
              </div>
            </div>
          </div>

          {/* 4 Multi-Color Product Specification Cards on the Right Side */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
            {[
              {
                label: 'Product Type',
                value: product.product_type_detail || '2-Piece Stitched Suit',
                style: 'bg-[#F9F3FB] border-[#3A1042]/25 text-[#3A1042]',
                delay: '0s',
              },
              {
                label: 'Color Palette',
                value: product.color_name,
                style: 'bg-[#FDF9F0] border-[#B8862D]/35 text-[#785312]',
                delay: '0.25s',
              },
              {
                label: 'Fabric Weave',
                value: product.fabric || 'Premium Seasonal Weave',
                style: 'bg-[#F0F9F9] border-[#2E6F73]/30 text-[#1D4E52]',
                delay: '0.5s',
              },
              {
                label: 'Silhouette Fit',
                value: product.fit || 'Relaxed Straight Fit',
                style: 'bg-[#FCF2F6] border-[#8C2D56]/30 text-[#6E1E40]',
                delay: '0.75s',
              },
            ].map((spec) => (
              <div
                key={spec.label}
                style={{ animationDelay: spec.delay }}
                className={`product-card-animated p-4 rounded-2xl border shadow-2xs ${spec.style}`}
              >
                <span className="block text-[9px] font-extrabold uppercase tracking-[0.16em] opacity-75">
                  {spec.label}
                </span>
                <p className="font-serif-editorial text-sm sm:text-base font-bold leading-snug mt-1">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. RELATED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-[#E5D9C5]">
          <div className="bg-white/90 border border-[#D8B572]/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-7">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-bold tracking-[0.22em] uppercase text-[#8C2D56]">
                Complete Your Wardrobe
              </span>
              <h2 className="collection-title-shimmer font-serif-editorial text-3xl sm:text-5xl font-bold">
                You May Also Admire
              </h2>
              <div className="collection-gold-line mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel, idx) => (
                <ProductCard key={rel.id} product={rel} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
