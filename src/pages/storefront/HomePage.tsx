import React, { useState, useEffect } from 'react';
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

const HERO_BANNER_SLIDES = [
  {
    id: 1,
    slug: 'anna',
    name: 'ANNA',
    image: '/assets/banners/banner-1-anna.jpg',
    alt: 'Rang e Rosh — Elegance Reimagined (ANNA Black Embroidered 2-Piece Suit)',
  },
  {
    id: 2,
    slug: 'orchid',
    name: 'ORCHID',
    image: '/assets/banners/banner-2-orchid.jpg',
    alt: 'Rang e Rosh — Timeless Elegance in Every Thread (ORCHID Royal Purple 2-Piece Suit)',
  },
  {
    id: 3,
    slug: 'hazel',
    name: 'HAZEL',
    image: '/assets/banners/banner-3-hazel.jpg',
    alt: 'Rang e Rosh — Colours That Reflect Your Elegance (HAZEL Cranberry Red 2-Piece Suit)',
  },
  {
    id: 4,
    slug: 'zayna',
    name: 'ZAYNA',
    image: '/assets/banners/banner-4-zayna.jpg',
    alt: 'Rang e Rosh — The Festive Collection (ZAYNA Mustard 2-Piece Suit)',
  },
  {
    id: 5,
    slug: 'sabz',
    name: 'SABZ',
    image: '/assets/banners/banner-5-sabz.jpg',
    alt: 'Rang e Rosh — Crafted with Grace, Worn with Elegance (SABZ Emerald Green 2-Piece Suit)',
  },
  {
    id: 6,
    slug: 'olivia',
    name: 'OLIVIA',
    image: '/assets/banners/banner-6-olivia.jpg',
    alt: 'Rang e Rosh — Timeless Elegance, Grace in Every Thread (OLIVIA Olive Green 2-Piece Suit)',
  },
];

const LOOPED_BANNER_SLIDES = [...HERO_BANNER_SLIDES, HERO_BANNER_SLIDES[0]];

export const HomePage: React.FC = () => {
  const { settings, products, loading } = useStore();
  const [slideIndex, setSlideIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);

  const totalSlides = HERO_BANNER_SLIDES.length;

  // Advance every 3 seconds in a continuous forward loop
  useEffect(() => {
    const timer = window.setInterval(() => {
      setEnableTransition(true);
      setSlideIndex((prev) => prev + 1);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  // Seamless infinite loop reset when reaching the cloned first slide at the end
  useEffect(() => {
    if (slideIndex === totalSlides) {
      const resetTimer = window.setTimeout(() => {
        setEnableTransition(false);
        setSlideIndex(0);
      }, 650);
      return () => window.clearTimeout(resetTimer);
    }
  }, [slideIndex, totalSlides]);

  const activeDotIndex = slideIndex % totalSlides;

  const featuredFiltered = products.filter((p) => p.is_featured);
  const featuredProducts = featuredFiltered.length > 0 ? featuredFiltered : products;
  const logoUrl = settings?.logo_url || '/assets/logo/rang-e-rosh-logo-v2.jpg';

  return (
    <div className="space-y-10 sm:space-y-16 pb-14 sm:pb-20 animate-page-enter">
      {/* 1. HERO BANNER INFINITE LOOPING SLIDER (2s Speed, No Arrow Icons) */}
      <section className="relative w-full overflow-hidden bg-[#16041A] border-b-2 border-[#B8862D] select-none">
        <div className="relative w-full max-w-[1600px] mx-auto aspect-[16/9] max-h-[680px] overflow-hidden">
          {/* Seamless Infinite Forward Sliding Track */}
          <div
            className={`flex w-full h-full ${
              enableTransition ? 'transition-transform duration-600 ease-in-out' : ''
            }`}
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {LOOPED_BANNER_SLIDES.map((slide, idx) => (
              <Link
                key={`${slide.id}-${idx}`}
                to={`/product/${slide.slug}`}
                className="w-full h-full shrink-0 relative block group focus:outline-none"
                aria-label={`Shop ${slide.name}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-full object-cover object-center"
                />
              </Link>
            ))}
          </div>

          {/* Bottom Loop Indicator Dots */}
          <div className="absolute bottom-2.5 sm:bottom-4 inset-x-0 z-20 flex items-center justify-center gap-1.5 sm:gap-2.5">
            <div className="px-3 py-1.5 rounded-full bg-[#16041A]/70 backdrop-blur-xs border border-[#D8B572]/50 flex items-center gap-1.5 sm:gap-2">
              {HERO_BANNER_SLIDES.map((slide, idx) => {
                const isActive = idx === activeDotIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => {
                      setEnableTransition(true);
                      setSlideIndex(idx);
                    }}
                    aria-label={`Go to banner ${idx + 1}: ${slide.name}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      isActive
                        ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-gradient-to-r from-[#D8B572] via-[#F7E3B5] to-[#B8862D] shadow-[0_0_8px_rgba(216,181,114,0.8)]'
                        : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/45 hover:bg-white/80'
                    }`}
                  />
                );
              })}
            </div>
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
