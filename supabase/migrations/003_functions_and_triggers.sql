-- ==============================================================================
-- 003_functions_and_triggers.sql
-- Shree Jee Kirana - Business Logic, Inventory Safety & Server Payment Verification
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Automatic Profile Creation on auth.users Sign Up
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_full_name text;
    v_phone text;
begin
    v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    v_phone := coalesce(new.raw_user_meta_data->>'phone', new.phone);

    insert into public.profiles (id, full_name, phone, role)
    values (
        new.id,
        coalesce(v_full_name, 'Valued Customer'),
        v_phone,
        'customer'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. Timestamp Updater Function
-- ------------------------------------------------------------------------------
create or replace function public.trigger_set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.trigger_set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute function public.trigger_set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.trigger_set_updated_at();
create trigger set_store_settings_updated_at before update on public.store_settings for each row execute function public.trigger_set_updated_at();

-- ------------------------------------------------------------------------------
-- 3. SECURE SERVER-SIDE ORDER CREATION (Prevents client price manipulation)
-- ------------------------------------------------------------------------------
create or replace function public.create_verified_order(
    p_address_id uuid,
    p_items jsonb, -- Array of objects: [{"product_id": "...", "quantity": 1}]
    p_payment_method text,
    p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_store record;
    v_address record;
    v_order_id uuid;
    v_order_number text;
    v_upi_ref text;
    v_subtotal numeric(10,2) := 0;
    v_discount_savings numeric(10,2) := 0;
    v_delivery_fee numeric(10,2) := 0;
    v_total_amount numeric(10,2) := 0;
    v_item jsonb;
    v_prod record;
    v_qty integer;
    v_item_unit_price numeric(10,2);
    v_item_total numeric(10,2);
    v_addr_snapshot jsonb;
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'Authentication required to place an order.';
    end if;

    -- Validate payment method
    if p_payment_method not in ('upi', 'cod', 'pay_at_store') then
        raise exception 'Invalid payment method: %', p_payment_method;
    end if;

    -- Fetch store settings
    select * into v_store from public.store_settings limit 1;
    if not found or not v_store.is_store_open then
        raise exception 'The store is currently closed. Please try again during operating hours.';
    end if;

    if p_payment_method = 'cod' and not v_store.cod_enabled then
        raise exception 'Cash on Delivery is currently disabled by the store.';
    end if;
    if p_payment_method = 'pay_at_store' and not v_store.pay_at_store_enabled then
        raise exception 'Pay at Store is currently disabled.';
    end if;

    -- Fetch address
    select * into v_address from public.addresses where id = p_address_id and user_id = v_user_id;
    if not found then
        raise exception 'Delivery address not found or does not belong to you.';
    end if;

    v_addr_snapshot := jsonb_build_object(
        'full_name', v_address.full_name,
        'phone', v_address.phone,
        'house_building', v_address.house_building,
        'street_area', v_address.street_area,
        'landmark', v_address.landmark,
        'city', v_address.city,
        'state', v_address.state,
        'pincode', v_address.pincode,
        'delivery_instructions', v_address.delivery_instructions
    );

    if jsonb_array_length(p_items) = 0 then
        raise exception 'Order must contain at least one item.';
    end if;

    -- Generate Order Number & UPI Ref
    v_order_number := 'SJK-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text), 1, 6));
    v_upi_ref := 'SJKTXN' || extract(epoch from now())::bigint || upper(substring(md5(random()::text), 1, 4));

    -- Calculate Totals & Validate Stock atomically
    for v_item in select * from jsonb_array_elements(p_items)
    loop
        v_qty := (v_item->>'quantity')::integer;
        if v_qty <= 0 then
            raise exception 'Invalid quantity for item.';
        end if;

        -- Lock product row for safe stock checking
        select * into v_prod from public.products where id = (v_item->>'product_id')::uuid for update;
        if not found then
            raise exception 'Product % not found.', v_item->>'product_id';
        end if;
        if not v_prod.is_active then
            raise exception 'Product "%" is currently unavailable.', v_prod.name;
        end if;
        if v_prod.stock_quantity < v_qty then
            raise exception 'Insufficient stock for "%". Available: %, requested: %.', v_prod.name, v_prod.stock_quantity, v_qty;
        end if;

        v_item_unit_price := coalesce(v_prod.discount_price, v_prod.price);
        v_item_total := round(v_item_unit_price * v_qty, 2);
        v_subtotal := v_subtotal + v_item_total;

        if v_prod.discount_price is not null then
            v_discount_savings := v_discount_savings + round((v_prod.price - v_prod.discount_price) * v_qty, 2);
        end if;
    end loop;

    -- Check minimum order amount
    if v_subtotal < v_store.min_order_amount then
        raise exception 'Order subtotal (₹%) is below store minimum of ₹%.', v_subtotal, v_store.min_order_amount;
    end if;

    -- Calculate delivery fee
    if v_subtotal >= v_store.free_delivery_threshold then
        v_delivery_fee := 0.00;
    else
        v_delivery_fee := v_store.delivery_fee;
    end if;

    v_total_amount := v_subtotal + v_delivery_fee;

    -- Insert Order
    insert into public.orders (
        order_number,
        user_id,
        address_id,
        delivery_address_snapshot,
        subtotal,
        discount_amount,
        delivery_fee,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        upi_transaction_ref,
        notes
    ) values (
        v_order_number,
        v_user_id,
        p_address_id,
        v_addr_snapshot,
        v_subtotal,
        v_discount_savings,
        v_delivery_fee,
        v_total_amount,
        p_payment_method,
        case when p_payment_method = 'upi' then 'pending' else 'pending' end,
        case when p_payment_method in ('cod', 'pay_at_store') then 'confirmed' else 'pending' end,
        v_upi_ref,
        p_notes
    ) returning id into v_order_id;

    -- Insert Order Items
    for v_item in select * from jsonb_array_elements(p_items)
    loop
        v_qty := (v_item->>'quantity')::integer;
        select * into v_prod from public.products where id = (v_item->>'product_id')::uuid;
        v_item_unit_price := coalesce(v_prod.discount_price, v_prod.price);
        v_item_total := round(v_item_unit_price * v_qty, 2);

        insert into public.order_items (
            order_id,
            product_id,
            product_name,
            price,
            discount_price,
            unit_price,
            quantity,
            total_item_price,
            unit
        ) values (
            v_order_id,
            v_prod.id,
            v_prod.name,
            v_prod.price,
            v_prod.discount_price,
            v_item_unit_price,
            v_qty,
            v_item_total,
            v_prod.unit
        );

        -- If COD or Pay at Store, deduct inventory immediately
        if p_payment_method in ('cod', 'pay_at_store') then
            update public.products
            set stock_quantity = stock_quantity - v_qty
            where id = v_prod.id;
        end if;
    end loop;

    -- Clear user's cart
    delete from public.cart_items where user_id = v_user_id;

    -- Create notification
    insert into public.notifications (user_id, title, body, data)
    values (
        v_user_id,
        'Order Received: ' || v_order_number,
        case 
            when p_payment_method = 'upi' then 'Please complete your UPI payment of ₹' || v_total_amount || ' to confirm your order.'
            else 'Your order of ₹' || v_total_amount || ' has been confirmed!'
        end,
        jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number)
    );

    return jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'subtotal', v_subtotal,
        'discount_amount', v_discount_savings,
        'delivery_fee', v_delivery_fee,
        'total_amount', v_total_amount,
        'upi_transaction_ref', v_upi_ref,
        'upi_vpa', v_store.upi_vpa,
        'upi_merchant_name', v_store.upi_merchant_name,
        'payment_method', p_payment_method,
        'order_status', case when p_payment_method in ('cod', 'pay_at_store') then 'confirmed' else 'pending' end
    );
