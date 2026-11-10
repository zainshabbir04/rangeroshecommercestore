import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/storefront/ProductCard';

const SUIT_COLOR_CHIPS = [
  { label: 'All 6 Suits', query: '', dot: 'bg-gradient-to-r from-[#3A1042] via-[#B8862D] to-[#2E6F73]' },
  { label: 'Anna Black', query: 'anna', dot: 'bg-[#18181B]' },
  { label: 'Hazel Red', query: 'hazel', dot: 'bg-[#8C1D2E]' },
  { label: 'Olivia Green', query: 'olivia', dot: 'bg-[#4A5335]' },
  { label: 'Orchid Purple', query: 'orchid', dot: 'bg-[#3A1042]' },
  { label: 'Sabz Emerald', query: 'sabz', dot: 'bg-[#0F5243]' },
  { label: 'Zayna Mustard', query: 'zayna', dot: 'bg-[#D99B26]' },
];

export const ShopPage: React.FC = () => {
  const { products, loading } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>(
    'all'
  );
  const [sortBy, setSortBy] = useState(initialSort);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearchTerm(q);
    const s = searchParams.get('sort');
    if (s !== null) setSortBy(s);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (availabilityFilter === 'in_stock') {
      list = list.filter((p) => p.inventory.available_stock > 0);
    } else if (availabilityFilter === 'out_of_stock') {
      list = list.filter((p) => p.inventory.available_stock <= 0);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.color_name.toLowerCase().includes(q) ||
          p.overview.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.effective_price - b.effective_price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.effective_price - a.effective_price);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [products, selectedCategory, availabilityFilter, searchTerm, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setAvailabilityFilter('all');
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="pb-14 sm:pb-16 space-y-8 sm:space-y-10 animate-page-enter">
      {/* 1. LUXURY ROYAL COUTURE PRET COLLECTION BANNER HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#200626] via-[#3A1042] to-[#12192B] text-[#FAF6F0] border-b-2 border-[#B8862D]">
        {/* Ambient Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#8C2D56]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#B8862D]/25 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 text-center space-y-4 sm:space-y-5">
          <div className="feature-pill-animated inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#D8B572]/60 text-[#F7E3B5] text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#D8B572] animate-pulse" />
            <span>Rang e Rosh • Official Pret Collection</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D8B572] animate-pulse" />
          </div>

          <h1 className="wordmark-3d font-serif-editorial text-3xl sm:text-6xl font-bold text-white leading-tight">
            Ladies Stitched <span className="italic font-normal text-[#F7E3B5]">Pret</span> Collection
          </h1>

          <div className="collection-gold-line mx-auto rounded-full" />

          <p className="text-xs sm:text-sm text-[#FAF6F0]/80 max-w-2xl mx-auto leading-relaxed">
            Explore our signature 2-piece stitched embroidered dresses crafted with high-density
            seam construction, antique gold tilla, and refined seasonal fabrics.
          </p>

          {/* Interactive Suit Color / Name Quick Filter Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {SUIT_COLOR_CHIPS.map((chip) => {
              const isSelected = searchTerm.toLowerCase() === chip.query;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setSearchTerm(chip.query)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase flex items-center gap-2 transition-all duration-300 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#B8862D] to-[#9E6F1E] text-white border-[#F7E3B5] shadow-[0_6px_18px_rgba(184,134,45,0.45)] scale-105'
                      : 'bg-white/10 text-[#FAF6F0]/90 border-white/20 hover:bg-white/20 hover:border-[#D8B572]/60'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full border border-white/60 ${chip.dot}`} />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* ANIMATED PRET COLLECTION PRODUCT SHOWCASE */}
        <div className="relative bg-gradient-to-b from-white via-[#FAF6F0]/90 to-white border border-[#D8B572]/60 rounded-2xl p-4 sm:p-8 shadow-[0_14px_40px_-14px_rgba(58,16,66,0.14)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3A1042] via-[#B8862D] to-[#8C2D56]" />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="aspect-[3/4] bg-[#F3ECE0] animate-pulse rounded-xl border border-[#E5D9C5]"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-14 text-center space-y-4">
              <h3 className="font-serif-editorial text-3xl font-bold text-[#161F33]">
                No Stitched Suits Match Your Filter
              </h3>
              <p className="text-sm text-[#161F33]/70 max-w-md mx-auto">
                Reset your search or color filter to view all 6 signature ensembles in the Rang e
                Rosh Pret Collection.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="px-6 py-2.5 bg-gradient-to-r from-[#3A1042] to-[#561961] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:from-[#8C2D56] hover:to-[#681B3C] cursor-pointer shadow-md"
              >
                Show All 6 Suits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
