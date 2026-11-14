import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { useStore } from './StoreContext';

interface CartContextValue {
  items: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  shippingCharges: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string,
    openDrawer?: boolean
  ) => { success: boolean; message: string };
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, newQuantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  getProductQuantityInCart: (productId: number) => number;
}

const CART_STORAGE_KEY = 'rer_shopping_cart_v1';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, products } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore corrupted storage
    }
    return [];
  });

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage quota errors
    }
  }, [items]);

  // Sync live stock limits & prices whenever products refresh from the backend
  useEffect(() => {
    if (products.length === 0) return;
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          const liveProd = products.find((p) => p.id === item.product_id);
          if (!liveProd) return item;
          const sizeStockMap = liveProd.inventory.size_stock;
          const sizeAvail =
            sizeStockMap && item.selected_size in sizeStockMap
              ? Number(sizeStockMap[item.selected_size] ?? 0)
              : liveProd.inventory.available_stock;
          return {
            ...item,
            unit_price: liveProd.effective_price,
            regular_price: liveProd.regular_price,
            max_available: sizeAvail,
            quantity: sizeAvail > 0 ? Math.min(item.quantity, sizeAvail) : item.quantity,
          };
        })
        .filter((item) => item.max_available > 0)
    );
  }, [products]);

  const getProductQuantityInCart = (productId: number): number => {
    return items
      .filter((i) => i.product_id === productId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string,
    openDrawer = true
  ): { success: boolean; message: string } => {
    const availStock = product.inventory.available_stock;
    if (availStock <= 0) {
      return { success: false, message: `"${product.name}" is currently Out of Stock.` };
    }

    const sizeVal = (selectedSize || product.sizes[0] || 'Small').trim();
    const colorVal = (selectedColor || product.colors[0] || product.color_name || '').trim();
    const itemKey = `${product.id}__${sizeVal}__${colorVal}`;

    const sizeStockMap = product.inventory.size_stock;
    const maxForSize =
      sizeStockMap && sizeVal in sizeStockMap
        ? Number(sizeStockMap[sizeVal] ?? 0)
        : availStock;

    if (maxForSize <= 0) {
      return {
        success: false,
        message: `"${product.name}" in size "${sizeVal}" is currently Out of Stock.`,
      };
    }

    const currentQtyForSize = items
      .filter((i) => i.product_id === product.id && i.selected_size === sizeVal)
      .reduce((sum, i) => sum + i.quantity, 0);

    if (currentQtyForSize + quantity > maxForSize) {
      return {
        success: false,
        message: `Maximum available stock for "${product.name}" (${sizeVal}) reached.`,
      };
    }

    const currentTotalForProduct = getProductQuantityInCart(product.id);
    if (currentTotalForProduct + quantity > availStock) {
      return {
        success: false,
        message: `Maximum available stock for "${product.name}" reached.`,
      };
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.key === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          max_available: maxForSize,
          unit_price: product.effective_price,
        };
        return updated;
      }

      return [
        ...prev,
        {
          key: itemKey,
          product_id: product.id,
          slug: product.slug,
          sku: product.sku,
          name: product.name,
          collection_name: product.collection_name,
          image: product.primary_image,
          unit_price: product.effective_price,
          regular_price: product.regular_price,
          selected_size: sizeVal,
          selected_color: colorVal,
          quantity,
          max_available: maxForSize,
        },
      ];
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }

    return {
      success: true,
      message: `Added "${product.name}" (${sizeVal}) to your shopping bag.`,
    };
  };

  const removeFromCart = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateQuantity = (
    key: string,
    newQuantity: number
  ): { success: boolean; message?: string } => {
    if (newQuantity <= 0) {
      removeFromCart(key);
      return { success: true };
    }

    const target = items.find((i) => i.key === key);
    if (!target) return { success: false };

    const otherVariantsQty = items
      .filter((i) => i.product_id === target.product_id && i.key !== key)
      .reduce((sum, i) => sum + i.quantity, 0);

    if (otherVariantsQty + newQuantity > target.max_available) {
      return {
        success: false,
        message: `Maximum available stock for "${target.name}" (${target.selected_size}) reached.`,
      };
    }

    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: newQuantity } : i))
    );
    return { success: true };
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [items]
  );

  const shippingCharges = useMemo(() => {
    if (items.length === 0) return 0;
    const freeThreshold = settings?.free_shipping_threshold ?? 15000;
    const baseShipping = settings?.shipping_charges ?? 250;
    if (freeThreshold > 0 && subtotal >= freeThreshold) {
      return 0;
    }
    return baseShipping;
  }, [items.length, subtotal, settings]);

  const grandTotal = subtotal + shippingCharges;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        subtotal,
        shippingCharges,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getProductQuantityInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
