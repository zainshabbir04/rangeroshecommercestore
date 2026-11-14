import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Scissors,
  Truck,
  MessageCircle,
  Layers,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/storefront/ProductCard';
import { formatPrice } from '../../services/api';

const FALLBACK_BANNER_PRODUCTS = [
  {
    id: 1,
    slug: 'anna',
    name: 'ANNA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    color_name: 'Classic Black with Ivory/Off-White Embroidery',
    fabric: 'Rich Black Textured Fabric',
    fit: 'Relaxed / Straight Fit',
    effective_price: 7490,
    regular_price: 7490,
    overview:
      'Intricate light-toned embroidery on rich black textured fabric paired with a plain-dyed relaxed trouser.',
    primary_image: '/assets/products/anna/1.jpg',
    secondary_image: '/assets/products/anna/2.jpg',
    images: [
      { id: 1, image_url: '/assets/products/anna/1.jpg', alt_text: 'ANNA 1', sort_order: 0, is_primary: 1 },
      { id: 2, image_url: '/assets/products/anna/2.jpg', alt_text: 'ANNA 2', sort_order: 1, is_primary: 0 },
      { id: 3, image_url: '/assets/products/anna/3.jpg', alt_text: 'ANNA 3', sort_order: 2, is_primary: 0 },
    ],
  },
  {
    id: 2,
    slug: 'hazel',
    name: 'HAZEL',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    color_name: 'Cranberry Red with Floral Embroidery',
    fabric: 'Rich Seasonal Textured Fabric',
    fit: 'Relaxed / Straight Fit',
    effective_price: 7490,
    regular_price: 7490,
    overview:
      'Timeless cranberry red ensemble featuring delicate floral threadwork and traditional motifs along the neckline and cuffs.',
    primary_image: '/assets/products/hazel/1.jpg',
    secondary_image: '/assets/products/hazel/2.jpg',
    images: [
      { id: 4, image_url: '/assets/products/hazel/1.jpg', alt_text: 'HAZEL 1', sort_order: 0, is_primary: 1 },
      { id: 5, image_url: '/assets/products/hazel/2.jpg', alt_text: 'HAZEL 2', sort_order: 1, is_primary: 0 },
      { id: 6, image_url: '/assets/products/hazel/3.jpg', alt_text: 'HAZEL 3', sort_order: 2, is_primary: 0 },
    ],
  },
  {
    id: 3,
    slug: 'olivia',
    name: 'OLIVIA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    color_name: 'Deep Olive Green with Multi-color Threadwork',
    fabric: 'Premium Cotton / Linen Blend',
    fit: 'Relaxed Straight Fit',
    effective_price: 8999,
    regular_price: 8999,
    overview:
      'Sophisticated deep olive green 2-piece suit adorned with magenta, teal, blue, and gold floral embroidery.',
    primary_image: '/assets/products/olivia/1.jpg',
    secondary_image: '/assets/products/olivia/2.jpg',
    images: [
      { id: 7, image_url: '/assets/products/olivia/1.jpg', alt_text: 'OLIVIA 1', sort_order: 0, is_primary: 1 },
      { id: 8, image_url: '/assets/products/olivia/2.jpg', alt_text: 'OLIVIA 2', sort_order: 1, is_primary: 0 },
      { id: 9, image_url: '/assets/products/olivia/3.jpg', alt_text: 'OLIVIA 3', sort_order: 2, is_primary: 0 },
    ],
  },
  {
    id: 4,
    slug: 'orchid',
    name: 'ORCHID',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    color_name: 'Deep Plum / Royal Purple with Schiffli Cutwork',
    fabric: 'Premium Smooth Viscose / Cotton Blend',
    fit: 'Relaxed Straight Silhouette',
    effective_price: 11450,
    regular_price: 11450,
    overview:
      'Regal royal plum 2-piece stitched suit accented with cascading floral vines and scalloped schiffli cutwork.',
    primary_image: '/assets/products/orchid/1.webp',
    secondary_image: '/assets/products/orchid/2.webp',
    images: [
      { id: 10, image_url: '/assets/products/orchid/1.webp', alt_text: 'ORCHID 1', sort_order: 0, is_primary: 1 },
      { id: 11, image_url: '/assets/products/orchid/2.webp', alt_text: 'ORCHID 2', sort_order: 1, is_primary: 0 },
      { id: 12, image_url: '/assets/products/orchid/3.webp', alt_text: 'ORCHID 3', sort_order: 2, is_primary: 0 },
    ],
  },
  {
    id: 5,
    slug: 'sabz',
    name: 'SABZ',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    color_name: 'Deep Emerald Green with Antique Gold Tilla',
    fabric: 'Premium Smooth Viscose Silk / Cotton Blend',
    fit: 'Relaxed Longline Straight Cut',
    effective_price: 8450,
    regular_price: 8450,
    overview:
      'Luxurious jewel-toned emerald green ensemble showcasing antique gold tilla and paisley threadwork.',
    primary_image: '/assets/products/sabz/5.png',
    secondary_image: '/assets/products/sabz/6.png',
    images: [
      { id: 13, image_url: '/assets/products/sabz/5.png', alt_text: 'SABZ 1', sort_order: 0, is_primary: 1 },
      { id: 14, image_url: '/assets/products/sabz/6.png', alt_text: 'SABZ 2', sort_order: 1, is_primary: 0 },
      { id: 15, image_url: '/assets/products/sabz/7.png', alt_text: 'SABZ 3', sort_order: 2, is_primary: 0 },
    ],
  },
  {
    id: 6,
    slug: 'zayna',
    name: 'ZAYNA',
    collection_name: 'Rang e Rosh Pret Collection',
    category: '2-Piece Stitched Suit',
    color_name: 'Mustard Yellow with Maroon & Cream Accents',
    fabric: 'Premium Cotton / Viscose Blend',
    fit: 'Straight Cut / Relaxed Fit',
    effective_price: 4700,
    regular_price: 4700,
    overview:
      'Vibrant mustard-yellow 2-piece suit featuring folk-inspired geometric-floral borders and split-cuff sleeves.',
    primary_image: '/assets/products/zayna/1.webp',
    secondary_image: '/assets/products/zayna/2.webp',
    images: [
      { id: 16, image_url: '/assets/products/zayna/1.webp', alt_text: 'ZAYNA 1', sort_order: 0, is_primary: 1 },
      { id: 17, image_url: '/assets/products/zayna/2.webp', alt_text: 'ZAYNA 2', sort_order: 1, is_primary: 0 },
      { id: 18, image_url: '/assets/products/zayna/3.webp', alt_text: 'ZAYNA 3', sort_order: 2, is_primary: 0 },
    ],
  },
];

