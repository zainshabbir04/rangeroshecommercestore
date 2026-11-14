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
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
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
  getStorefrontInit: () =>
    request<{ settings: StoreSettings; products: Product[]; categories: string[] }>(
      '/api/storefront/init',
      {},
      () => fallbackStore.getStorefrontInit()
    ),

  getProducts: (params?: {
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
    return request<{ products: Product[] }>(
      `/api/products${queryStr ? `?${queryStr}` : ''}`,
      {},
      () => fallbackStore.getProducts(params)
    );
  },

  getProductDetail: (slugOrId: string) =>
    request<{ product: Product; relatedProducts: Product[] }>(
      `/api/products/${slugOrId}`,
      {},
      () => fallbackStore.getProductDetail(slugOrId)
    ),

  createOrder: (payload: {
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
  }) =>
    request<{ order: Order }>(
      '/api/orders',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => fallbackStore.createOrder(payload)
    ),

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

  // Admin Dashboard
  getDashboard: (range = 'all') =>
    request<DashboardData>(
      `/api/admin/dashboard?range=${encodeURIComponent(range)}`,
      {},
      () => fallbackStore.getDashboard()
    ),

  // Admin Products
  getAdminProducts: () =>
    request<{ products: Product[] }>('/api/admin/products', {}, () =>
      fallbackStore.getAdminProducts()
    ),

  createProduct: async (payload: any) => {
    const res = await request<{ product: Product }>(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => fallbackStore.createProduct(payload)
    );
    emitStoreSync();
    return res;
  },

  updateProduct: async (id: number, payload: any) => {
    const res = await request<{ product: Product }>(
      `/api/admin/products/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      () => fallbackStore.updateProduct(id, payload)
    );
    emitStoreSync();
    return res;
  },

  deleteProduct: async (id: number) => {
    const res = await request<{ message: string }>(
      `/api/admin/products/${id}`,
      {
        method: 'DELETE',
      },
      () => fallbackStore.deleteProduct(id)
    );
    emitStoreSync();
    return res;
  },

  uploadFiles: (files: FileList | File[]) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    return request<{ urls: string[] }>(
      '/api/admin/upload',
      {
        method: 'POST',
        body: formData,
      },
      async () => {
        const urls = await Promise.all(
          Array.from(files).map(async (file) => {
            const isVideo =
              file.type.startsWith('video/') ||
              /\.(mp4|webm|mov|m4v|avi|mkv|wmv|flv|3gp|ogg|ogv|mpeg|mpg|ts|m2ts)$/i.test(file.name);
            if (isVideo) {
              return saveFileToMediaStore(file);
            }
            if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.name)) {
              return compressImageToDataUrl(file);
            }
            return saveFileToMediaStore(file);
          })
        );
        return { urls };
      }
    );
  },

  // Admin Inventory
  getInventory: () =>
    request<{ products: Product[]; transactions: InventoryTransaction[] }>(
      '/api/admin/inventory',
      {},
      () => fallbackStore.getInventory()
    ),

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
    const res = await request<{ product: Product }>(
      `/api/admin/inventory/${productId}/adjust`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => fallbackStore.adjustInventory(productId, payload)
    );
    emitStoreSync();
    return res;
  },

  // Admin Orders
  getAdminOrders: (params?: {
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
    return request<{ orders: Order[] }>(
      `/api/admin/orders${queryStr ? `?${queryStr}` : ''}`,
      {},
      () => fallbackStore.getAdminOrders(params)
    );
  },

  updateOrderStatus: async (id: number, status: string) => {
    const res = await request<{ order: Order }>(
      `/api/admin/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      () => fallbackStore.updateOrderStatus(id, status)
    );
    emitStoreSync();
    return res;
  },

  // Admin Settings
  getSettings: () =>
    request<{ settings: StoreSettings }>('/api/admin/settings', {}, () =>
      fallbackStore.getSettings()
    ),

  updateSettings: async (payload: Partial<StoreSettings>) => {
    const res = await request<{ settings: StoreSettings }>(
      '/api/admin/settings',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      () => fallbackStore.updateSettings(payload)
    );
    emitStoreSync();
    return res;
  },
};

export function formatPrice(amount: number, currency = 'PKR'): string {
  return `${currency} ${Number(amount || 0).toLocaleString('en-PK')}`;
}
