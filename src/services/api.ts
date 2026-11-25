import {
  Product,
  StoreSettings,
  Order,
  DashboardData,
  InventoryTransaction,
} from '../types';
import { fallbackStore } from './fallbackStore';
import { compressImageToDataUrl, saveFileToMediaStore } from './mediaStorage';

function emitStoreSync(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rer-store-sync'));
  }
}

const TOKEN_KEY = 'rer_admin_token';

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

const CLOUD_API_ORIGIN = 'https://rangerosh.com';

function mergeOrdersList(primary: Order[], secondary: Order[]): Order[] {
  const byOrderNumber = new Map<string, Order>();
  for (const ord of [...primary, ...secondary]) {
    if (!ord || !ord.order_number) continue;
    if (!byOrderNumber.has(ord.order_number)) {
      byOrderNumber.set(ord.order_number, ord);
    }
  }
  return Array.from(byOrderNumber.values()).sort((a, b) => {
    const tA = new Date(a.created_at || 0).getTime() || 0;
    const tB = new Date(b.created_at || 0).getTime() || 0;
    return tB - tA || (b.id || 0) - (a.id || 0);
  });
}

function mergeProductsWithAdminEdits(serverProducts: Product[]): Product[] {
  try {
    const dirty = fallbackStore.getDirtyMeta();
    const localProducts = fallbackStore.getAdminProducts().products || [];
    const localById = new Map<number, Product>();
    for (const lp of localProducts) {
      localById.set(lp.id, lp);
    }

    const merged: Product[] = [];
    const seenIds = new Set<number>();

    for (const sp of serverProducts || []) {
      if (dirty.deletedProductIds?.[String(sp.id)]) {
        continue;
      }
      seenIds.add(sp.id);
      if (dirty.productsModified?.[String(sp.id)] && localById.has(sp.id)) {
        merged.push(localById.get(sp.id)!);
      } else {
        merged.push(sp);
      }
    }

    // Also include any newly created products saved locally by Admin
    for (const lp of localProducts) {
      if (dirty.deletedProductIds?.[String(lp.id)]) continue;
      if (!seenIds.has(lp.id) && dirty.productsModified?.[String(lp.id)]) {
        merged.push(lp);
      }
    }

    return merged;
  } catch {
    return serverProducts;
  }
}

