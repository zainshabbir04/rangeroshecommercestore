import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Phone,
  Mail,
  MessageCircle,
  Instagram,
  Youtube,
  Facebook,
  ShieldCheck,
  Sparkles,
  Ruler,
  Home,
  Gem,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { CartDrawer } from './CartDrawer';
import { QuickViewModal } from './QuickViewModal';
import { SizeChartModal } from './SizeChartModal';

const ANNOUNCEMENT_SLIDES = [
  '🌸 Welcome to Rang e Rosh — Colours That Reflect Your Elegance',
  '🚚 Nationwide Delivery Across Pakistan | Within 3–4 Working Days',
  '💖 Your Style, Your Elegance, Your Rang e Rosh',
  '🔄 7 Days Easy Return, Refund & Exchange Policy | Shop with Confidence!',
];

const FOOTER_INFO_MODAL_CONTENT: Record<
  string,
  { category: string; title: string; points: string[] }
> = {
  privacy: {
    category: 'Company Policies',
    title: 'Privacy Policy',
    points: [
      'Rang e Rosh respects your privacy and protects your personal contact and delivery details (Name, Phone/WhatsApp Number, Email, and Shipping Address).',
      'Your information is used strictly for processing your 2-piece stitched suit orders, dispatch tracking, and direct WhatsApp order confirmation.',
      'We never sell, rent, or share customer information with unauthorized third-party marketers.',
    ],
  },
  terms_conditions: {
    category: 'Company Policies',
    title: 'Terms & Conditions',
    points: [
      'All ensembles displayed on Rang e Rosh are authentic 2-piece stitched suits crafted with high-density embroidery and seasonal fabrics.',
      'Orders placed via Cash on Delivery (COD) are confirmed directly via WhatsApp prior to courier dispatch.',
      'Prices are listed in Pakistani Rupees (PKR) and are inclusive of applicable taxes.',
    ],
  },
  exchange: {
    category: 'Company Policies',
    title: 'Exchange Policy',
    points: [
      'We offer a hassle-free 7-Day Exchange Policy from the date of delivery for size issues or manufacturing defects.',
      'Items must be unused, unwashed, and in original packaging with tags intact.',
      'Contact our WhatsApp team (+923 200 300 552) with your Order ID to initiate an instant size or article exchange.',
    ],
  },
  terms_service: {
    category: 'Company Policies',
    title: 'Terms of Service',
    points: [
      'Product colors are photographed under studio lighting; slight variations may occur due to screen calibration.',
      'Stock availability is validated in real time. Confirmed orders reserve your ensemble immediately.',
      'Rang e Rosh reserves the right to cancel unverified orders if customer phone/address details are incomplete.',
    ],
  },
  shipping: {
    category: 'Company Policies',
    title: 'Shipping Policy',
    points: [
      'Nationwide delivery across Pakistan within 3–4 working days after WhatsApp order confirmation.',
      'Standard nationwide shipping is PKR 250, with Complimentary Free Shipping on orders above PKR 15,000.',
      'Every parcel is packed in sealed protective boutique packaging and shipped via trusted nationwide couriers.',
    ],
  },
  return_refund: {
    category: 'Company Policies',
    title: 'Return & Refund Policy',
    points: [
      '7 Days Easy Return, Refund & Exchange Policy — Shop with 100% confidence at Rang e Rosh.',
      'If you receive a damaged, defective, or incorrect article, we offer a full refund or free replacement.',
      'Refunds are processed within 3–5 working days via Bank Transfer, JazzCash, or EasyPaisa once the return parcel is received.',
    ],
  },
  about: {
    category: 'Information',
    title: 'About Rang e Rosh',
    points: [
      'Rang e Rosh — Colours That Reflect Your Elegance — is a Pakistani luxury Pret label specializing in 2-piece ladies stitched suits.',
      'Our signature collection (ANNA, HAZEL, OLIVIA, ORCHID, SABZ, and ZAYNA) combines heritage floral & antique gold tilla threadwork with modern relaxed silhouettes.',
      'Every outfit undergoes strict quality inspection for flat-lying necklines, overlocked internal seams, and superior fabric drape.',
    ],
  },
  order_processing: {
    category: 'Information',
    title: 'Order Processing',
    points: [
      'Step 1: Select your favorite stitched suit, size (S, M, L, XL), and complete checkout.',
      'Step 2: Your order is saved with a unique Order ID (e.g., RER-2026-XXXX) and opens a pre-filled WhatsApp confirmation message.',
      'Step 3: Our team verifies your order on WhatsApp and dispatches your parcel within 24 hours for 3–4 working days delivery.',
    ],
  },
  faqs: {
    category: 'Information',
    title: "FAQ's — Frequently Asked Questions",
    points: [
      'Q: Are all suits stitched and ready to wear? — Yes, all 6 signature ensembles are 2-piece stitched suits (Embroidered Shirt + Trouser).',
      'Q: How do I choose my size? — Click the "Size Chart" button in the navbar or footer to view exact flat measurements in Inches & CM for S, M, L, and XL.',
      'Q: Can I pay Cash on Delivery (COD)? — Yes, nationwide Cash on Delivery is available across Pakistan.',
    ],
  },
  scam_free: {
    category: 'Information',
    title: 'Scam-Free Shopping Guarantee',
    points: [
      '100% Original Product Photography: Every photo and video on our website is shot from the actual Rang e Rosh garment you will receive.',
      'Direct WhatsApp Verification: Every order is personally verified with you on WhatsApp before dispatch.',
      '7-Day Return & Refund Protection: Shop with complete peace of mind backed by our 7-day return, refund, and exchange policy.',
    ],
  },
};

