import {
  Product,
  StoreSettings,
  Order,
  DashboardData,
  InventoryTransaction,
} from '../types';
import { fallbackStore } from './fallbackStore';
import { saveFileToMediaStore } from './mediaStorage';

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

  createProduct: (payload: any) =>
    request<{ product: Product }>(
      '/api/admin/products',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => fallbackStore.createProduct(payload)
    ),

  updateProduct: (id: number, payload: any) =>
    request<{ product: Product }>(
      `/api/admin/products/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      () => fallbackStore.updateProduct(id, payload)
    ),

  deleteProduct: (id: number) =>
    request<{ message: string }>(
      `/api/admin/products/${id}`,
      {
        method: 'DELETE',
      },
      () => fallbackStore.deleteProduct(id)
    ),

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
            if (isVideo || file.size > 500 * 1024) {
              return saveFileToMediaStore(file);
            }
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result || ''));
              reader.readAsDataURL(file);
            });
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

  adjustInventory: (
    productId: number,
    payload: {
      mode: 'set' | 'increase' | 'decrease';
      quantity: number;
      size?: string;
      size_stock?: Record<string, number>;
      low_stock_threshold?: number;
      note?: string;
    }
  ) =>
    request<{ product: Product }>(
      `/api/admin/inventory/${productId}/adjust`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => fallbackStore.adjustInventory(productId, payload)
    ),

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

  updateOrderStatus: (id: number, status: string) =>
    request<{ order: Order }>(
      `/api/admin/orders/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      () => fallbackStore.updateOrderStatus(id, status)
    ),

  // Admin Settings
  getSettings: () =>
    request<{ settings: StoreSettings }>('/api/admin/settings', {}, () =>
      fallbackStore.getSettings()
    ),

  updateSettings: (payload: Partial<StoreSettings>) =>
    request<{ settings: StoreSettings }>(
      '/api/admin/settings',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      () => fallbackStore.updateSettings(payload)
    ),
};

export function formatPrice(amount: number, currency = 'PKR'): string {
  return `${currency} ${Number(amount || 0).toLocaleString('en-PK')}`;
}