end;
$$;

-- ------------------------------------------------------------------------------
-- 4. VERIFY AND COMPLETE PAYMENT (Atomic inventory lock & status confirmation)
-- ------------------------------------------------------------------------------
create or replace function public.verify_and_complete_payment(
    p_order_id uuid,
    p_transaction_ref text,
    p_gateway text,
    p_gateway_payment_id text default null,
    p_raw_response jsonb default '{}'::jsonb,
    p_is_success boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_order record;
    v_item record;
begin
    -- Lock order
    select * into v_order from public.orders where id = p_order_id for update;
    if not found then
        raise exception 'Order % not found.', p_order_id;
    end if;

    if v_order.payment_status = 'paid' then
        return jsonb_build_object('success', true, 'message', 'Order is already marked as paid.', 'order_id', p_order_id);
    end if;

    -- Record transaction
    insert into public.payment_transactions (
        order_id,
        user_id,
        gateway,
        upi_vpa,
        transaction_ref,
        gateway_payment_id,
        amount,
        status,
        raw_response,
        verified_at
    ) values (
        v_order.id,
        v_order.user_id,
        p_gateway,
        p_raw_response->>'vpa',
        p_transaction_ref,
        p_gateway_payment_id,
        v_order.total_amount,
        case when p_is_success then 'success' else 'failed' end,
        p_raw_response,
        case when p_is_success then now() else null end
    );

    if p_is_success then
        -- Deduct inventory for all items
        for v_item in select * from public.order_items where order_id = v_order.id
        loop
            update public.products
            set stock_quantity = greatest(0, stock_quantity - v_item.quantity)
            where id = v_item.product_id;
        end loop;

        -- Update order status
        update public.orders
        set payment_status = 'paid',
            order_status = 'confirmed',
            upi_transaction_ref = p_transaction_ref,
            updated_at = now()
        where id = v_order.id;

        -- Notify customer
        insert into public.notifications (user_id, title, body, data)
        values (
            v_order.user_id,
            'Payment Verified! Order Confirmed',
            'Your payment of ₹' || v_order.total_amount || ' for order ' || v_order.order_number || ' is confirmed. We are packing your items!',
            jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number)
        );

        return jsonb_build_object(
            'success', true,
            'order_id', v_order.id,
            'order_number', v_order.order_number,
            'payment_status', 'paid',
            'order_status', 'confirmed'
        );
    else
        update public.orders
        set payment_status = 'failed',
            updated_at = now()
        where id = v_order.id;

        insert into public.notifications (user_id, title, body, data)
        values (
            v_order.user_id,
            'Payment Failed',
            'Your UPI payment for order ' || v_order.order_number || ' was not successful. You can retry from your orders page.',
            jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number)
        );

        return jsonb_build_object(
            'success', false,
            'order_id', v_order.id,
            'payment_status', 'failed'
        );
    end if;