function mergeSettingsWithAdminEdits(serverSettings: StoreSettings): StoreSettings {
  try {
    const dirty = fallbackStore.getDirtyMeta();
    if (dirty.settingsModified) {
      const localSettings = fallbackStore.getSettings().settings;
      if (localSettings) {
        return {
          ...serverSettings,
          ...localSettings,
        };
      }
    }
    return serverSettings;
  } catch {
    return serverSettings;
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {},
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let res = await fetch(url, {
      ...options,
      headers,
    });

    let contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && url.startsWith('/api/')) {
      try {
        const cloudRes = await fetch(`${CLOUD_API_ORIGIN}${url}`, {
          ...options,
          headers,
        });
        const cloudCt = cloudRes.headers.get('content-type') || '';
        if (cloudCt.includes('application/json')) {
          res = cloudRes;
          contentType = cloudCt;
        }
      } catch {
        // fallback handled below
      }
    }

    if (!contentType.includes('application/json')) {
      if (fallbackFn) {
        return await fallbackFn();
      }
      throw new Error(`Unexpected response from server (${res.status})`);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if ((res.status === 404 || res.status === 502 || res.status === 503) && fallbackFn) {
        return await fallbackFn();
      }
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data as T;
  } catch (err: any) {
    if (
      fallbackFn &&
      (err instanceof TypeError ||
        String(err?.message || '').includes('Failed to fetch') ||
        String(err?.message || '').includes('NetworkError') ||
        String(err?.message || '').includes('Unexpected response'))
    ) {
      return await fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Storefront
  getStorefrontInit: async () => {
    const res = await request<{ settings: StoreSettings; products: Product[]; categories: string[] }>(
      '/api/storefront/init',
      {},
      () => fallbackStore.getStorefrontInit()
    );
    const mergedSettings = mergeSettingsWithAdminEdits(res.settings);
    const mergedProducts = mergeProductsWithAdminEdits(res.products || []).filter(
      (p) => p.is_published
    );
    const categories = Array.from(new Set(mergedProducts.map((p) => p.category)));
    return {
      settings: mergedSettings,
      products: mergedProducts,
      categories,
    };
  },

  getProducts: async (params?: {
    category?: string;
    search?: string;
    sort?: string;
    availability?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.sort) qs.set('sort', params.sort);
    if (params?.availability) qs.set('availability', params.availability);
    const queryStr = qs.toString();
    const res = await request<{ products: Product[] }>(
      `/api/products${queryStr ? `?${queryStr}` : ''}`,
      {},
      () => fallbackStore.getProducts(params)
    );
    return {
      products: mergeProductsWithAdminEdits(res.products || []).filter((p) => p.is_published),
    };
  },

  getProductDetail: async (slugOrId: string) => {
    const res = await request<{ product: Product; relatedProducts: Product[] }>(
      `/api/products/${slugOrId}`,
      {},
      () => fallbackStore.getProductDetail(slugOrId)
    );
    const mergedAll = mergeProductsWithAdminEdits([res.product, ...(res.relatedProducts || [])]);
    const product =
      mergedAll.find((p) => p.slug === slugOrId || String(p.id) === slugOrId) || res.product;
    const relatedProducts = mergedAll.filter((p) => p.id !== product.id && p.is_published);
    return { product, relatedProducts };
  },

  getProductReviews: (slug: string) =>
    request<{ reviews: any[] }>(
      `/api/products/${encodeURIComponent(slug)}/reviews`,
      {},
      () => ({ reviews: [] })
    ),

  createProductReview: (slug: string, payload: any) =>
    request<{ review: any; reviews: any[] }>(
      `/api/products/${encodeURIComponent(slug)}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => ({ review: payload, reviews: [payload] })
    ),

  createOrder: async (payload: {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    shipping_address: string;
    city: string;
    order_notes?: string;
    payment_method: string;
    items: Array<{
      product_id: number;
      quantity: number;
      selected_size?: string;
      selected_color?: string;
    }>;
  }) => {
    let usedFallback = false;
    const res = await request<{ order: Order }>(
      '/api/orders',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => {
        usedFallback = true;
        return fallbackStore.createOrder(payload);
      }
    );
    if (!usedFallback) {
      try {
        // Reserve stock in local fallback too so inventory stays in sync
        const localProds = fallbackStore.getAdminProducts().products || [];
        for (const item of payload.items || []) {
          const p = localProds.find((pr) => pr.id === Number(item.product_id));
          if (p) {
            p.inventory.reserved_stock = Number(p.inventory.reserved_stock || 0) + Number(item.quantity || 1);
            fallbackStore.syncProduct(p, true);
          }
        }
        if (res?.order) {
          fallbackStore.syncOrder(res.order);
        }
      } catch {
        // keep local fallback in sync
      }
    }
    emitStoreSync();
    return res;
  },

  lookupOrder: (orderNumber: string) =>
    request<{ order: Order }>(
      `/api/orders/lookup/${encodeURIComponent(orderNumber)}`,
      {},
      () => fallbackStore.lookupOrder(orderNumber)
    ),

  subscribeNewsletter: (email: string) =>
    request<{ message: string }>(
      '/api/newsletter',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      () => ({ message: 'Subscribed successfully! Welcome to Rang e Rosh.' })
    ),

  // Admin Auth
  adminLogin: (email: string, password: string) =>
    request<{
      token: string;
      admin: { id: number; email: string; name: string; role: string };
    }>(
      '/api/admin/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      () => fallbackStore.adminLogin(email, password)
    ),

  adminMe: () =>
    request<{ admin: { id: number; email: string; name: string; role: string } }>(
      '/api/admin/me',
      {},
      () => fallbackStore.adminMe()
    ),

  changeAdminPassword: async (payload: {
    email?: string;
    current_password: string;
    new_password: string;
  }) => {
    let usedFallback = false;
    const res = await request<{ message: string }>(
      '/api/admin/change-password',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => {
        usedFallback = true;
        return fallbackStore.changeAdminPassword(payload);
      }
    );
    if (!usedFallback) {
      try {
        fallbackStore.syncAdminPassword(payload.new_password, payload.email);
      } catch {
        // keep local storage in sync
      }
    }
    return res;
  },

  // Admin Dashboard
  getDashboard: async (range = 'all') => {
    const res = await request<DashboardData>(
      `/api/admin/dashboard?range=${encodeURIComponent(range)}`,
      {},
      () => fallbackStore.getDashboard()
    );
    try {
      const localOrders = fallbackStore.getAdminOrders().orders || [];
      const mergedAllOrders = mergeOrdersList(res.recent_orders || [], localOrders);
      const mergedProducts = mergeProductsWithAdminEdits(
        res.top_selling_products || fallbackStore.getAdminProducts().products || []
      );
      const confirmedStatuses = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
      const confirmedOrders = mergedAllOrders.filter((o) => confirmedStatuses.includes(o.status));
      const pendingOrders = mergedAllOrders.filter((o) => o.status === 'Pending');
      const cancelledOrders = mergedAllOrders.filter((o) => o.status === 'Cancelled');
      const totalSales = confirmedOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
      const pendingSales = pendingOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
      const lowStockProducts = mergedProducts.filter(
        (p) => p.inventory.stock_status === 'Low Stock'
      );
      const outOfStockProducts = mergedProducts.filter(
        (p) => p.inventory.stock_status === 'Out of Stock'
      );

      return {
        ...res,
        summary: {
          ...res.summary,
          total_products: mergedProducts.length,
          total_orders: Math.max(res.summary?.total_orders || 0, mergedAllOrders.length),
          confirmed_orders: Math.max(res.summary?.confirmed_orders || 0, confirmedOrders.length),
          pending_orders: Math.max(res.summary?.pending_orders || 0, pendingOrders.length),
          cancelled_orders: Math.max(res.summary?.cancelled_orders || 0, cancelledOrders.length),
          total_sales: Math.max(res.summary?.total_sales || 0, totalSales),
          pending_sales: Math.max(res.summary?.pending_sales || 0, pendingSales),
          low_stock_count: lowStockProducts.length,
          out_of_stock_count: outOfStockProducts.length,
        },
        low_stock_products: lowStockProducts,
        out_of_stock_products: outOfStockProducts,
        top_selling_products: [...mergedProducts].sort(
          (a, b) => b.inventory.sold_quantity - a.inventory.sold_quantity
        ),
        recent_orders: mergedAllOrders.slice(0, 15),
      };
    } catch {
      return res;
    }
  },

  // Admin Products
  getAdminProducts: async () => {
    const res = await request<{ products: Product[] }>('/api/admin/products', {}, () =>
      fallbackStore.getAdminProducts()
    );
    return {
      products: mergeProductsWithAdminEdits(res.products || []),
    };
  },

  createProduct: async (payload: any) => {
    let usedFallback = false;
    const res = await request<{ product: Product }>(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => {
        usedFallback = true;
        return fallbackStore.createProduct(payload);
      }
    );
    if (!usedFallback && res?.product) {
      try {
        fallbackStore.syncProduct(res.product, true);
      } catch {
        // keep local fallback in sync
      }
    }
    emitStoreSync();
    return res;
  },

  updateProduct: async (id: number, payload: any) => {
    let usedFallback = false;
    const res = await request<{ product: Product }>(
      `/api/admin/products/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      () => {
        usedFallback = true;
        return fallbackStore.updateProduct(id, payload);
      }
    );
    if (!usedFallback) {
      try {
        // Always apply the admin's payload directly to local persistent storage first,
        // so even if a serverless instance cold-starts on the next request, the exact edit is preserved.
        fallbackStore.updateProduct(id, payload);
      } catch {
        if (res?.product) {
          fallbackStore.syncProduct(res.product, true);
        }
      }
    }
    emitStoreSync();
    return res;
  },

  deleteProduct: async (id: number) => {
    let usedFallback = false;
    const res = await request<{ message: string }>(
      `/api/admin/products/${id}`,
      {
        method: 'DELETE',
      },
      () => {
        usedFallback = true;
        return fallbackStore.deleteProduct(id);
      }
    );
    if (!usedFallback) {
      try {
        fallbackStore.deleteProduct(id);
      } catch {
        // keep local fallback in sync
      }
    }
    emitStoreSync();
    return res;
  },

  uploadFiles: async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalhost) {
      const formData = new FormData();
      fileList.forEach((f) => formData.append('files', f));
      return request<{ urls: string[] }>(
        '/api/admin/upload',
        {
          method: 'POST',
          body: formData,
        },
        async () => {
          const urls = await Promise.all(
            fileList.map(async (file) => {
              const isVideo =
                file.type.startsWith('video/') ||
                /\.(mp4|webm|mov|m4v|avi|mkv|wmv|flv|3gp|ogg|ogv|mpeg|mpg|ts|m2ts)$/i.test(
                  file.name
                );
              if (isVideo) return saveFileToMediaStore(file);
              return compressImageToDataUrl(file);
            })
          );
          return { urls };
        }
      );
    }

    // On cloud/Vercel deployment, convert images to portable Data URLs so they are stored
    // directly inside the shared cloud API state and visible across all devices & browsers.
    const urls = await Promise.all(
      fileList.map(async (file) => {
        const isVideo =
          file.type.startsWith('video/') ||
          /\.(mp4|webm|mov|m4v|avi|mkv|wmv|flv|3gp|ogg|ogv|mpeg|mpg|ts|m2ts)$/i.test(file.name);
        if (isVideo) {
          if (file.size <= 12 * 1024 * 1024) {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.readAsDataURL(file);
            });
          }
          return saveFileToMediaStore(file);
        }
        return compressImageToDataUrl(file);
      })
    );
    return { urls };
  },

  // Admin Inventory
  getInventory: async () => {
    const res = await request<{ products: Product[]; transactions: InventoryTransaction[] }>(
      '/api/admin/inventory',
      {},
      () => fallbackStore.getInventory()
    );
    const localInv = fallbackStore.getInventory();
    const seenTxIds = new Set<string>();
    const mergedTxs: InventoryTransaction[] = [];
    for (const tx of [...(localInv.transactions || []), ...(res.transactions || [])]) {
      const key = `${tx.product_id}-${tx.change_type}-${tx.created_at}-${tx.note}`;
      if (!seenTxIds.has(key)) {
        seenTxIds.add(key);
        mergedTxs.push(tx);
      }
    }
    return {
      products: mergeProductsWithAdminEdits(res.products || []),
      transactions: mergedTxs,
    };
  },

  adjustInventory: async (
    productId: number,
    payload: {
      mode: 'set' | 'increase' | 'decrease';
      quantity: number;
      size?: string;
      size_stock?: Record<string, number>;
      low_stock_threshold?: number;
      note?: string;
    }
  ) => {
    let usedFallback = false;
    const res = await request<{ product: Product }>(
      `/api/admin/inventory/${productId}/adjust`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => {
        usedFallback = true;
        return fallbackStore.adjustInventory(productId, payload);
      }
    );
    if (!usedFallback) {
      try {
        const localAdjusted = fallbackStore.adjustInventory(productId, payload);
        emitStoreSync();
        return localAdjusted;
      } catch {
        if (res?.product) {
          fallbackStore.syncProduct(res.product, true);
        }
      }
    }
    emitStoreSync();
    return res;
  },

  // Admin Orders
  getAdminOrders: async (params?: {
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    if (params?.date_from) qs.set('date_from', params.date_from);
    if (params?.date_to) qs.set('date_to', params.date_to);
    const queryStr = qs.toString();
    const res = await request<{ orders: Order[] }>(
      `/api/admin/orders${queryStr ? `?${queryStr}` : ''}`,
      {},
      () => fallbackStore.getAdminOrders(params)
    );
    try {
      const localOrders = fallbackStore.getAdminOrders(params).orders || [];
      return {
        orders: mergeOrdersList(res.orders || [], localOrders),
      };
    } catch {
      return res;
    }
  },

  updateOrderStatus: async (id: number, status: string) => {
    let usedFallback = false;
    const res = await request<{ order: Order }>(
      `/api/admin/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      () => {
        usedFallback = true;
        return fallbackStore.updateOrderStatus(id, status);
      }
    );
    if (!usedFallback) {
      try {
        fallbackStore.updateOrderStatus(id, status);
      } catch {
        if (res?.order) {
          fallbackStore.syncOrder(res.order);
        }
      }
    }
    emitStoreSync();
    return res;
  },

  // Admin Settings
  getSettings: async () => {
    const res = await request<{ settings: StoreSettings }>('/api/admin/settings', {}, () =>
      fallbackStore.getSettings()
    );
    return {
      settings: mergeSettingsWithAdminEdits(res.settings),
    };
  },

  updateSettings: async (payload: Partial<StoreSettings>) => {
    let usedFallback = false;
    const res = await request<{ settings: StoreSettings }>(
      '/api/admin/settings',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      () => {
        usedFallback = true;
        return fallbackStore.updateSettings(payload);
      }
    );
    if (!usedFallback) {
      try {
        fallbackStore.updateSettings(payload);
      } catch {
        // keep local fallback in sync
      }
    }
    emitStoreSync();
    return res;
  },
};

export function formatPrice(amount: number, currency = 'PKR'): string {
  return `${currency} ${Number(amount || 0).toLocaleString('en-PK')}`;
}
