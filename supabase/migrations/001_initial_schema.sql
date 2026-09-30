-- ==============================================================================
-- 001_initial_schema.sql
-- Shree Jee Kirana - Complete PostgreSQL Database Schema
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    phone text,
    role text not null default 'customer' check (role in ('customer', 'admin')),
    avatar_url text,
    fcm_token text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Index on role for fast access-control queries
create index if not exists idx_profiles_role on public.profiles(role);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    slug text not null unique,
    icon_url text,
    is_active boolean not null default true,
    display_order integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_categories_active on public.categories(is_active, display_order);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS
-- ------------------------------------------------------------------------------
create table if not exists public.products (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid not null references public.categories(id) on delete restrict,
    name text not null,
    description text,
    brand text,
    price numeric(10,2) not null check (price >= 0),
    discount_price numeric(10,2) check (discount_price is null or (discount_price >= 0 and discount_price <= price)),
    unit text not null default '1 unit',
    weight_quantity text,
    stock_quantity integer not null default 0 check (stock_quantity >= 0),
    images text[] not null default '{}',
    is_active boolean not null default true,
    is_featured boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_name_search on public.products using gin(to_tsvector('english', name || ' ' || coalesce(brand, '')));

-- ------------------------------------------------------------------------------
-- 4. ADDRESSES
-- ------------------------------------------------------------------------------
create table if not exists public.addresses (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    full_name text not null,
    phone text not null,
    house_building text not null,
    street_area text not null,
    landmark text,
    city text not null,
    state text not null default 'Rajasthan',
    pincode text not null,
    latitude double precision,
    longitude double precision,
    is_default boolean not null default false,
    delivery_instructions text,
    created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

-- ------------------------------------------------------------------------------
-- 5. CART ITEMS (Server-synced Cart)
-- ------------------------------------------------------------------------------
create table if not exists public.cart_items (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity integer not null default 1 check (quantity > 0),
    updated_at timestamptz not null default now(),
    unique(user_id, product_id)
);

create index if not exists idx_cart_user on public.cart_items(user_id);

-- ------------------------------------------------------------------------------
-- 6. STORE SETTINGS
-- ------------------------------------------------------------------------------
create table if not exists public.store_settings (
    id uuid primary key default uuid_generate_v4(),
    store_name text not null default 'Shree Jee Kirana',
    store_phone text not null default '+91 9079192291',
    store_address text not null default 'Lal Bagh, Kothariya Road, Nathdwara, Pincode 313301',
    upi_vpa text not null default 'shreejeekirana@upi',
    upi_merchant_name text not null default 'Shree Jee Kirana',
    cod_enabled boolean not null default true,
    pay_at_store_enabled boolean not null default true,
    min_order_amount numeric(10,2) not null default 100.00,
    delivery_fee numeric(10,2) not null default 30.00,
    free_delivery_threshold numeric(10,2) not null default 500.00,
    is_store_open boolean not null default true,
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 7. ORDERS
-- ------------------------------------------------------------------------------
create table if not exists public.orders (
    id uuid primary key default uuid_generate_v4(),
    order_number text not null unique,
    user_id uuid not null references auth.users(id) on delete restrict,
    address_id uuid references public.addresses(id) on delete set null,
    delivery_address_snapshot jsonb not null,
    subtotal numeric(10,2) not null check (subtotal >= 0),
    discount_amount numeric(10,2) not null default 0 check (discount_amount >= 0),
    delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
    total_amount numeric(10,2) not null check (total_amount >= 0),
    payment_method text not null check (payment_method in ('upi', 'cod', 'pay_at_store')),
    payment_status text not null default 'pending' check (payment_status in ('pending', 'processing', 'paid', 'failed', 'refunded')),
    order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    upi_transaction_ref text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(order_status);
create index if not exists idx_orders_payment on public.orders(payment_status);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- ------------------------------------------------------------------------------
-- 8. ORDER ITEMS (Immutable historical snapshot)
-- ------------------------------------------------------------------------------
create table if not exists public.order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete restrict,
    product_name text not null,
    price numeric(10,2) not null check (price >= 0),
    discount_price numeric(10,2) check (discount_price is null or discount_price >= 0),
    unit_price numeric(10,2) not null check (unit_price >= 0),
    quantity integer not null check (quantity > 0),
    total_item_price numeric(10,2) not null check (total_item_price >= 0),
    unit text not null
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ------------------------------------------------------------------------------
-- 9. PAYMENT TRANSACTIONS (UPI & gateway audit log)
-- ------------------------------------------------------------------------------
create table if not exists public.payment_transactions (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references public.orders(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    gateway text not null,
    upi_vpa text,
    transaction_ref text not null,
    gateway_payment_id text,
    amount numeric(10,2) not null check (amount >= 0),
    status text not null check (status in ('pending', 'processing', 'success', 'failed', 'refunded')),
    raw_response jsonb default '{}'::jsonb,
    verified_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_payment_tx_order on public.payment_transactions(order_id);
create index if not exists idx_payment_tx_ref on public.payment_transactions(transaction_ref);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS
-- ------------------------------------------------------------------------------
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    body text not null,
    data jsonb default '{}'::jsonb,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, is_read);
