import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Scissors,
  ShieldCheck,
  Truck,
  MessageCircle,
  Layers,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Ruler,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AboutPage: React.FC = () => {
  const { settings, setIsSizeChartOpen } = useStore();
  const logoUrl = settings?.logo_url || '/uploads/1794056903993-429854-rang-e-rosh-logo.jpg';
  const whatsappClean = settings?.whatsapp_clean || '923200300552';

  const sliderImages = [
    { slug: 'anna', image: '/assets/products/anna/1.jpg', alt: 'Anna Look 1' },
    { slug: 'hazel', image: '/assets/products/hazel/1.jpg', alt: 'Hazel Look 1' },
    { slug: 'olivia', image: '/assets/products/olivia/1.jpg', alt: 'Olivia Look 1' },
    { slug: 'orchid', image: '/assets/products/orchid/1.webp', alt: 'Orchid Look 1' },
    { slug: 'sabz', image: '/assets/products/sabz/5.png', alt: 'Sabz Look 1' },
    { slug: 'zayna', image: '/assets/products/zayna/1.webp', alt: 'Zayna Look 1' },
    { slug: 'anna', image: '/assets/products/anna/2.jpg', alt: 'Anna Look 2' },
    { slug: 'hazel', image: '/assets/products/hazel/2.jpg', alt: 'Hazel Look 2' },
    { slug: 'olivia', image: '/assets/products/olivia/2.jpg', alt: 'Olivia Look 2' },
    { slug: 'orchid', image: '/assets/products/orchid/2.webp', alt: 'Orchid Look 2' },
    { slug: 'sabz', image: '/assets/products/sabz/6.png', alt: 'Sabz Look 2' },
    { slug: 'zayna', image: '/assets/products/zayna/2.webp', alt: 'Zayna Look 2' },
  ];

  const loopedImages = [...sliderImages, ...sliderImages];

  return (
    <div className="pb-14 sm:pb-20 space-y-12 sm:space-y-16 animate-page-enter">
      {/* 1. LUXURY HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#200626] via-[#3A1042] to-[#12192B] text-[#FAF6F0] border-b-2 border-[#B8862D]">
        <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-[#8C2D56]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-96 h-96 rounded-full bg-[#B8862D]/25 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 text-center space-y-6">
          {/* 3D Animated Emblem */}
          <div className="logo-3d-stage flex justify-center">
            <div className="logo-3d-medallion relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-[#FAF6F0] flex items-center justify-center">
              <div className="logo-3d-ring" />
              <div className="relative z-10 w-full h-full rounded-full overflow-hidden border border-[#D8B572] bg-[#FAF6F0] p-1 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Rang e Rosh Logo"
                  className="w-full h-full object-contain"
                />
                <div className="logo-3d-sheen" />
              </div>
            </div>
          </div>

          <div className="feature-pill-animated inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#D8B572]/60 text-[#F7E3B5] text-[11px] font-bold tracking-[0.22em] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#D8B572] animate-pulse" />
            <span>About Rang e Rosh • Official Brand Story</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D8B572] animate-pulse" />
          </div>

          <h1 className="wordmark-3d font-serif-editorial text-4xl sm:text-6xl font-bold text-white leading-tight">
            Colours That Reflect Your <span className="italic font-normal text-[#F7E3B5]">Elegance</span>
          </h1>

          <div className="collection-gold-line mx-auto rounded-full" />

          <p className="text-sm sm:text-base text-[#FAF6F0]/85 max-w-3xl mx-auto leading-relaxed">
            Welcome to <strong>Rang e Rosh</strong> — a Pakistani luxury Pret house dedicated to the
            art of the 2-piece ladies stitched suit. We blend heritage floral threadwork, antique
            gold tilla, and schiffli cutwork with modern, effortless silhouettes.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/shop"
              className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#B8862D] via-[#D8B572] to-[#B8862D] text-[#1E0624] text-xs font-extrabold tracking-[0.16em] uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Explore Pret Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => setIsSizeChartOpen(true)}
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6F0] border border-[#D8B572]/60 text-xs font-bold tracking-[0.16em] uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              <Ruler className="w-4 h-4 text-[#D8B572]" />
              <span>View Stitched Size Chart</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL STORY & ATELIER CRAFTSMANSHIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-2 border-[#D8B572]/55 rounded-3xl p-6 sm:p-10 lg:p-14 shadow-[0_16px_42px_-12px_rgba(58,16,66,0.12)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3A1042] text-[#F7E3B5] text-[10px] font-bold tracking-[0.2em] uppercase">
              <Sparkles className="w-3 h-3 text-[#D8B572]" />
              Our Atelier Philosophy
            </span>

            <h2 className="collection-title-shimmer font-serif-editorial text-3xl sm:text-5xl font-bold leading-tight">
              Where Heritage Threadwork Meets Modern Poise
            </h2>

            <p className="text-sm sm:text-base text-[#161F33]/80 leading-relaxed">
              Every <strong>Rang e Rosh</strong> garment is designed for women who appreciate
              refined craftsmanship without compromising on everyday comfort. Each 2-piece ensemble
              includes a meticulously embroidered shirt (Kameez) paired with a tailored trouser.
            </p>

            <div className="space-y-3 pt-1">
              {[
                'High-density precision embroidery that lies flat without puckering or pulling.',
                'Clean internal overlocked seams and reinforced necklines for lasting durability.',
                'Breathable seasonal fabrics selected for rich color depth and graceful drape.',
                '100% original studio photography — you receive the exact ensemble shown.',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF6F0] border border-[#E5D9C5]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#2E6F73] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[#161F33]/85 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Photo Atelier Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5 sm:gap-4">
            <Link
              to="/product/sabz"
              className="product-card-animated aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#D8B572] shadow-lg relative group"
            >
              <img
                src="/assets/products/sabz/5.png"
                alt="SABZ Emerald Suit"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-[#200626]/90 text-[#F7E3B5] text-[11px] font-bold text-center border border-[#D8B572]/50">
                SABZ • Emerald & Gold Tilla
              </span>
            </Link>

            <Link
              to="/product/orchid"
              style={{ animationDelay: '0.4s' }}
              className="product-card-animated aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#D8B572] shadow-lg relative group mt-5"
            >
              <img
                src="/assets/products/orchid/1.webp"
                alt="ORCHID Purple Suit"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-[#200626]/90 text-[#F7E3B5] text-[11px] font-bold text-center border border-[#D8B572]/50">
                ORCHID • Royal Plum Cutwork
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. MULTI-COLOR BRAND PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Precision Tailoring',
              desc: 'High-density seams, structured necklines, and true-to-size S, M, L, XL grading.',
              Icon: Scissors,
              cardStyle: 'bg-gradient-to-br from-[#3A1042] to-[#541860] text-white border-[#D8B572]/60',
              delay: '0s',
            },
            {
              title: 'Artisanal Embroidery',
              desc: 'Intricate floral threadwork, antique gold tilla, and delicate schiffli borders.',
              Icon: Layers,
              cardStyle: 'bg-gradient-to-br from-[#8B6217] to-[#B8862D] text-white border-[#F7E3B5]/70',
              delay: '0.35s',
            },
            {
              title: 'WhatsApp Confirmation',
              desc: 'Every order is verified directly with you on WhatsApp for 100% peace of mind.',
              Icon: MessageCircle,
              cardStyle: 'bg-gradient-to-br from-[#1A4B4E] to-[#2E6F73] text-white border-[#8CE0E5]/55',
              delay: '0.7s',
            },
            {
              title: '7-Day Easy Return',
              desc: 'Nationwide delivery in 3–4 working days backed by our 7-day return & exchange policy.',
              Icon: Truck,
              cardStyle: 'bg-gradient-to-br from-[#681B3C] to-[#8C2D56] text-white border-[#F5B8D1]/55',
              delay: '1.05s',
            },
          ].map((item) => {
            const IconComp = item.Icon;
            return (
              <div
                key={item.title}
                style={{ animationDelay: item.delay }}
                className={`product-card-animated relative p-6 rounded-2xl border shadow-lg overflow-hidden ${item.cardStyle}`}
              >
                <div className="logo-3d-sheen opacity-25" />
                <div className="relative z-10 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-white/15 border border-white/40 flex items-center justify-center text-[#F7E3B5]">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-couture-unique text-sm font-bold tracking-wider uppercase text-[#F7E3B5]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/85 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. PURE IMAGES-ONLY CONTINUOUS LOOP SLIDER SECTION (No Side Arrows) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-b from-white via-[#FAF6F0] to-white border-2 border-[#D8B572]/65 rounded-3xl py-6 sm:py-8 shadow-[0_16px_42px_-12px_rgba(58,16,66,0.14)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3A1042] via-[#B8862D] to-[#8C2D56]" />

          {/* Continuous Infinite Loop Track */}
          <div className="lookbook-loop-track">
            {loopedImages.map((item, idx) => (
              <div
                key={`${item.slug}-${item.image}-${idx}`}
                className="w-56 sm:w-64 lg:w-72 shrink-0 pr-4 sm:pr-5"
              >
                <Link
                  to={`/product/${item.slug}`}
                  className="block group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#D8B572] bg-[#F3ECE0] shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. REDESIGNED CUSTOMER CONCIERGE & DIRECT STYLING DESK SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#200626] via-[#3A1042] to-[#14041A] text-white border-2 border-[#D8B572] p-6 sm:p-10 lg:p-12 shadow-[0_20px_50px_-12px_rgba(58,16,66,0.45)] space-y-8">
          {/* Top Multi-Color Shimmer Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B8862D] via-[#F7E3B5] to-[#2E6F73]" />
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#B8862D]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#8C2D56]/30 blur-3xl pointer-events-none" />

          {/* Header Block */}
          <div className="relative z-10 text-center max-w-3xl mx-auto space-y-3">
            <span className="feature-pill-animated inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#D8B572]/60 text-[#F7E3B5] text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D8B572]" />
              <span>Customer Concierge & Styling Desk</span>
              <Sparkles className="w-3.5 h-3.5 text-[#D8B572]" />
            </span>

            <h3 className="wordmark-3d font-serif-editorial text-3xl sm:text-5xl font-bold text-white leading-tight">
              Need Assistance With <span className="italic font-normal text-[#F7E3B5]">Sizing</span> or Orders?
            </h3>

            <div className="collection-gold-line mx-auto rounded-full" />

            <p className="text-xs sm:text-base text-[#FAF6F0]/85 leading-relaxed">
              Reach out to our team directly via WhatsApp, phone, or email for personalized stitched
              size guidance, custom dispatch updates, or exchange support.
            </p>
          </div>

          {/* 3 Multi-Color Direct Contact Cards */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: WhatsApp Concierge */}
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="product-card-animated group relative rounded-2xl p-6 bg-gradient-to-br from-[#1A4B4E] via-[#2E6F73] to-[#163D40] border-2 border-[#8CE0E5]/60 shadow-xl overflow-hidden flex flex-col justify-between gap-4 hover:scale-[1.02] transition-all"
            >
              <div className="logo-3d-sheen opacity-25 group-hover:opacity-60" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-2xl bg-white/15 border border-[#8CE0E5]/50 flex items-center justify-center text-[#D4F8FA] shadow-inner">
                    <MessageCircle className="w-5 h-5" />
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 text-[#D4F8FA] text-[10px] font-bold uppercase tracking-wider">
                    Instant Reply
                  </span>
                </div>

                <div>
                  <p className="font-couture-unique text-[10px] font-bold uppercase tracking-[0.18em] text-[#A7EFF4]">
                    WhatsApp Concierge
                  </p>
                  <p className="font-serif-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
                    {settings?.whatsapp_number || '+923 200 300 552'}
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    Direct order confirmation, live suit videos & quick sizing help.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#F7E3B5]">
                <span>Chat on WhatsApp</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Card 2: Direct Phone Helpline */}
            <a
              href={`tel:${(settings?.contact_phone || '+923 130 888 048').replace(/\s+/g, '')}`}
              style={{ animationDelay: '0.35s' }}
              className="product-card-animated group relative rounded-2xl p-6 bg-gradient-to-br from-[#8B6217] via-[#B8862D] to-[#6E4C10] border-2 border-[#F7E3B5]/70 shadow-xl overflow-hidden flex flex-col justify-between gap-4 hover:scale-[1.02] transition-all"
            >
              <div className="logo-3d-sheen opacity-25 group-hover:opacity-60" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-2xl bg-white/20 border border-white/50 flex items-center justify-center text-white shadow-inner">
                    <Phone className="w-5 h-5" />
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/20 text-[#FFFDF9] text-[10px] font-bold uppercase tracking-wider">
                    Mon–Sat • 10AM–9PM
                  </span>
                </div>

                <div>
                  <p className="font-couture-unique text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFF6DF]">
                    Direct Styling Line
                  </p>
                  <p className="font-serif-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
                    {settings?.contact_phone || '+923 130 888 048'}
                  </p>
                  <p className="text-xs text-white/85 mt-1">
                    Speak directly with our customer care team for urgent dispatch queries.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-white">
                <span>Call Helpline Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Card 3: Official Email Support */}
            <a
              href={`mailto:${settings?.contact_email || 'rangerosh.official@gmail.com'}`}
              style={{ animationDelay: '0.7s' }}
              className="product-card-animated group relative rounded-2xl p-6 bg-gradient-to-br from-[#681B3C] via-[#8C2D56] to-[#4F122C] border-2 border-[#F5B8D1]/60 shadow-xl overflow-hidden flex flex-col justify-between gap-4 hover:scale-[1.02] transition-all"
            >
              <div className="logo-3d-sheen opacity-25 group-hover:opacity-60" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-2xl bg-white/15 border border-[#F5B8D1]/50 flex items-center justify-center text-[#FDE8F0] shadow-inner">
                    <Mail className="w-5 h-5" />
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/15 text-[#FDE8F0] text-[10px] font-bold uppercase tracking-wider">
                    24/7 Support Desk
                  </span>
                </div>

                <div>
                  <p className="font-couture-unique text-[10px] font-bold uppercase tracking-[0.18em] text-[#F7C2D7]">
                    Official Email Desk
                  </p>
                  <p className="font-serif-editorial text-xl sm:text-2xl font-bold text-white mt-1 break-all">
                    {settings?.contact_email || 'rangerosh.official@gmail.com'}
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    Send us your order ID for return, refund, or exchange assistance.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#F7E3B5]">
                <span>Send Official Email</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>

          {/* Bottom Trust & Quick Action Bar */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF6F0]/85">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#D8B572]" />
                <span>Nationwide Delivery (3–4 Working Days)</span>
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8CE0E5]" />
                <span>7 Days Easy Return, Refund & Exchange</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsSizeChartOpen(true)}
              className="px-5 py-2 rounded-full bg-white/10 hover:bg-[#D8B572] text-[#F7E3B5] hover:text-[#1E0624] border border-[#D8B572]/60 text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Open Size Guide</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
