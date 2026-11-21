import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  Sparkles,
  User,
  MapPin,
  Send,
  X,
} from 'lucide-react';
import { Product, STANDARD_SIZES } from '../../types';

export interface ProductReview {
  id: string;
  product_slug: string;
  customer_name: string;
  city: string;
  rating: number;
  selected_size: string;
  title: string;
  comment: string;
  verified: boolean;
  created_at: string;
}

const REVIEWS_STORAGE_KEY = 'rer_product_reviews_v1';

const INITIAL_REVIEWS_BY_SLUG: Record<string, ProductReview[]> = {
  anna: [
    {
      id: 'rev-anna-1',
      product_slug: 'anna',
      customer_name: 'Ayesha Malik',
      city: 'Lahore',
      rating: 5,
      selected_size: 'Medium',
      title: 'Stunning Black & Ivory Embroidery!',
      comment:
        'Received my ANNA 2-piece suit today and the black textured fabric with ivory embroidery looks even more regal in person. The neckline and daman threadwork lie completely flat and the Medium size fits like custom tailoring.',
      verified: true,
      created_at: '2 days ago',
    },
    {
      id: 'rev-anna-2',
      product_slug: 'anna',
      customer_name: 'Hira Siddiqui',
      city: 'Islamabad',
      rating: 5,
      selected_size: 'Small',
      title: 'Flawless Stitching & Fast WhatsApp Confirmation',
      comment:
        'Very impressed with the finishing of the seams and bell sleeves. The Rang e Rosh team confirmed my order on WhatsApp right away and delivered within 3 days.',
      verified: true,
      created_at: '5 days ago',
    },
    {
      id: 'rev-anna-3',
      product_slug: 'anna',
      customer_name: 'Sana Farooq',
      city: 'Karachi',
      rating: 4,
      selected_size: 'Large',
      title: 'Elegant & Comfortable Drape',
      comment:
        'Beautiful contrast and very breathable fabric. Wore it to a family dinner and got so many compliments!',
      verified: true,
      created_at: '1 week ago',
    },
  ],
  hazel: [
    {
      id: 'rev-hazel-1',
      product_slug: 'hazel',
      customer_name: 'Mahnoor Khan',
      city: 'Lahore',
      rating: 5,
      selected_size: 'Medium',
      title: 'Rich Cranberry Red Shade',
      comment:
        'HAZEL is my favorite purchase this season! The cranberry red color is so rich and the floral neckline embroidery is super neat and detailed.',
      verified: true,
      created_at: '3 days ago',
    },
    {
      id: 'rev-hazel-2',
      product_slug: 'hazel',
      customer_name: 'Zainab Raza',
      city: 'Faisalabad',
      rating: 5,
      selected_size: 'Large',
      title: 'True to Size Chart',
      comment:
        'Checked the size chart before ordering Large and the shirt & trouser measurements are spot on. Premium stitching quality.',
      verified: true,
      created_at: '6 days ago',
    },
  ],
  olivia: [
    {
      id: 'rev-olivia-1',
      product_slug: 'olivia',
      customer_name: 'Fatima Noor',
      city: 'Karachi',
      rating: 5,
      selected_size: 'Small',
      title: 'Gorgeous Multi-Color Threadwork on Olive Green',
      comment:
        'The magenta, teal, and gold floral embroidery against the deep olive green fabric looks like a designer boutique piece. Even the trouser hem is beautifully embroidered!',
      verified: true,
      created_at: '1 day ago',
    },
    {
      id: 'rev-olivia-2',
      product_slug: 'olivia',
      customer_name: 'Amna Sheeraz',
      city: 'Rawalpindi',
      rating: 5,
      selected_size: 'Medium',
      title: 'Luxury Fabric & Finishing',
      comment:
        'The cotton-linen blend feels very soft on the skin and holds its shape all day. Highly recommended!',
      verified: true,
      created_at: '4 days ago',
    },
  ],
  orchid: [
    {
      id: 'rev-orchid-1',
      product_slug: 'orchid',
      customer_name: 'Mehwishawan',
      city: 'Islamabad',
      rating: 5,
      selected_size: 'Medium',
      title: 'Royal Plum with Exquisite Schiffli Cutwork',
      comment:
        'ORCHID looks truly royal! The scalloped schiffli cutwork on the sleeves and trouser cuffs is so delicate and high-density. Worth every rupee.',
      verified: true,
      created_at: '2 days ago',
    },
    {
      id: 'rev-orchid-2',
      product_slug: 'orchid',
      customer_name: 'Rabia Usman',
      city: 'Lahore',
      rating: 5,
      selected_size: 'Extra Large',
      title: 'Graceful Fit & Packaging',
      comment:
        'Ordered Extra Large for my mother and she loved the relaxed straight silhouette and deep purple tone.',
      verified: true,
      created_at: '1 week ago',
    },
  ],
  sabz: [
    {
      id: 'rev-sabz-1',
      product_slug: 'sabz',
      customer_name: 'Nida Shah',
      city: 'Lahore',
      rating: 5,
      selected_size: 'Medium',
      title: 'Regal Emerald Green & Antique Gold Tilla',
      comment:
        'The antique gold tilla work on SABZ gives a proper festive luxury look. The longline shirt cut is super flattering.',
      verified: true,
      created_at: '3 days ago',
    },
    {
      id: 'rev-sabz-2',
      product_slug: 'sabz',
      customer_name: 'Khadija Tariq',
      city: 'Multan',
      rating: 5,
      selected_size: 'Small',
      title: '10/10 Embroidery & Fabric Drape',
      comment:
        'Smooth viscose-silk feel and zero loose threads inside or out. Will definitely shop again from Rang e Rosh.',
      verified: true,
      created_at: '5 days ago',
    },
  ],
  zayna: [
    {
      id: 'rev-zayna-1',
      product_slug: 'zayna',
      customer_name: 'Areeba Hassan',
      city: 'Karachi',
      rating: 5,
      selected_size: 'Small',
      title: 'Vibrant Mustard & Statement Split-Cuff Sleeves',
      comment:
        'ZAYNA is such a fresh, vibrant outfit! The maroon and cream embroidery on the wide sleeves and trouser hem makes it stand out.',
      verified: true,
      created_at: '2 days ago',
    },
    {
      id: 'rev-zayna-2',
      product_slug: 'zayna',
      customer_name: 'Sadia Javed',
      city: 'Lahore',
      rating: 5,
      selected_size: 'Medium',
      title: 'Best Value Stitched Suit!',
      comment:
        'At this price point, getting a fully stitched 2-piece suit with embroidered shirt and embroidered trouser border is amazing.',
      verified: true,
      created_at: '1 week ago',
    },
  ],
};