end;
$$;

-- ------------------------------------------------------------------------------
-- 5. ADMIN ORDER STATUS UPDATER WITH RESTOCKING ON CANCELLATION
-- ------------------------------------------------------------------------------
create or replace function public.admin_update_order_status(
    p_order_id uuid,
    p_new_status text,
    p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_order record;
    v_item record;
    v_msg text;
begin
    if not public.is_admin() then
        raise exception 'Only administrators can perform this action.';
    end if;

    select * into v_order from public.orders where id = p_order_id for update;
    if not found then
        raise exception 'Order % not found.', p_order_id;
    end if;

    -- If cancelling a confirmed/paid order, restore stock
    if p_new_status = 'cancelled' and v_order.order_status not in ('cancelled') then
        if v_order.payment_status = 'paid' or v_order.payment_method in ('cod', 'pay_at_store') then
            for v_item in select * from public.order_items where order_id = v_order.id
            loop
                update public.products
                set stock_quantity = stock_quantity + v_item.quantity
                where id = v_item.product_id;
            end loop;
        end if;
    end if;

    update public.orders
    set order_status = p_new_status,
        notes = coalesce(p_notes, notes),
        updated_at = now()
    where id = p_order_id;

    -- Select appropriate customer message
    case p_new_status
        when 'confirmed' then v_msg := 'Your order has been confirmed by Shree Jee Kirana.';
        when 'preparing' then v_msg := 'Good news! Your items are currently being hand-picked and packed.';
        when 'out_for_delivery' then v_msg := 'Your order is out for delivery! Our delivery partner will arrive shortly.';
        when 'delivered' then v_msg := 'Your order has been delivered. Thank you for shopping with Shree Jee Kirana!';
        when 'cancelled' then v_msg := 'Your order has been cancelled.' || coalesce(' Reason: ' || p_notes, '');
        else v_msg := 'Order status updated to: ' || p_new_status;
    end case;

    insert into public.notifications (user_id, title, body, data)
    values (
        v_order.user_id,
        'Order ' || v_order.order_number || ': ' || initcap(replace(p_new_status, '_', ' ')),
        v_msg,
        jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number, 'new_status', p_new_status)
    );

    return jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'order_status', p_new_status
    );
end;
$$;
