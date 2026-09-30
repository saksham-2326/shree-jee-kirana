-- ==============================================================================
-- seed.sql
-- Shree Jee Kirana - Realistic Indian General Store Seed Data
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. STORE SETTINGS
-- ------------------------------------------------------------------------------
delete from public.store_settings;
insert into public.store_settings (
    store_name,
    store_phone,
    store_address,
    upi_vpa,
    upi_merchant_name,
    cod_enabled,
    pay_at_store_enabled,
    min_order_amount,
    delivery_fee,
    free_delivery_threshold,
    is_store_open
) values (
    'Shree Jee Kirana',
    '+91 9079192291',
    'Lal Bagh, Kothariya Road, Nathdwara, Pincode 313301',
    'shreejeekirana@upi',
    'Shree Jee Kirana',
    true,
    true,
    99.00,
    30.00,
    499.00,
    true
);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES
-- ------------------------------------------------------------------------------
-- We use fixed UUIDs for categories so products can reference them cleanly
delete from public.categories;
insert into public.categories (id, name, slug, icon_url, is_active, display_order) values
('11111111-1111-1111-1111-111111111101', 'Grocery & Staples', 'grocery-staples', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&auto=format&fit=crop', true, 1),
('11111111-1111-1111-1111-111111111102', 'Snacks & Munchies', 'snacks-munchies', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=120&auto=format&fit=crop', true, 2),
('11111111-1111-1111-1111-111111111103', 'Dairy & Fresh', 'dairy-fresh', 'https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=120&auto=format&fit=crop', true, 3),
('11111111-1111-1111-1111-111111111104', 'Beverages & Tea', 'beverages-tea', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=120&auto=format&fit=crop', true, 4),
('11111111-1111-1111-1111-111111111105', 'Spices & Masalas', 'spices-masalas', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=120&auto=format&fit=crop', true, 5),
('11111111-1111-1111-1111-111111111106', 'Personal Care', 'personal-care', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop', true, 6),
('11111111-1111-1111-1111-111111111107', 'Household & Cleaning', 'household-cleaning', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=120&auto=format&fit=crop', true, 7),
('11111111-1111-1111-1111-111111111108', 'Packaged & Instant Foods', 'packaged-food', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=120&auto=format&fit=crop', true, 8),
('11111111-1111-1111-1111-111111111109', 'Bakery & Sweets', 'bakery-sweets', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&auto=format&fit=crop', true, 9),
('11111111-1111-1111-1111-111111111110', 'Pooja Essentials', 'pooja-essentials', 'https://images.unsplash.com/photo-1608096299210-db7e38487075?w=120&auto=format&fit=crop', true, 10);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS (Realistic Indian Kirana Catalog)
-- ------------------------------------------------------------------------------
delete from public.products;

-- Grocery & Staples
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111101', 'Aashirvaad Shudh Chakki Whole Wheat Atta', '100% pure wheat grain chakki fresh atta, rich in dietary fiber for soft rotis.', 'Aashirvaad', 245.00, 220.00, '5 kg pack', '5 kg', 45, ARRAY['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111101', 'Fortune Sunlite Refined Sunflower Oil', 'Light and healthy edible cooking oil enriched with Vitamin A & D.', 'Fortune', 160.00, 142.00, '1 L Pouch', '1 L', 60, ARRAY['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111101', 'India Gate Basmati Rice Feast Rozzana', 'Aromatic long grain basmati rice, perfect for everyday pulao and jeera rice.', 'India Gate', 115.00, 98.00, '1 kg pack', '1 kg', 35, ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111101', 'Tata Salt Vacuum Evaporated Iodised Salt', 'Desh ka namak, rich in iodine for mental development and purity.', 'Tata Salt', 28.00, 25.00, '1 kg pack', '1 kg', 120, ARRAY['https://images.unsplash.com/photo-1626197031507-c17099753214?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111101', 'Madhur Pure & Hygienic Refined Sugar', 'Sulphur-free clean white crystalline sugar for sweets and daily tea.', 'Madhur', 55.00, 48.00, '1 kg pack', '1 kg', 50, ARRAY['https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111101', 'Tata Sampann Unpolished Toor / Arhar Dal', 'Naturally protein-rich unpolished tur dal, cooked quickly and tastes authentic.', 'Tata Sampann', 175.00, 158.00, '1 kg pack', '1 kg', 40, ARRAY['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111101', 'Rajdhani Besan (Gram Flour)', 'Fine ground gram flour made from 100% chana dal, ideal for kadhi and pakoras.', 'Rajdhani', 58.00, 52.00, '500 g pack', '500 g', 30, ARRAY['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop'], true, false);

-- Snacks & Munchies
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111102', 'Parle-G Original Gluco Biscuits', 'The timeless golden biscuit of India, enriched with milk and wheat power.', 'Parle', 30.00, 27.00, '250 g family pack', '250 g', 90, ARRAY['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111102', 'Haldirams Nagpur Aloo Bhujia', 'Crunchy potato and gram flour namkeen spiced with mint and chilli.', 'Haldirams', 65.00, 55.00, '200 g pack', '200 g', 75, ARRAY['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111102', 'Lays India Magic Masala Potato Chips', 'Crispy ridged chips seasoned with authentic Indian chatpata spices.', 'Lays', 20.00, 18.00, '50 g pouch', '50 g', 100, ARRAY['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111102', 'Britannia Good Day Butter Cookies', 'Rich cashew and butter biscuits with a happy smile design.', 'Britannia', 40.00, 35.00, '200 g pack', '200 g', 65, ARRAY['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111102', 'Kurkure Masala Munch Crunchy Snack', 'Tedha hai par mera hai! Irresistible spicy puffed corn crunch.', 'Kurkure', 20.00, 19.00, '75 g pack', '75 g', 80, ARRAY['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop'], true, false);

-- Dairy & Fresh
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111103', 'Amul Taaza Homogenised Toned Milk', 'Nutritious pasteurized toned milk in long-life UHT tetra pack.', 'Amul', 74.00, 70.00, '1 L Tetra Pack', '1 L', 40, ARRAY['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111103', 'Amul Pasteurised Butter', 'Utterly butterly delicious salted table butter made from cow and buffalo milk.', 'Amul', 58.00, 56.00, '100 g block', '100 g', 55, ARRAY['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111103', 'Amul Pure Cow Ghee Tin', 'Traditional golden aromatic cow ghee packed with natural goodness and aroma.', 'Amul', 320.00, 295.00, '500 ml tin', '500 ml', 25, ARRAY['https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111103', 'Amul Fresh Malai Paneer', 'Soft, juicy, and rich paneer cubes, ideal for shahi paneer and tikkas.', 'Amul', 92.00, 85.00, '200 g pack', '200 g', 20, ARRAY['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop'], true, false);

-- Beverages & Tea
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111104', 'Tata Tea Gold Leaf Tea with Gentle Long Leaves', 'A rich blend of Assam CTC tea and long aroma leaves for an exquisite cup.', 'Tata Tea', 165.00, 145.00, '500 g box', '500 g', 50, ARRAY['https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111104', 'Nescafe Classic Instant Coffee Jar', '100% pure instant coffee powder with bold aroma and rich roast profile.', 'Nescafe', 185.00, 168.00, '50 g glass jar', '50 g', 30, ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111104', 'Red Bull Energy Drink Can', 'Vitalizes body and mind with premium taurine, caffeine and B vitamins.', 'Red Bull', 125.00, 115.00, '250 ml can', '250 ml', 40, ARRAY['https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111104', 'Thums Up Charged Soft Drink Bottle', 'Toofani taste with extra punch and fizzy refreshing fizz.', 'Thums Up', 40.00, 38.00, '750 ml bottle', '750 ml', 60, ARRAY['https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop'], true, false);

-- Spices & Masalas
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111105', 'MDH Deggi Mirch Powder', 'Unique blend of Kashmiri and Indian red chillies for vibrant colour and mild heat.', 'MDH', 95.00, 85.00, '100 g box', '100 g', 45, ARRAY['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111105', 'Tata Sampann Turmeric / Haldi Powder', 'With minimum 3% curcumin content for maximum health benefits and rich aroma.', 'Tata Sampann', 48.00, 42.00, '200 g pouch', '200 g', 55, ARRAY['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111105', 'Catch Coriander / Dhaniya Powder', 'Ground from top grade fresh green coriander seeds, cool fragrance.', 'Catch', 44.00, 39.00, '200 g pouch', '200 g', 50, ARRAY['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111105', 'MDH Chunky Chat Masala', 'Tangy chatpata masala sprinkle for fruit salads, sprouts, and snacks.', 'MDH', 72.00, 64.00, '100 g box', '100 g', 40, ARRAY['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop'], true, false);

-- Personal Care
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111106', 'Dettol Original Germ Protection Bathing Soap', 'Trusted antibacterial protection with distinctive classic pine fragrance.', 'Dettol', 160.00, 142.00, 'Pack of 4 (125 g each)', '500 g', 65, ARRAY['https://images.unsplash.com/photo-1607006311600-314213498877?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111106', 'Colgate Strong Teeth Dental Toothpaste', 'Amino Shakti formula for calcium boost and all-round cavity protection.', 'Colgate', 110.00, 95.00, '200 g tube', '200 g', 70, ARRAY['https://images.unsplash.com/photo-1559591937-e105e197d19c?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111106', 'Head & Shoulders Anti-Dandruff Cool Menthol Shampoo', 'Menthol freshness that cools the scalp and removes up to 100% visible dandruff.', 'Head & Shoulders', 199.00, 175.00, '180 ml bottle', '180 ml', 35, ARRAY['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&auto=format&fit=crop'], true, false);

-- Household & Cleaning
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111107', 'Surf Excel Easy Wash Detergent Powder', 'Superfine powder with power of 10 hands to lift tough collar and curry stains.', 'Surf Excel', 145.00, 128.00, '1 kg pack', '1 kg', 80, ARRAY['https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111107', 'Vim Lemon Dishwash Bar with Polycoat', 'Removes tough grease with natural lemon power without making hands rough.', 'Vim', 30.00, 27.00, '300 g bar', '300 g', 110, ARRAY['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111107', 'Lizol Citrus Disinfectant Surface Floor Cleaner', 'Kills 99.9% germs, leaves long-lasting citrus fragrance and gleaming floors.', 'Lizol', 118.00, 105.00, '500 ml bottle', '500 ml', 45, ARRAY['https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop'], true, false);

-- Packaged & Instant Foods
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111108', 'Maggi 2-Minute Masala Instant Noodles', 'Indias favorite masala noodles with authentic blend of 10 roasted spices.', 'Maggi', 60.00, 54.00, 'Pack of 4 (280 g)', '280 g', 95, ARRAY['https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop'], true, true),
('11111111-1111-1111-1111-111111111108', 'Kissan Fresh Tomato Ketchup Bottle', 'Made from 100% real ripe sun-ripened tomatoes, sweet and tangy flavor.', 'Kissan', 130.00, 115.00, '950 g glass bottle', '950 g', 35, ARRAY['https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&auto=format&fit=crop'], true, false);

-- Bakery & Sweets
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111109', 'Britannia Toastea Premium Bake Rusk', 'Crispy crunchy twice-baked tea rusk with real elaichi essence.', 'Britannia', 45.00, 40.00, '300 g pack', '300 g', 50, ARRAY['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111109', 'Cadbury Dairy Milk Silk Chocolate Bar', 'Irresistibly smooth and creamy chocolate bar that melts in your mouth.', 'Cadbury', 85.00, 78.00, '60 g bar', '60 g', 60, ARRAY['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop'], true, true);

-- Pooja Essentials
insert into public.products (category_id, name, description, brand, price, discount_price, unit, weight_quantity, stock_quantity, images, is_active, is_featured) values
('11111111-1111-1111-1111-111111111110', 'Cycle Pure Agarbathies Fragrance Incense Sticks', 'Heritage brand pooja agarbatti with serene sandalwood and floral notes.', 'Cycle', 50.00, 45.00, '120 sticks box', '120 sticks', 70, ARRAY['https://images.unsplash.com/photo-1608096299210-db7e38487075?w=600&auto=format&fit=crop'], true, false),
('11111111-1111-1111-1111-111111111110', 'Mangalam Pure Bhimseni Camphor Tablets', '100% natural organic camphor that burns completely without leaving residue.', 'Mangalam', 80.00, 72.00, '100 g tub', '100 g', 40, ARRAY['https://images.unsplash.com/photo-1608096299210-db7e38487075?w=600&auto=format&fit=crop'], true, false);