export const HomePage: React.FC = () => {
  const { settings, products, loading, setIsSizeChartOpen } = useStore();

  const bannerProducts =
    products.length > 0 ? products.slice(0, 6) : (FALLBACK_BANNER_PRODUCTS as any[]);
  const featuredFiltered = products.filter((p) => p.is_featured);
  const featuredProducts = featuredFiltered.length > 0 ? featuredFiltered : products;
  const logoUrl = settings?.logo_url || '/uploads/1794056903993-429854-rang-e-rosh-logo.jpg';

  return (
    <div className="space-y-12 sm:space-y-20 pb-14 sm:pb-20 animate-page-enter">
      {/* 1. LUXURY HERO BANNER IMAGES SHOWCASE (Static Editorial Banner — No Slider) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#200626] via-[#3A1042] to-[#12192B] text-[#FAF6F0] border-b-2 border-[#B8862D]">
        {/* Ambient Decorative Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#8C2D56]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-10 w-96 h-96 rounded-full bg-[#B8862D]/25 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 relative z-10 space-y-8">
          {/* Top Editorial Banner Heading & CTAs */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-center lg:text-left">
            <div className="space-y-3 max-w-2xl mx-auto lg:mx-0">
              <h1 className="wordmark-3d font-serif-editorial text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
                {settings?.hero_title &&
                settings.hero_title !== 'Artisanal Embroidery & Timeless Stitched Elegance' ? (
                  settings.hero_title
                ) : (
                  <>
                    Artisanal Embroidery &amp;{' '}
                    <span className="italic font-normal text-[#F7E3B5]">Stitched Elegance</span>
                  </>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-[#FAF6F0]/85 leading-relaxed">
                {settings?.hero_subtitle ||
                  'Explore our signature 2-piece ladies stitched ensembles—crafted with intricate floral threadwork, antique gold tilla, schiffli cutwork, and fluid modern silhouettes.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 shrink-0">
              <Link
                to="/shop"
                className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#B8862D] via-[#D8B572] to-[#B8862D] text-[#1E0624] text-xs font-extrabold tracking-[0.15em] uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Explore Pret Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6F0] border border-[#D8B572]/60 text-xs font-bold tracking-[0.15em] uppercase transition-all cursor-pointer"
              >
                Size Chart (S, M, L, XL)
              </button>
            </div>
          </div>

          {/* Banner Images Grid (All 6 Signature Ensembles Displayed Together) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {bannerProducts.map((prod) => (
              <Link
                key={prod.slug}
                to={`/product/${prod.slug}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#D8B572]/70 hover:border-[#F7E3B5] bg-[#161F33] shadow-[0_14px_32px_-8px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1.5"
              >
                <img
                  src={prod.primary_image}
                  alt={prod.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-108"
                />

                {/* Gradient Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#16041A]/90 via-[#16041A]/20 to-transparent" />

                {/* Top Price Badge */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3A1042]/90 border border-[#D8B572]/60 text-[#F7E3B5] text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
                    2-Piece
                  </span>
                </div>

                {/* Bottom Product Banner Title & Price */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-3.5 text-left space-y-0.5">
                  <h2 className="font-serif-editorial text-lg sm:text-xl font-bold text-white leading-tight group-hover:text-[#F7E3B5] transition-colors">
                    {prod.name}
                  </h2>
                  <p className="text-[11px] font-bold text-[#D8B572]">
                    {formatPrice(prod.effective_price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SEPARATE TOP SECTION: COMPACT MULTI-COLOR ANIMATED BRAND PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              title: 'Precision Tailoring',
              Icon: Scissors,
              delay: '0s',
              cardBg:
                'bg-gradient-to-r from-[#3A1042] via-[#541860] to-[#3A1042] border-[#D8B572]/60 shadow-[0_8px_20px_-6px_rgba(58,16,66,0.45)]',
              iconBox: 'bg-[#FAF6F0]/15 text-[#F7E3B5] border border-[#D8B572]/60',
              titleClass:
                'bg-gradient-to-r from-[#FAF6F0] via-[#F7E3B5] to-[#D8B572] bg-clip-text text-transparent',
            },
            {
              title: 'Artisanal Embroidery',
              Icon: Sparkles,
              delay: '0.45s',
              cardBg:
                'bg-gradient-to-r from-[#8B6217] via-[#B8862D] to-[#8B6217] border-[#F7E3B5]/70 shadow-[0_8px_20px_-6px_rgba(184,134,45,0.45)]',
              iconBox: 'bg-white/20 text-[#FFFDF9] border border-white/50',
              titleClass:
                'bg-gradient-to-r from-[#FFFFFF] via-[#FFF6DF] to-[#F7E3B5] bg-clip-text text-transparent',
            },
            {
              title: 'WhatsApp Confirmation',
              Icon: MessageCircle,
              delay: '0.9s',
              cardBg:
                'bg-gradient-to-r from-[#1A4B4E] via-[#2E6F73] to-[#1A4B4E] border-[#8CE0E5]/55 shadow-[0_8px_20px_-6px_rgba(46,111,115,0.45)]',
              iconBox: 'bg-white/15 text-[#D4F8FA] border border-[#8CE0E5]/50',
              titleClass:
                'bg-gradient-to-r from-[#FFFFFF] via-[#E2FAFC] to-[#A7EFF4] bg-clip-text text-transparent',
            },
            {
              title: 'Nationwide Delivery',
              Icon: Truck,
              delay: '1.35s',
              cardBg:
                'bg-gradient-to-r from-[#681B3C] via-[#8C2D56] to-[#681B3C] border-[#F5B8D1]/55 shadow-[0_8px_20px_-6px_rgba(140,45,86,0.45)]',
              iconBox: 'bg-white/15 text-[#FDE8F0] border border-[#F5B8D1]/50',
              titleClass:
                'bg-gradient-to-r from-[#FFFFFF] via-[#FDE8F0] to-[#F7C2D7] bg-clip-text text-transparent',
            },
          ].map((item) => {
            const IconComponent = item.Icon;
            return (
              <div
                key={item.title}
                style={{ animationDelay: item.delay }}
                className={`feature-pill-animated group relative rounded-full border px-3.5 py-2.5 overflow-hidden flex items-center gap-2.5 cursor-default ${item.cardBg}`}
              >
                {/* Continuous Light Sweep Shimmer */}
                <div className="logo-3d-sheen opacity-35 group-hover:opacity-75" />

                <div
                  style={{ animationDelay: item.delay }}
                  className={`feature-icon-animated relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${item.iconBox}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                <h3
                  className={`font-couture-unique relative z-10 text-[11px] xl:text-[12px] font-black leading-snug tracking-wide ${item.titleClass}`}
                >
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SEPARATE BOTTOM SECTION: ANIMATED PRET COLLECTION HEADING + 6 PRODUCTS */}
      <section id="featured-collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-b from-white via-[#FAF6F0]/90 to-white border border-[#D8B572]/60 rounded-2xl p-6 sm:p-9 shadow-[0_14px_40px_-14px_rgba(58,16,66,0.14)] overflow-hidden space-y-9">
          {/* Top Animated Gold Shimmer Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3A1042] via-[#B8862D] to-[#8C2D56]" />

          {/* Animated Header Block */}
          <div className="relative text-center flex flex-col items-center">
            <div className="feature-pill-animated inline-flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-[#3A1042]/10 border border-[#B8862D]/50 text-[11px] font-bold tracking-[0.22em] uppercase text-[#8C2D56] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B8862D] animate-pulse" />
              <span>Signature Ensembles</span>
              <Sparkles className="w-3.5 h-3.5 text-[#B8862D] animate-pulse" />
            </div>

            <h2 className="collection-title-shimmer font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-bold mt-2.5 leading-tight">
              The Rang <span className="italic font-normal">e</span> Rosh Pret Collection
            </h2>

            {/* Animated Expanding Gold Divider */}
            <div className="collection-gold-line mx-auto mt-3 rounded-full" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="aspect-[3/4] bg-[#F3ECE0] animate-pulse rounded-xl border border-[#E5D9C5]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 pt-2">
              {featuredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. UNIQUE HERITAGE BRAND STORY SECTION (Left Side Logo Showcase + Right Side Heading & Content) */}
      <section id="brand-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-white via-[#FAF6F0] to-[#F3ECE0] border-2 border-[#D8B572]/65 p-6 sm:p-10 lg:p-12 rounded-3xl shadow-[0_18px_45px_-12px_rgba(58,16,66,0.16)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3A1042] via-[#B8862D] to-[#2E6F73]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* LEFT SIDE (4 Cols): Royal Emblem & Logo Showcase Pedestal */}
            <div className="lg:col-span-4">
              <div className="relative rounded-3xl bg-gradient-to-b from-[#200626] via-[#3A1042] to-[#1A051E] border-2 border-[#D8B572] p-7 sm:p-8 text-center text-white shadow-[0_16px_36px_-10px_rgba(58,16,66,0.45)] overflow-hidden flex flex-col items-center justify-center space-y-5">
                <div className="absolute -top-20 -left-20 w-52 h-52 rounded-full bg-[#B8862D]/20 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-52 h-52 rounded-full bg-[#8C2D56]/30 blur-2xl pointer-events-none" />

                {/* Top Mini Crown Tag */}
                <span className="px-3.5 py-1 rounded-full bg-white/10 border border-[#D8B572]/50 text-[#F7E3B5] text-[10px] font-bold tracking-[0.22em] uppercase">
                  Official Atelier Seal
                </span>

                {/* Large 3D Animated Logo Medallion */}
                <div className="logo-3d-stage py-2">
                  <div className="logo-3d-medallion relative w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1.5 bg-[#FAF6F0] flex items-center justify-center shadow-2xl">
                    <div className="logo-3d-ring" />
                    <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-[#D8B572] bg-[#FAF6F0] p-1 flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt={settings?.store_name || 'Rang e Rosh Official Logo'}
                        className="w-full h-full object-contain"
                      />
                      <div className="logo-3d-sheen" />
                    </div>
                  </div>
                </div>

                {/* Brand Wordmark & Tagline Under Logo */}
                <div className="space-y-1.5">
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-[0.16em] text-white">
                    RANG <span className="italic font-normal text-[#F7E3B5]">e</span> ROSH
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-[1px] w-6 bg-[#D8B572]" />
                    <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#F7E3B5]">
                      Ladies Stitched Suits
                    </p>
                    <span className="h-[1px] w-6 bg-[#D8B572]" />
                  </div>
                </div>

                {/* Mini Signature Badges */}
                <div className="w-full grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-[10px] font-bold uppercase tracking-wider text-[#FAF6F0]/90">
                  <div className="py-2 px-2.5 rounded-xl bg-white/10 border border-[#D8B572]/30">
                    2-Piece Pret
                  </div>
                  <div className="py-2 px-2.5 rounded-xl bg-white/10 border border-[#D8B572]/30">
                    6 Signature Suits
                  </div>
                </div>

                <Link
                  to="/about"
                  className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#B8862D] via-[#D8B572] to-[#B8862D] text-[#1A051E] text-[11px] font-extrabold uppercase tracking-[0.16em] hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>About Rang e Rosh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* RIGHT SIDE (8 Cols): Heading, Brand Story Content & 3 Multi-Color Craft Cards */}
            <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <span className="feature-pill-animated inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3A1042] text-[#F7E3B5] text-[10px] font-bold tracking-[0.24em] uppercase border border-[#D8B572]/60 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D8B572]" />
                  The House of Rang e Rosh
                  <Sparkles className="w-3.5 h-3.5 text-[#D8B572]" />
                </span>

                <h2 className="collection-title-shimmer font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {settings?.promo_banner_title &&
                  settings.promo_banner_title !== 'Crafted for Poise & Everyday Luxury'
                    ? settings.promo_banner_title
                    : 'Where Heritage Threadwork Meets Modern Silhouette'}
                </h2>

                <div className="collection-gold-line mx-auto lg:mx-0 rounded-full" />
              </div>

              <p className="text-sm sm:text-base text-[#161F33]/85 leading-relaxed">
                {settings?.promo_banner_subtitle &&
                !settings.promo_banner_subtitle.startsWith(
                  'Every Rang e Rosh ensemble features high-density precision tailoring'
                ) ? (
                  settings.promo_banner_subtitle
                ) : (
                  <>
                    <strong>Rang e Rosh</strong> is dedicated to the art of the 2-piece ladies
                    stitched suit. From the deep emerald tilla work of <em>SABZ</em> and the royal
                    plum schiffli cutwork of <em>ORCHID</em>, to the vibrant folk-inspired borders
                    of <em>ZAYNA</em> and timeless contrasts of <em>ANNA</em>, <em>HAZEL</em>, and{' '}
                    <em>OLIVIA</em>—each garment is engineered with high-density seam construction,
                    structured necklines, and fluid silhouettes designed for effortless grace.
                  </>
                )}
              </p>

              {/* 3 Multi-Color Craftsmanship Cards on the Right Side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-left">
                {[
                  {
                    title: 'Refined Fabrics',
                    desc: 'Smooth viscose-silk blends, premium cotton-linen weaves, and rich seasonal textures selected for drape and breathability.',
                    Icon: Layers,
                    cardStyle:
                      'bg-gradient-to-br from-[#3A1042] to-[#541860] text-[#FAF6F0] border-[#D8B572]/60',
                    iconStyle: 'bg-[#FAF6F0]/15 text-[#F7E3B5] border-[#D8B572]/50',
                    delay: '0s',
                  },
                  {
                    title: 'Master Construction',
                    desc: 'Reinforced embroidery backing ensures necklines and side panels lie flat without bunching or wrinkling.',
                    Icon: Scissors,
                    cardStyle:
                      'bg-gradient-to-br from-[#8B6217] to-[#B8862D] text-white border-[#F7E3B5]/70',
                    iconStyle: 'bg-white/20 text-[#FFFDF9] border-white/50',
                    delay: '0.4s',
                  },
                  {
                    title: 'Personal Concierge',
                    desc: 'Every online order generates an itemized WhatsApp confirmation so you stay directly connected with our dispatch team.',
                    Icon: ShieldCheck,
                    cardStyle:
                      'bg-gradient-to-br from-[#1A4B4E] to-[#2E6F73] text-white border-[#8CE0E5]/55',
                    iconStyle: 'bg-white/15 text-[#D4F8FA] border-[#8CE0E5]/50',
                    delay: '0.8s',
                  },
                ].map((pillar) => {
                  const PillarIcon = pillar.Icon;
                  return (
                    <div
                      key={pillar.title}
                      style={{ animationDelay: pillar.delay }}
                      className={`product-card-animated relative p-4 sm:p-5 rounded-2xl border shadow-md overflow-hidden ${pillar.cardStyle}`}
                    >
                      <div className="logo-3d-sheen opacity-25" />
                      <div className="relative z-10 flex items-center gap-2.5 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${pillar.iconStyle}`}
                        >
                          <PillarIcon className="w-4 h-4" />
                        </div>
                        <span className="font-couture-unique text-[11px] sm:text-xs font-bold tracking-wider uppercase text-[#F7E3B5]">
                          {pillar.title}
                        </span>
                      </div>
                      <p className="relative z-10 text-xs text-white/85 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
