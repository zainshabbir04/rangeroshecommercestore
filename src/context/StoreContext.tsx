import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, StoreSettings } from '../types';
import { api } from '../services/api';

interface StoreContextValue {
  settings: StoreSettings | null;
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refreshStorefront: () => Promise<void>;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isSizeChartOpen: boolean;
  setIsSizeChartOpen: (open: boolean) => void;
}

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  store_name: 'Rang e Rosh',
  store_tagline: 'Ladies Stitched Suits — Pret Collection',
  logo_url: '/assets/logo/website-logo.jpg',
  contact_email: 'rangerosh.official@gmail.com',
  contact_phone: '+923 130 888 048',
  whatsapp_number: '+923 200 300 552',
  whatsapp_clean: '923200300552',
  shipping_charges: 250,
  free_shipping_threshold: 15000,
  low_stock_threshold: 5,
  currency: 'PKR',
  announcement_text:
    'Complimentary Nationwide Shipping on Orders Above PKR 15,000  •  Direct WhatsApp Concierge Order Confirmation',
  hero_badge: 'RANG E ROSH  •  LUXURY PRET COLLECTION',
  hero_title: 'Artisanal Embroidery & Timeless Stitched Elegance',
  hero_subtitle:
    'Discover our signature 2-piece stitched ensembles, meticulously tailored with intricate threadwork, refined fabrics, and effortless modern silhouettes.',
  promo_banner_title: 'Crafted for Poise & Everyday Luxury',
  promo_banner_subtitle:
    'Every Rang e Rosh ensemble features high-density precision tailoring, reinforced embroidery facings, and breathable seasonal weaves.',
  instagram_url: 'https://www.instagram.com/rangerosh/',
  youtube_url: 'https://www.youtube.com/@rangerosh',
  tiktok_url: 'https://www.tiktok.com/@rangerosh',
  facebook_url: 'https://www.facebook.com/RangeRosh/',
  payment_methods: ['Cash on Delivery (COD)', 'Bank Transfer (Confirm via WhatsApp)'],
  updated_at: '',
};

const StoreContext = createContext<StoreContextValue>({
  settings: DEFAULT_SETTINGS,
  products: [],
  categories: [],
  loading: true,
  error: null,
  refreshStorefront: async () => {},
  quickViewProduct: null,
  setQuickViewProduct: () => {},
  isSizeChartOpen: false,
  setIsSizeChartOpen: () => {},
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState<boolean>(false);

  const refreshStorefront = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getStorefrontInit();
      setSettings(data.settings);
      setProducts(data.products);
      setCategories(data.categories);
    } catch (err: any) {
      setError(err.message || 'Failed to load storefront data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStorefront();
  }, [refreshStorefront]);

  return (
    <StoreContext.Provider
      value={{
        settings,
        products,
        categories,
        loading,
        error,
        refreshStorefront,
        quickViewProduct,
        setQuickViewProduct,
        isSizeChartOpen,
        setIsSizeChartOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