export const StorefrontLayout: React.FC = () => {
  const { settings, setIsSizeChartOpen } = useStore();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [activePolicyKey, setActivePolicyKey] = useState<string | null>(null);

  useEffect(() => {
    // First-priority slide (#0: Welcome to Rang e Rosh) stays slightly longer for priority visibility
    const duration = announcementIndex === 0 ? 3800 : 2800;
    const timer = window.setTimeout(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENT_SLIDES.length);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [announcementIndex]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const storeName = settings?.store_name?.trim() || 'Rang e Rosh';
  const isDefaultStoreName = storeName.toLowerCase() === 'rang e rosh';
  const storeTagline =
    settings?.store_tagline?.trim() &&
    settings.store_tagline.trim() !== 'Ladies Stitched Suits — Pret Collection'
      ? settings.store_tagline.trim()
      : 'Ladies Stitched Suits';
  const logoUrl = settings?.logo_url || '/uploads/1794056903993-429854-rang-e-rosh-logo.jpg';
  const whatsappClean = settings?.whatsapp_clean || '923200300552';

  const announcementSlides = React.useMemo(() => {
    const customText = settings?.announcement_text?.trim();
    if (
      customText &&
      !customText.startsWith('Complimentary Nationwide Shipping on Orders Above PKR 15,000')
    ) {
      return [customText, ...ANNOUNCEMENT_SLIDES];
    }
    return ANNOUNCEMENT_SLIDES;
  }, [settings?.announcement_text]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#161F33]">
      {/* Unique Couture Top Announcement Bar — Pure One-by-One Slider (No Left/Right Arrows) */}
      <div className="couture-announcement-bar text-[#FAF6F0] px-3 sm:px-6 py-2 text-center relative overflow-hidden">
        {/* Subtle Decorative Gold Filigree Lines on Sides */}
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 opacity-75">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D8B572]" />
            <Sparkles className="w-3.5 h-3.5 text-[#D8B572] animate-pulse" />
          </div>

          {/* Center Royal Pill Frame with One-by-One Vertical/Fade Slide */}
          <div className="announcement-pill-glow relative w-full max-w-2xl h-7 sm:h-8 rounded-full border border-[#D8B572]/45 overflow-hidden flex items-center justify-center px-2.5 sm:px-4">
            {announcementSlides.map((text, idx) => {
              const isActive = idx === announcementIndex % announcementSlides.length;
              const isPrimaryWelcome = idx === 0;
              return (
                <div
                  key={text}
                  className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-700 ease-out px-2.5 sm:px-3 ${
                    isActive
                      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                      : 'opacity-0 -translate-y-5 scale-95 pointer-events-none'
                  }`}
                >
                  <span
                    className={`text-[10px] sm:text-xs md:text-[13px] tracking-[0.03em] sm:tracking-[0.1em] truncate ${
                      isPrimaryWelcome
                        ? 'font-bold text-[#F7E3B5] drop-shadow-[0_1px_6px_rgba(216,181,114,0.45)]'
                        : 'font-medium text-[#FAF6F0]'
                    }`}
                  >
                    {text}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-1.5 opacity-75">
            <Sparkles className="w-3.5 h-3.5 text-[#D8B572] animate-pulse" />
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D8B572]" />
          </div>
        </div>
      </div>

      {/* Unique Royal Couture Navigation Header */}
      <header className="sticky top-0 z-40 couture-navbar backdrop-blur-md transition-all">
        {/* Top Filigree Gold Shimmer Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#B8862D] to-transparent opacity-75" />

        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-26 lg:h-28 gap-1.5 sm:gap-4">
            {/* Left: Mobile Menu Trigger + Unique 3-Button Couture Pill Dock (Desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 sm:p-2.5 rounded-full bg-[#3A1042]/10 text-[#3A1042] hover:bg-[#3A1042] hover:text-white transition-all cursor-pointer border border-[#B8862D]/40"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Desktop 3-Button Luxury Navigation Dock: "Home", "Pret Collection", "Size Chart" */}
              <nav
                aria-label="Primary Navigation"
                className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-white/90 border border-[#B8862D]/50 shadow-[0_6px_20px_rgba(58,16,66,0.08)]"
              >
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#3A1042] to-[#561961] text-[#FAF6F0] shadow-[0_4px_12px_rgba(58,16,66,0.3)] border border-[#D8B572]/50'
                        : 'text-[#161F33] hover:text-[#3A1042] hover:bg-[#FAF6F0]'
                    }`
                  }
                >
                  <Home className="w-3.5 h-3.5 text-[#D8B572]" />
                  <span>Home</span>
                </NavLink>

                <NavLink
                  to="/shop"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#3A1042] to-[#561961] text-[#FAF6F0] shadow-[0_4px_12px_rgba(58,16,66,0.3)] border border-[#D8B572]/50'
                        : 'text-[#161F33] hover:text-[#3A1042] hover:bg-[#FAF6F0]'
                    }`
                  }
                >
                  <Gem className="w-3.5 h-3.5 text-[#B8862D]" />
                  <span>Pret Collection</span>
                </NavLink>

                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 flex items-center gap-1.5 text-[#3A1042] bg-[#FAF6F0] hover:bg-gradient-to-r hover:from-[#B8862D] hover:to-[#9E6F1E] hover:text-white border border-[#B8862D]/40 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#B8862D] group-hover:text-white" />
                  <span>Size Chart</span>
                </button>
              </nav>
            </div>

            {/* Center: Complete 3D Royal Medallion Logo & Complete Brand Name (Mobile & Desktop) */}
            <Link
              to="/"
              className="group flex items-center justify-center gap-2 sm:gap-4 logo-3d-stage py-1 focus:outline-none shrink-0"
            >
              {/* 3D Animated Circular Emblem — object-contain shows 100% complete logo without cropping */}
              <div className="relative w-11 h-11 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full logo-3d-medallion flex items-center justify-center shrink-0">
                {/* Spinning Conic Gold Halo Ring */}
                <div className="logo-3d-ring" />

                {/* Inner Medallion Image Frame */}
                <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-[#FAF6F0] bg-[#FAF6F0] flex items-center justify-center p-0.5">
                  <img
                    src={logoUrl}
                    alt={storeName}
                    className="w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* 3D Specular Light Sweep */}
                  <div className="logo-3d-sheen" />
                </div>
              </div>

              {/* Complete 3D Embossed Wordmark (Never Truncated on Mobile) */}
              <div className="flex flex-col text-left">
                <div className="font-serif-editorial text-[18px] sm:text-3xl lg:text-4xl font-bold tracking-[0.04em] sm:tracking-[0.09em] text-[#161F33] leading-none wordmark-3d transition-transform duration-500 group-hover:translate-x-0.5 whitespace-nowrap">
                  {isDefaultStoreName ? (
                    <>
                      RANG{' '}
                      <span className="italic font-normal text-[#8C2D56] lowercase px-0.5">e</span>{' '}
                      ROSH
                    </>
                  ) : (
                    storeName.toUpperCase()
                  )}
                </div>
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                  <span className="h-[1px] w-2 sm:w-6 bg-[#B8862D] shrink-0" />
                  <span className="text-[7.5px] sm:text-[10px] tracking-[0.11em] sm:tracking-[0.28em] uppercase text-[#B8862D] font-bold whitespace-nowrap">
                    {storeTagline}
                  </span>
                  <span className="h-[1px] w-2 sm:w-6 bg-[#B8862D] shrink-0" />
                </div>
              </div>
            </Link>

            {/* Right: Luxury Search Trigger & Sculpted Shopping Bag Button */}
            <div className="flex items-center gap-1 sm:gap-3.5 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 sm:px-3.5 sm:py-2.5 rounded-full bg-white border border-[#B8862D]/50 text-[#161F33] hover:border-[#3A1042] hover:text-[#3A1042] shadow-2xs transition-all cursor-pointer"
                aria-label="Search products"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B8862D]" />
                <span className="hidden xl:inline text-[11px] font-semibold tracking-[0.14em] uppercase text-[#161F33]/75">
                  Search Suits
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-gradient-to-r from-[#3A1042] via-[#4D1657] to-[#280A2E] text-[#FAF6F0] hover:from-[#8C2D56] hover:to-[#3A1042] border border-[#D8B572]/60 shadow-[0_6px_18px_rgba(58,16,66,0.28)] transition-all flex items-center gap-1 sm:gap-2.5 cursor-pointer group"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D8B572] transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline text-[11px] font-bold tracking-[0.15em] uppercase">
                  Bag
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-bold rounded-full bg-[#B8862D] text-white shadow-xs">
                  {totalItemsCount}
                </span>
              </button>
            </div>
          </div>

          {/* Expandable Search Bar */}
          {searchOpen && (
            <div className="py-3.5 border-t border-[#E5D9C5] animate-fadeIn">
              <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#B8862D] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search suits by name (ANNA, HAZEL, OLIVIA, ORCHID, SABZ, ZAYNA), color, or fabric..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#B8862D]/50 rounded-full text-sm focus:outline-none focus:border-[#3A1042]"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#3A1042] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#8C2D56] cursor-pointer"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2.5 text-gray-500 hover:text-[#161F33] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer (Same 3 Primary Buttons: Home, Pret Collection, Size Chart) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#161F33]/65 backdrop-blur-xs"
          />
          <div className="relative z-10 w-80 max-w-full bg-[#FAF6F0] h-full shadow-2xl flex flex-col justify-between p-6 border-r-2 border-[#B8862D]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E5D9C5]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#B8862D] bg-[#FAF6F0] p-0.5 shadow-md shrink-0">
                    <img
                      src={logoUrl}
                      alt={storeName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif-editorial text-2xl font-bold text-[#161F33] leading-none whitespace-nowrap">
                      {isDefaultStoreName ? (
                        <>
                          RANG <span className="italic text-[#8C2D56]">e</span> ROSH
                        </>
                      ) : (
                        storeName.toUpperCase()
                      )}
                    </span>
                    <span className="text-[9px] tracking-[0.18em] uppercase text-[#B8862D] font-bold mt-1 whitespace-nowrap">
                      {storeTagline}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#161F33]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search collection..."
                    className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-[#E5D9C5] rounded-full text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A1042]"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Mobile Core Navigation Buttons */}
              <nav className="mt-6 flex flex-col space-y-2.5 text-xs font-bold tracking-[0.15em] uppercase">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-white border border-[#E5D9C5] text-[#161F33] hover:border-[#3A1042] flex items-center gap-2.5 shadow-2xs"
                >
                  <Home className="w-4 h-4 text-[#B8862D]" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-white border border-[#E5D9C5] text-[#161F33] hover:border-[#3A1042] flex items-center gap-2.5 shadow-2xs"
                >
                  <Gem className="w-4 h-4 text-[#B8862D]" />
                  <span>Pret Collection</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl bg-white border border-[#E5D9C5] text-[#161F33] hover:border-[#3A1042] flex items-center gap-2.5 shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-[#8C2D56]" />
                  <span>About Rang e Rosh</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsSizeChartOpen(true);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#3A1042] to-[#561961] text-white flex items-center gap-2.5 text-left cursor-pointer shadow-md"
                >
                  <Ruler className="w-4 h-4 text-[#D8B572]" />
                  <span>Size Chart</span>
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E5D9C5] space-y-2 text-xs text-[#161F33]/80">
              <p className="font-semibold text-[#3A1042] uppercase tracking-wider">
                Customer Concierge
              </p>
              <p>{settings?.contact_phone || '+923 130 888 048'}</p>
              <p>Orders: {settings?.whatsapp_number || '+923 200 300 552'}</p>
              <p>{settings?.contact_email || 'rangerosh.official@gmail.com'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 animate-page-enter overflow-x-hidden">
        <Outlet />
      </main>

      {/* Redesigned Royal Couture Brand Footer */}
      <footer className="relative overflow-hidden bg-gradient-to-b from-[#1A051E] via-[#26092C] to-[#110314] text-[#FAF6F0] border-t-2 border-[#D8B572]">
        {/* Top Shimmer Gold Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#3A1042] via-[#D8B572] to-[#8C2D56]" />

        {/* Ambient Decorative Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#B8862D]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#8C2D56]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Col 1 (4 cols): Brand Identity & 3D Animated Emblem */}
            <div className="lg:col-span-4 space-y-5">
              <div className="flex items-center gap-4">
                <div className="logo-3d-stage shrink-0">
                  <div className="logo-3d-medallion relative w-16 h-16 rounded-full p-1 bg-[#FAF6F0] flex items-center justify-center">
                    <div className="logo-3d-ring" />
                    <img
                      src={logoUrl}
                      alt={storeName}
                      className="relative z-10 w-full h-full rounded-full object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-wider text-white">
                    RANG <span className="italic font-normal text-[#F7E3B5] lowercase">e</span> ROSH
                  </h3>
                  <p className="text-[10px] tracking-[0.22em] uppercase text-[#D8B572] font-semibold">
                    Colours That Reflect Your Elegance
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-[#FAF6F0]/80 leading-relaxed">
                Elevated 2-piece ladies stitched ensembles crafted with high-density precision
                tailoring, intricate floral and antique tilla embroidery, and breathable seasonal
                weaves.
              </p>

              {/* Social Links (Instagram, Facebook, YouTube, TikTok Icon) */}
              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href={settings?.instagram_url || 'https://www.instagram.com/rangerosh.official/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Rang e Rosh on Instagram"
                  title="Instagram"
                  className="w-9 h-9 rounded-full bg-white/10 border border-[#D8B572]/40 hover:bg-[#B8862D] text-[#F7E3B5] hover:text-white flex items-center justify-center transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href={
                    settings?.facebook_url ||
                    'https://www.facebook.com/profile.php?id=61580899835962'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Rang e Rosh on Facebook"
                  title="Facebook"
                  className="w-9 h-9 rounded-full bg-white/10 border border-[#D8B572]/40 hover:bg-[#B8862D] text-[#F7E3B5] hover:text-white flex items-center justify-center transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                <a
                  href={settings?.youtube_url || 'https://www.youtube.com/@rangerosh'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Rang e Rosh on YouTube"
                  title="YouTube"
                  className="w-9 h-9 rounded-full bg-white/10 border border-[#D8B572]/40 hover:bg-[#B8862D] text-[#F7E3B5] hover:text-white flex items-center justify-center transition-all"
                >
                  <Youtube className="w-4 h-4" />
                </a>

                <a
                  href={settings?.tiktok_url || 'https://www.tiktok.com/@rangerosh.official'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Rang e Rosh on TikTok"
                  title="TikTok"
                  className="w-9 h-9 rounded-full bg-white/10 border border-[#D8B572]/40 hover:bg-[#B8862D] text-[#F7E3B5] hover:text-white flex items-center justify-center transition-all"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 2 (3 cols): COMPANY POLICIES (Exact Requested List) */}
            <div className="lg:col-span-3">
              <h4 className="text-xs font-extrabold tracking-[0.2em] uppercase text-[#F7E3B5] mb-2">
                COMPANY POLICIES
              </h4>
              <div className="w-10 h-[2px] bg-gradient-to-r from-[#D8B572] to-transparent mb-5" />

              <ul className="space-y-3 text-sm text-[#FAF6F0]/85">
                {[
                  { label: 'Privacy Policy', key: 'privacy' },
                  { label: 'Terms & Conditions', key: 'terms_conditions' },
                  { label: 'Exchange Policy', key: 'exchange' },
                  { label: 'Terms of Service', key: 'terms_service' },
                  { label: 'Shipping Policy', key: 'shipping' },
                  { label: 'Return & Refund Policy', key: 'return_refund' },
                ].map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => setActivePolicyKey(item.key)}
                      className="text-left text-[#FAF6F0]/80 hover:text-[#F7E3B5] hover:translate-x-1 transition-all duration-200 cursor-pointer flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D8B572]/70" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 (2 cols): INFORMATION (Exact Requested List) */}
            <div className="lg:col-span-2">
              <h4 className="text-xs font-extrabold tracking-[0.2em] uppercase text-[#F7E3B5] mb-2">
                INFORMATION
              </h4>
              <div className="w-10 h-[2px] bg-gradient-to-r from-[#D8B572] to-transparent mb-5" />

              <ul className="space-y-3 text-sm text-[#FAF6F0]/85">
                <li>
                  <Link
                    to="/about"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-left text-[#FAF6F0]/80 hover:text-[#F7E3B5] hover:translate-x-1 transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8B572]/70" />
                    <span>About Rang e Rosh</span>
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-left text-[#FAF6F0]/80 hover:text-[#F7E3B5] hover:translate-x-1 transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8B572]/70" />
                    <span>Size Chart</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicyKey('order_processing')}
                    className="text-left text-[#FAF6F0]/80 hover:text-[#F7E3B5] hover:translate-x-1 transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8B572]/70" />
                    <span>Order Processing</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicyKey('faqs')}
                    className="text-left text-[#FAF6F0]/80 hover:text-[#F7E3B5] hover:translate-x-1 transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8B572]/70" />
                    <span>FAQ's</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicyKey('scam_free')}
                    className="text-left text-[#FAF6F0]/80 hover:text-[#F7E3B5] hover:translate-x-1 transition-all duration-200 cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8B572]/70" />
                    <span>Scam-Free Shopping</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4 (3 cols): Official Contact & Concierge */}
            <div className="lg:col-span-3">
              <h4 className="text-xs font-extrabold tracking-[0.2em] uppercase text-[#F7E3B5] mb-2">
                CONTACT & CONCIERGE
              </h4>
              <div className="w-10 h-[2px] bg-gradient-to-r from-[#D8B572] to-transparent mb-5" />

              <ul className="space-y-3.5 text-xs text-[#FAF6F0]/85">
                <li className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Phone className="w-4 h-4 text-[#D8B572] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#F7E3B5]/70">
                      General Inquiries
                    </span>
                    <a
                      href={`tel:${(settings?.contact_phone || '+923 130 888 048').replace(/\s+/g, '')}`}
                      className="font-semibold text-white hover:text-[#F7E3B5]"
                    >
                      {settings?.contact_phone || '+923 130 888 048'}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <MessageCircle className="w-4 h-4 text-[#43969B] shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#F7E3B5]/70">
                      WhatsApp Orders & Support
                    </span>
                    <a
                      href={`https://wa.me/${whatsappClean}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white hover:text-[#F7E3B5]"
                    >
                      {settings?.whatsapp_number || '+923 200 300 552'}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Mail className="w-4 h-4 text-[#D8B572] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider text-[#F7E3B5]/70">
                      Official Email
                    </span>
                    <a
                      href={`mailto:${settings?.contact_email || 'rangerosh.official@gmail.com'}`}
                      className="font-semibold text-white hover:text-[#F7E3B5] break-all"
                    >
                      {settings?.contact_email || 'rangerosh.official@gmail.com'}
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF6F0]/70">
            <p>© {new Date().getFullYear()} Rang e Rosh Clothing. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[#F7E3B5]">
                <ShieldCheck className="w-4 h-4 text-[#D8B572]" />
                <span>7 Days Easy Return, Refund & Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Policy & Information Modal */}
      {activePolicyKey && FOOTER_INFO_MODAL_CONTENT[activePolicyKey] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setActivePolicyKey(null)}
            className="fixed inset-0 bg-[#120416]/75 backdrop-blur-md"
          />
          <div className="relative z-10 w-full max-w-xl bg-gradient-to-b from-[#FAF6F0] via-white to-[#F3ECE0] border-2 border-[#D8B572] rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#3A1042] via-[#D8B572] to-[#8C2D56]" />
            <div className="px-6 py-5 bg-gradient-to-r from-[#200626] via-[#3A1042] to-[#1A051E] text-white flex items-center justify-between border-b border-[#D8B572]/60">
              <div>
                <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#F7E3B5] block">
                  Rang e Rosh • {FOOTER_INFO_MODAL_CONTENT[activePolicyKey].category}
                </span>
                <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-white mt-0.5">
                  {FOOTER_INFO_MODAL_CONTENT[activePolicyKey].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicyKey(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-[#8C2D56] text-white border border-white/20 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-7 space-y-4">
              {FOOTER_INFO_MODAL_CONTENT[activePolicyKey].points.map((point, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-[#D8B572]/45 shadow-2xs flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-[#3A1042] text-[#F7E3B5] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-[#161F33]/85 leading-relaxed">{point}</p>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActivePolicyKey(null)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#3A1042] to-[#561961] text-[#FAF6F0] text-xs font-bold uppercase tracking-wider border border-[#D8B572]/50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Floating WhatsApp Icon Button (Exact Official Speech-Bubble Style Fixed Bottom-Right) */}
      <a
        href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(
          'Assalam-o-Alaikum Rang e Rosh! I would like to inquire about your 2-Piece Stitched Pret Collection.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Rang e Rosh on WhatsApp"
        title="Chat on WhatsApp"
        className="whatsapp-float-animated fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center hover:scale-110 transition-transform duration-300"
      >
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Outer White Speech Bubble with Bottom-Left Tail */}
          <path
            fill="#FFFFFF"
            d="M32.04 4C16.58 4 4.02 16.47 4.02 31.83c0 5.34 1.52 10.52 4.39 14.99L4 60l13.62-4.29a28.09 28.09 0 0 0 14.42 3.94h.01c15.45 0 27.95-12.47 27.95-27.83C60 16.47 47.5 4 32.04 4Z"
          />
          {/* Inner Official WhatsApp Green (#25D366) Speech Bubble */}
          <path
            fill="#25D366"
            d="M32.04 8.6c-12.9 0-23.38 10.41-23.38 23.23 0 4.86 1.51 9.54 4.35 13.46l.68.94-2.75 8.66 8.95-2.82.91.54a23.38 23.38 0 0 0 11.24 2.84h.01c12.89 0 23.37-10.42 23.37-23.23 0-12.82-10.48-23.22-23.38-23.22Z"
          />
          {/* White Phone Handset Inside */}
          <path
            fill="#FFFFFF"
            d="M44.6 38.45c-.68-.34-4.05-1.99-4.68-2.21-.63-.23-1.08-.34-1.54.34-.45.68-1.76 2.21-2.16 2.66-.4.45-.8.51-1.48.17-.68-.34-2.89-1.06-5.5-3.37-2.03-1.8-3.4-4.03-3.8-4.71-.4-.68-.04-1.05.3-1.39.31-.3.68-.79 1.03-1.19.34-.4.45-.68.68-1.13.23-.45.11-.85-.06-1.19-.17-.34-1.54-3.68-2.11-5.04-.55-1.32-1.12-1.14-1.54-1.16-.4-.02-.85-.02-1.31-.02s-1.2.17-1.82.85c-.63.68-2.4 2.32-2.4 5.66s2.45 6.57 2.8 7.02c.34.45 4.82 7.33 11.68 10.27 1.63.7 2.9 1.12 3.89 1.43 1.64.52 3.13.45 4.31.27 1.32-.2 4.05-1.64 4.62-3.23.57-1.58.57-2.94.4-3.23-.17-.28-.63-.45-1.31-.79Z"
          />
        </svg>
      </a>

      {/* Global Overlays */}
      <CartDrawer />
      <QuickViewModal />
      <SizeChartModal />
    </div>
  );
};