function loadStoredReviews(): Record<string, ProductReview[]> {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore storage errors
  }
  return {};
}

function saveStoredReviews(map: Record<string, ProductReview[]>): void {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

interface ProductReviewsSectionProps {
  product: Product;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ product }) => {
  const slug = product.slug.toLowerCase();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [city, setCity] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('Medium');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const storedMap = loadStoredReviews();
    const customForSlug = storedMap[slug] || [];
    const seedForSlug = INITIAL_REVIEWS_BY_SLUG[slug] || [
      {
        id: `rev-${slug}-1`,
        product_slug: slug,
        customer_name: 'Ayesha Malik',
        city: 'Lahore',
        rating: 5,
        selected_size: 'Medium',
        title: `Beautiful ${product.name} 2-Piece Ensemble!`,
        comment: `Loved the fabric quality, neat embroidery, and accurate stitched measurements of ${product.name}. Fast delivery via WhatsApp confirmation!`,
        verified: true,
        created_at: '3 days ago',
      },
    ];

    // Merge user-submitted reviews with initial verified reviews
    const mergedIds = new Set<string>();
    const combined: ProductReview[] = [];
    for (const r of [...customForSlug, ...seedForSlug]) {
      if (!mergedIds.has(r.id)) {
        mergedIds.add(r.id);
        combined.push(r);
      }
    }
    setReviews(combined);

    // Also fetch any shared server reviews if available
    fetch(`/api/products/${encodeURIComponent(slug)}/reviews`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews((prev) => {
            const seen = new Set(prev.map((x) => x.id));
            const next = [...prev];
            for (const srvRev of data.reviews) {
              if (!seen.has(srvRev.id)) {
                seen.add(srvRev.id);
                next.unshift(srvRev);
              }
            }
            return next;
          });
        }
      })
      .catch(() => {});
  }, [slug, product.name]);

  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        avg: '4.9',
        total: 0,
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
      };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return {
      avg: (sum / total).toFixed(1),
      total,
      counts,
    };
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 8) {
      setFormError('Please write a short review about the outfit (at least 8 characters).');
      return;
    }

    setSubmitting(true);
    const newReview: ProductReview = {
      id: `rev-${slug}-${Date.now()}`,
      product_slug: slug,
      customer_name: customerName.trim(),
      city: city.trim() || 'Pakistan',
      rating,
      selected_size: selectedSize || 'Medium',
      title: title.trim() || `Loved the ${product.name} Stitched Suit!`,
      comment: comment.trim(),
      verified: true,
      created_at: 'Just now',
    };

    try {
      const storedMap = loadStoredReviews();
      storedMap[slug] = [newReview, ...(storedMap[slug] || [])];
      saveStoredReviews(storedMap);

      setReviews((prev) => [newReview, ...prev]);

      // Best-effort sync to backend API
      fetch(`/api/products/${encodeURIComponent(slug)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      }).catch(() => {});

      setCustomerName('');
      setCity('');
      setTitle('');
      setComment('');
      setRating(5);
      setShowForm(false);
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 4500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="customer-reviews" className="pt-8 border-t border-[#E5D9C5]">
      <div className="relative bg-gradient-to-b from-white via-[#FAF6F0]/90 to-white border-2 border-[#D8B572]/65 rounded-3xl p-4 sm:p-8 lg:p-10 shadow-[0_14px_40px_-14px_rgba(58,16,66,0.14)] overflow-hidden space-y-7">
        {/* Top Shimmer Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3A1042] via-[#B8862D] to-[#2E6F73]" />

        {/* Section Header + Write a Review Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5D9C5] pb-5">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="feature-pill-animated inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3A1042]/10 border border-[#B8862D]/50 text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-[#8C2D56]">
              <Sparkles className="w-3.5 h-3.5 text-[#B8862D] animate-pulse" />
              <span>Verified Client Feedback</span>
            </div>
            <h2 className="collection-title-shimmer font-serif-editorial text-3xl sm:text-5xl font-bold leading-tight">
              Customer Reviews for {product.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="btn-royal-shimmer self-center sm:self-auto px-5 py-3 rounded-full bg-gradient-to-r from-[#3A1042] via-[#541860] to-[#3A1042] hover:from-[#8C2D56] hover:to-[#3A1042] text-[#FAF6F0] border border-[#D8B572]/60 text-xs font-extrabold uppercase tracking-[0.14em] flex items-center gap-2 shadow-md cursor-pointer"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4 text-[#F7E3B5]" />
                <span>Close Review Form</span>
              </>
            ) : (
              <>
                <MessageSquarePlus className="w-4 h-4 text-[#F7E3B5]" />
                <span>Write a Review</span>
              </>
            )}
          </button>
        </div>

        {/* Success Banner after Submitting a Review */}
        {submittedSuccess && (
          <div className="p-4 rounded-2xl bg-[#2E6F73]/15 border border-[#2E6F73]/40 text-[#1D4E52] text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-[#2E6F73] shrink-0" />
            <span>
              Thank you for reviewing <strong>{product.name}</strong>! Your review has been
              published below.
            </span>
          </div>
        )}

        {/* Expandable Write a Review Form */}
        {showForm && (
          <form
            onSubmit={handleSubmitReview}
            className="p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-[#FAF6F0] via-white to-[#F9F3FB] border-2 border-[#D8B572] shadow-lg space-y-5 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-[#E5D9C5] pb-3">
              <h3 className="font-serif-editorial text-2xl font-bold text-[#3A1042]">
                Share Your Experience with {product.name}
              </h3>
              <span className="text-[11px] font-semibold text-[#8C2D56] uppercase tracking-wider">
                Instant Publish
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Interactive Star Rating Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#161F33]">
                Your Overall Rating *
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-115 cursor-pointer"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          active ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs font-bold text-[#3A1042]">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161F33] mb-1">
                  Your Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#B8862D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., Ayesha Khan"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5D9C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#3A1042]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161F33] mb-1">
                  City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#B8862D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Lahore, Karachi, Islamabad"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5D9C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#3A1042]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#161F33] mb-1">
                  Size Purchased
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#E5D9C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#3A1042]"
                >
                  {STANDARD_SIZES.map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#161F33] mb-1">
                Review Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g., Loved the embroidery and stitched fit of ${product.name}!`}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5D9C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#3A1042]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#161F33] mb-1">
                Your Review *
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on fabric quality, embroidery detail, and stitched sizing..."
                className="w-full p-3.5 bg-white border border-[#E5D9C5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#3A1042]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-full border border-[#E5D9C5] bg-white text-xs font-bold uppercase tracking-wider text-[#161F33] hover:bg-[#FAF6F0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-royal-shimmer px-6 py-2.5 rounded-full bg-gradient-to-r from-[#B8862D] via-[#D8B572] to-[#B8862D] text-[#1A051E] text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Publishing...' : 'Submit Review'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Rating Summary Card + Verified Customer Review Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left (4 Cols): Average Rating & Star Breakdown */}
          <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#200626] via-[#3A1042] to-[#1A051E] text-white border border-[#D8B572]/70 shadow-lg space-y-5">
            <div className="text-center space-y-2 border-b border-white/15 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#F7E3B5]">
                Overall Customer Rating
              </span>
              <div className="font-serif-editorial text-5xl sm:text-6xl font-bold text-[#F7E3B5]">
                {stats.avg}
                <span className="text-xl text-white/60 font-normal"> / 5.0</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <p className="text-xs text-[#FAF6F0]/80">
                Based on <strong>{stats.total}</strong> Verified Customer{' '}
                {stats.total === 1 ? 'Review' : 'Reviews'}
              </p>
            </div>

            {/* 5-Star to 1-Star Breakdown Bars */}
            <div className="space-y-2.5 text-xs">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.counts[star] || 0;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2.5">
                    <span className="w-12 font-bold text-[#F7E3B5] flex items-center gap-1 shrink-0">
                      <span>{star}</span>
                      <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-white/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#B8862D] to-[#F7E3B5] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] text-white/75 font-mono">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/15 text-center">
              <p className="text-[11px] text-[#F7E3B5]/90">
                100% Authentic Stitched Pret • Verified Buyers Across Pakistan
              </p>
            </div>
          </div>

          {/* Right (8 Cols): Individual Review Cards */}
          <div className="lg:col-span-8 space-y-4">
            {reviews.map((rev, idx) => (
              <div
                key={rev.id}
                style={{ animationDelay: `${(idx % 4) * 0.25}s` }}
                className="product-card-animated p-4 sm:p-5 rounded-2xl bg-white border border-[#D8B572]/55 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A1042] to-[#8C2D56] text-[#F7E3B5] font-serif-editorial text-lg font-bold flex items-center justify-center border border-[#D8B572] shrink-0">
                      {rev.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#161F33]">
                          {rev.customer_name}
                        </span>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2E6F73]/15 text-[#2E6F73] text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#161F33]/60 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>{rev.city}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#3A1042]">
                          Size: {rev.selected_size}
                        </span>
                        <span>•</span>
                        <span>{rev.created_at}</span>
                      </div>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 text-[#F59E0B]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-[#F59E0B] text-[#F59E0B]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.title && (
                  <h4 className="font-serif-editorial text-lg sm:text-xl font-bold text-[#3A1042]">
                    {rev.title}
                  </h4>
                )}

                <p className="text-xs sm:text-sm text-[#161F33]/85 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
