-- ==============================================================================
-- 002_rls_policies.sql
-- Shree Jee Kirana - Complete Row Level Security (RLS) & Access Control
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Helper function to check if current authenticated user is an Admin
-- ------------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------------------------------------
-- Enable RLS on all tables
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.notifications enable row level security;

-- ------------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ------------------------------------------------------------------------------
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id or public.is_admin());

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id or public.is_admin())
    with check (
        auth.uid() = id 
        -- Prevent privilege escalation: non-admins cannot change their role to 'admin'
        and (case when not public.is_admin() then role = 'customer' else true end)
    );

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES POLICIES
-- ------------------------------------------------------------------------------
create policy "Anyone can view active categories"
    on public.categories for select
    using (is_active = true or public.is_admin());

create policy "Admins can manage categories"
    on public.categories for all
    using (public.is_admin())
    with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS POLICIES
-- ------------------------------------------------------------------------------
create policy "Anyone can view active products"
    on public.products for select
    using (is_active = true or public.is_admin());

create policy "Admins can manage products"
    on public.products for all
    using (public.is_admin())
    with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. ADDRESSES POLICIES
-- ------------------------------------------------------------------------------
create policy "Users can view own addresses"
    on public.addresses for select
    using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own addresses"
    on public.addresses for insert
    with check (auth.uid() = user_id);

create policy "Users can update own addresses"
    on public.addresses for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own addresses"
    on public.addresses for delete
    using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. CART ITEMS POLICIES
-- ------------------------------------------------------------------------------
create policy "Users can manage own cart items"
    on public.cart_items for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. STORE SETTINGS POLICIES
-- ------------------------------------------------------------------------------
create policy "Anyone can read store settings"
    on public.store_settings for select
    using (true);

create policy "Admins can update store settings"
    on public.store_settings for update
    using (public.is_admin())
    with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. ORDERS POLICIES
-- ------------------------------------------------------------------------------
create policy "Users can view own orders"
    on public.orders for select
    using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert pending orders"
    on public.orders for insert
    with check (
        auth.uid() = user_id 
        and order_status = 'pending'
        and payment_status in ('pending', 'processing')
    );

create policy "Admins can update any order"
    on public.orders for update
    using (public.is_admin())
    with check (public.is_admin());

create policy "Users can cancel their pending orders"
    on public.orders for update
    using (auth.uid() = user_id and order_status = 'pending')
    with check (order_status = 'cancelled');

-- ------------------------------------------------------------------------------
-- 8. ORDER ITEMS POLICIES
-- ------------------------------------------------------------------------------
create policy "Users can view items in own orders"
    on public.order_items for select
    using (
        exists (
            select 1 from public.orders
            where orders.id = order_items.order_id
            and (orders.user_id = auth.uid() or public.is_admin())
        )
    );

create policy "Users can insert items for own pending orders"
    on public.order_items for insert
    with check (
        exists (
            select 1 from public.orders
            where orders.id = order_items.order_id
            and orders.user_id = auth.uid()
            and orders.order_status = 'pending'
        )
    );

-- ------------------------------------------------------------------------------
-- 9. PAYMENT TRANSACTIONS POLICIES
-- ------------------------------------------------------------------------------
create policy "Users can view own payment transactions"
    on public.payment_transactions for select
    using (auth.uid() = user_id or public.is_admin());

create policy "Authenticated users can insert payment transactions for own orders"
    on public.payment_transactions for insert
    with check (auth.uid() = user_id);

create policy "Admins can manage payment transactions"
    on public.payment_transactions for all
    using (public.is_admin())
    with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
create policy "Users can view own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

create policy "Users can update read status of own notifications"
    on public.notifications for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Admins can insert store notifications"
    on public.notifications for insert
    with check (public.is_admin());
