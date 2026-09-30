export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  fcm_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  brand: string | null;
  price: number;
  discount_price: number | null;
  unit: string;
  weight_quantity: string | null;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface AddressSnapshot {
  full_name: string;
  phone: string;
  house_building: string;
  street_area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  delivery_instructions?: string;
}

export type PaymentMethod = "upi" | "cod" | "pay_at_store";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "refunded";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  discount_price: number | null;
  unit_price: number;
  quantity: number;
  total_item_price: number;
  unit: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  address_id: string | null;
  delivery_address_snapshot: AddressSnapshot;
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  upi_transaction_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  profile?: Profile;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  store_phone: string;
  store_address: string;
  upi_vpa: string;
  upi_merchant_name: string;
  cod_enabled: boolean;
  pay_at_store_enabled: boolean;
  min_order_amount: number;
  delivery_fee: number;
  free_delivery_threshold: number;
  is_store_open: boolean;
  updated_at: string;
}
