export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_primary: number;
}

export interface ProductVariant {
  id: number;
  size_label: string;
  color_label: string;
  sku_suffix: string;
  additional_price: number;
  is_available: number;
}

export type StandardSize = 'Small' | 'Medium' | 'Large' | 'Extra Large';

export const STANDARD_SIZES: StandardSize[] = ['Small', 'Medium', 'Large', 'Extra Large'];

export interface ProductInventory {
  available_stock: number;
  reserved_stock: number;
  sold_quantity: number;
  low_stock_threshold: number;
  stock_status: StockStatus;
  size_stock?: Record<string, number>;
  updated_at: string;
}

export interface Product {
  id: number;
  slug: string;
  sku: string;
  name: string;
  collection_name: string;
  category: string;
  regular_price: number;
  discounted_price: number | null;
  effective_price: number;
  overview: string;
  product_type_detail: string;
  color_name: string;
  fabric: string;
  fit: string;
  embroidered_details: string;
  suit_stitching: string;
  outfit_architecture: string;
  wash_care: string;
  color_disclaimer: string;
  video_url: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_published: boolean;
  primary_image: string;
  secondary_image: string;
  images: ProductImage[];
  variants: ProductVariant[];
  sizes: string[];
  colors: string[];
  inventory: ProductInventory;
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  store_tagline: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  whatsapp_clean: string;
  shipping_charges: number;
  free_shipping_threshold: number;
  low_stock_threshold: number;
  currency: string;
  announcement_text: string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  promo_banner_title: string;
  promo_banner_subtitle: string;
  instagram_url: string;
  youtube_url: string;
  tiktok_url: string;
  facebook_url: string;
  payment_methods: string[];
  updated_at: string;
}

export interface CartItem {
  key: string; // `${product.id}-${selectedSize}-${selectedColor}`
  product_id: number;
  slug: string;
  sku: string;
  name: string;
  collection_name: string;
  image: string;
  unit_price: number;
  regular_price: number;
  selected_size: string;
  selected_color: string;
  quantity: number;
  max_available: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  product_image: string;
  selected_size: string;
  selected_color: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id?: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  order_notes: string;
  payment_method: string;
  subtotal: number;
  shipping_charges: number;
  total_amount: number;
  status: OrderStatus;
  stock_deducted: boolean;
  stock_reserved: boolean;
  whatsapp_message: string;
  whatsapp_url?: string;
  store_whatsapp?: string;
  customer_whatsapp_message?: string;
  customer_whatsapp_url?: string;
  store_whatsapp_message?: string;
  store_whatsapp_url?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  order_id: number | null;
  order_number: string | null;
  change_type: string;
  quantity_delta: number;
  previous_available: number;
  new_available: number;
  previous_reserved: number;
  new_reserved: number;
  note: string;
  performed_by: string;
  created_at: string;
}

export interface DashboardData {
  summary: {
    total_products: number;
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    cancelled_orders: number;
    total_sales: number;
    pending_sales: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
  low_stock_products: Product[];
  out_of_stock_products: Product[];
  top_selling_products: Product[];
  daily_analytics: Array<{
    date: string;
    order_count: number;
    revenue: number;
  }>;
  recent_orders: Order[];
}
