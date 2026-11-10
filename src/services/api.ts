import {
  Product,
  StoreSettings,
  Order,
  DashboardData,
  InventoryTransaction,
} from '../types';

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

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
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

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Storefront
  getStorefrontInit: () =>
    request<{ settings: StoreSettings; products: Product[]; categories: string[] }>(
      '/api/storefront/init'
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
    return request<{ products: Product[] }>(`/api/products${queryStr ? `?${queryStr}` : ''}`);
  },

  getProductDetail: (slugOrId: string) =>
    request<{ product: Product; relatedProducts: Product[] }>(`/api/products/${slugOrId}`),

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
    request<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  lookupOrder: (orderNumber: string) =>
    request<{ order: Order }>(`/api/orders/lookup/${encodeURIComponent(orderNumber)}`),

  subscribeNewsletter: (email: string) =>
    request<{ message: string }>('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Admin Auth
  adminLogin: (email: string, password: string) =>
    request<{
      token: string;
      admin: { id: number; email: string; name: string; role: string };
    }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  adminMe: () =>
    request<{ admin: { id: number; email: string; name: string; role: string } }>('/api/admin/me'),

  // Admin Dashboard
  getDashboard: (range = 'all') =>
    request<DashboardData>(`/api/admin/dashboard?range=${encodeURIComponent(range)}`),

  // Admin Products
  getAdminProducts: () => request<{ products: Product[] }>('/api/admin/products'),

  createProduct: (payload: any) =>
    request<{ product: Product }>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProduct: (id: number, payload: any) =>
    request<{ product: Product }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id: number) =>
    request<{ message: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    }),

  uploadFiles: (files: FileList | File[]) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    return request<{ urls: string[] }>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Admin Inventory
  getInventory: () =>
    request<{ products: Product[]; transactions: InventoryTransaction[] }>('/api/admin/inventory'),

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
    request<{ product: Product }>(`/api/admin/inventory/${productId}/adjust`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

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
    return request<{ orders: Order[] }>(`/api/admin/orders${queryStr ? `?${queryStr}` : ''}`);
  },

  updateOrderStatus: (id: number, status: string) =>
    request<{ order: Order }>(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Admin Settings
  getSettings: () => request<{ settings: StoreSettings }>('/api/admin/settings'),

  updateSettings: (payload: Partial<StoreSettings>) =>
    request<{ settings: StoreSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

export function formatPrice(amount: number, currency = 'PKR'): string {
  return `${currency} ${Number(amount || 0).toLocaleString('en-PK')}`;
}
