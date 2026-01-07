DO $$
DECLARE
    -- Category IDs
    cat_bags uuid := gen_random_uuid();
    cat_apparel uuid := gen_random_uuid();
    cat_footwear uuid := gen_random_uuid();
    cat_electronics uuid := gen_random_uuid();
    cat_home uuid := gen_random_uuid();

  -- Subcategory IDs
  -- Bags
  cat_bags_backpacks uuid := gen_random_uuid();
  cat_bags_totes uuid := gen_random_uuid();
  cat_bags_organizers uuid := gen_random_uuid();
  cat_bags_sleeves uuid := gen_random_uuid();
  -- Apparel
  cat_apparel_tshirts uuid := gen_random_uuid();
  cat_apparel_hoodies uuid := gen_random_uuid();
  cat_apparel_hats uuid := gen_random_uuid();
  cat_apparel_pants uuid := gen_random_uuid();
  -- Footwear
  cat_footwear_sneakers uuid := gen_random_uuid();
  cat_footwear_boots uuid := gen_random_uuid();
  cat_footwear_slipons uuid := gen_random_uuid();
  -- Electronics
  cat_elec_headphones uuid := gen_random_uuid();
  cat_elec_earbuds uuid := gen_random_uuid();
  cat_elec_key_mouse uuid := gen_random_uuid();
  cat_elec_stands uuid := gen_random_uuid();
  -- Home & Workspace
  cat_home_drinkware uuid := gen_random_uuid();
  cat_home_pillow uuid := gen_random_uuid();
  cat_home_planters uuid := gen_random_uuid();
  cat_home_lighting uuid := gen_random_uuid();

    -- Seller IDs
    seller_1 uuid := gen_random_uuid();
    seller_2 uuid := gen_random_uuid();
    seller_3 uuid := gen_random_uuid();
    seller_4 uuid := gen_random_uuid();
    seller_5 uuid := gen_random_uuid();

    -- Product IDs
    -- BAGS (1-5)
    p_bag_1 uuid := gen_random_uuid(); p_bag_2 uuid := gen_random_uuid(); p_bag_3 uuid := gen_random_uuid(); p_bag_4 uuid := gen_random_uuid(); p_bag_5 uuid := gen_random_uuid();
    -- APPAREL (6-10)
    p_app_1 uuid := gen_random_uuid(); p_app_2 uuid := gen_random_uuid(); p_app_3 uuid := gen_random_uuid(); p_app_4 uuid := gen_random_uuid(); p_app_5 uuid := gen_random_uuid();
    -- FOOTWEAR (11-15)
    p_foot_1 uuid := gen_random_uuid(); p_foot_2 uuid := gen_random_uuid(); p_foot_3 uuid := gen_random_uuid(); p_foot_4 uuid := gen_random_uuid(); p_foot_5 uuid := gen_random_uuid();
    -- ELECTRONICS (16-20)
    p_elec_1 uuid := gen_random_uuid(); p_elec_2 uuid := gen_random_uuid(); p_elec_3 uuid := gen_random_uuid(); p_elec_4 uuid := gen_random_uuid(); p_elec_5 uuid := gen_random_uuid();
    -- HOME (21-25)
    p_home_1 uuid := gen_random_uuid(); p_home_2 uuid := gen_random_uuid(); p_home_3 uuid := gen_random_uuid(); p_home_4 uuid := gen_random_uuid(); p_home_5 uuid := gen_random_uuid();

BEGIN
    ---------------------------------------------------------------------------
    -- 1. INSERT CATEGORIES
    ---------------------------------------------------------------------------
    INSERT INTO public.categories (id, name, parent_id) VALUES
    (cat_bags, 'Bags & Accessories', NULL),
    (cat_apparel, 'Apparel & Clothing', NULL),
    (cat_footwear, 'Footwear & Shoes', NULL),
    (cat_electronics, 'Electronics & Audio', NULL),
    (cat_home, 'Home & Workspace', NULL);

    -- 1.1 INSERT SUBCATEGORIES
    INSERT INTO public.categories (id, name, parent_id) VALUES
    -- Bags
    (cat_bags_backpacks, 'Backpacks', cat_bags),
    (cat_bags_totes, 'Totes & Duffles', cat_bags),
    (cat_bags_organizers, 'Tech Organizers', cat_bags),
    (cat_bags_sleeves, 'Sleeves & Cases', cat_bags),
    -- Apparel
    (cat_apparel_tshirts, 'T-Shirts', cat_apparel),
    (cat_apparel_hoodies, 'Hoodies & Sweatshirts', cat_apparel),
    (cat_apparel_hats, 'Hats & Accessories', cat_apparel),
    (cat_apparel_pants, 'Pants & Joggers', cat_apparel),
    -- Footwear
    (cat_footwear_sneakers, 'Sneakers & Runners', cat_footwear),
    (cat_footwear_boots, 'Boots', cat_footwear),
    (cat_footwear_slipons, 'Slip-Ons & Slides', cat_footwear),
    -- Electronics
    (cat_elec_headphones, 'Headphones', cat_electronics),
    (cat_elec_earbuds, 'Earbuds', cat_electronics),
    (cat_elec_key_mouse, 'Keyboards & Mice', cat_electronics),
    (cat_elec_stands, 'Stands & Accessories', cat_electronics),
    -- Home & Workspace
    (cat_home_drinkware, 'Drinkware', cat_home),
    (cat_home_pillow, 'Bedding & Cushions', cat_home),
    (cat_home_planters, 'Planters', cat_home),
    (cat_home_lighting, 'Lighting', cat_home);

    ---------------------------------------------------------------------------
    -- 2. INSERT SELLERS (Added avatar_url)
    ---------------------------------------------------------------------------
    INSERT INTO public.users (id, full_name, email, hashed_password, address, role, is_verified, rating_points) VALUES
    (seller_1, 'Sarah Chen', 'sarah.c@example.com', 'hashed_pass_123', '123 Market St, San Francisco, CA', 'seller', true, 150),
    (seller_2, 'Marcus Rodriguez', 'm.rodriguez@example.com', 'hashed_pass_123', '456 Broadway, New York, NY', 'seller', true, 89),
    (seller_3, 'Emma Wilson', 'emma.w@example.com', 'hashed_pass_123', '789 Oxford St, London, UK', 'seller', true, 210),
    (seller_4, 'David Kim', 'kim.david@example.com', 'hashed_pass_123', '321 Gangnam, Seoul, KR', 'seller', true, 45),
    (seller_5, 'James Carter', 'j.carter@example.com', 'hashed_pass_123', '654 Main St, Austin, TX', 'seller', true, 300);

    ---------------------------------------------------------------------------
    -- 3. INSERT PRODUCTS & IMAGES (Batch 1: BAGS)
    ---------------------------------------------------------------------------
    
    -- Product 1: Everyday Zip Tote (Images: 1-4 Filled)
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_bag_1, seller_1, cat_bags_totes, 'Everyday Zip Tote', 'The perfect everyday tote. Made from durable 100% cotton canvas with a secure zip closure.', 800000.00, 50000.00, 1500000.00, NOW(), NOW() + INTERVAL '10 days', 'active', true, true, 800000.00,
    '[{"name": "Materials", "features": [{"name": "Body", "description": "100% Cotton Canvas"}, {"name": "Strap", "description": "Poly-cotton blend"}]}, {"name": "Dimensions", "features": [{"name": "Size", "description": "15in x 12in x 5in"}]}]'::jsonb);
    
    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES (p_bag_1, 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-03-product-01.jpg', true, 1), (p_bag_1, 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-03-product-02.jpg', false, 2), (p_bag_1, 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-03-product-03.jpg', false, 3), (p_bag_1, 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-03-product-04.jpg', false, 4);

    -- Product 2: Nomad Travel Backpack (Images: 5-8 Filled)
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_bag_2, seller_2, cat_bags_backpacks, 'Nomad Travel Backpack', 'Built for the journey. Water-resistant nylon, 25L capacity, and a dedicated 16-inch laptop compartment.', 1200000.00, 100000.00, 2200000.00, NOW(), NOW() + INTERVAL '12 days', 'active', true, true, 1200000.00,
    '[{"name": "Features", "features": [{"name": "Laptop Sleeve", "description": "Fits up to 16-inch"}, {"name": "Waterproof", "description": "Yes"}]}, {"name": "Capacity", "features": [{"name": "Volume", "description": "25 Liters"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_bag_2, 'https://plus.unsplash.com/premium_photo-1678481760835-a49a3f85a83b?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0', true, 1),
    (p_bag_2, 'https://plus.unsplash.com/premium_photo-1678481760751-653d4b5f4077?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0', false, 2),
    (p_bag_2, 'https://plus.unsplash.com/premium_photo-1678481760839-84f7a1607180?q=80&w=403&auto=format&fit=crop&ixlib=rb-4.1.0', false, 3),
    (p_bag_2, 'https://plus.unsplash.com/premium_photo-1678481760825-6f2b221921d9?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0', false, 4);

    -- Product 3: Heritage Leather Duffle (Images: 9-12 Filled)
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_bag_3, seller_3, cat_bags_totes, 'Heritage Leather Duffle', 'Full-grain leather weekender bag. Ages beautifully with time.', 2500000.00, 200000.00, 4500000.00, NOW(), NOW() + INTERVAL '9 days', 'active', false, true, 2600000.00,
    '[{"name": "Material", "features": [{"name": "Leather", "description": "Full-grain Italian"}]}, {"name": "Origin", "features": [{"name": "Made In", "description": "Florence, Italy"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_bag_3, 'https://images.unsplash.com/photo-1732613838153-00dbc88adbb4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D', true, 1),
    (p_bag_3, 'https://images.unsplash.com/photo-1732613842478-8a61050fe18e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEzfHx8ZW58MHx8fHx8', false, 2),
    (p_bag_3, 'https://images.unsplash.com/photo-1732613842353-0fccc5b72d51?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D', false, 3),
    (p_bag_3, 'https://images.unsplash.com/photo-1732613838357-b6f6931cdb97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D', false, 4);

    -- Product 4: Tech Organizer Pouch (Images: 13-16 Filled)
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_bag_4, seller_4, cat_bags_organizers, 'Tech Organizer Pouch', 'Keep your cables, chargers, and drives organized.', 350000.00, 20000.00, 600000.00, NOW(), NOW() + INTERVAL '14 days', 'active', true, true, 350000.00, '[{"name": "Storage", "features": [{"name": "Loops", "description": "10 Elastic Loops"}, {"name": "Pockets", "description": "2 Mesh Pockets"}]}, {"name": "Size", "features": [{"name": "Dimensions", "description": "9in x 6in"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_bag_4, 'https://plus.unsplash.com/premium_photo-1732730224660-df4778693966?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8VGVjaCUyME9yZ2FuaXplciUyMFBvdWNofGVufDB8fDB8fHww', true, 1),
    (p_bag_4, 'https://plus.unsplash.com/premium_photo-1732730224346-ba54104a5431?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 2),
    (p_bag_4, 'https://plus.unsplash.com/premium_photo-1732730224748-f25e801ce6cf?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1pbi1zYW1lLXNlcmllc3w0fHx8ZW58MHx8fHx8', false, 3),
    (p_bag_4, 'https://plus.unsplash.com/premium_photo-1732730224444-83c205e77145?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fFRlY2glMjBPcmdhbml6ZXIlMjBQb3VjaHxlbnwwfHwwfHx8MA%3D%3D', false, 4);

    -- Product 5: Minimalist Laptop Sleeve (Images: 17-20 Filled)
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_bag_5, seller_5, cat_bags_sleeves, 'Minimalist Laptop Sleeve', 'Fits 13-14 inch laptops. Wool felt construction.', 450000.00, 50000.00, 800000.00, NOW(), NOW() + INTERVAL '7 days', 'active', true, true, 450000.00, '[{"name": "Compatibility", "features": [{"name": "Device", "description": "MacBook Pro 14-inch"}, {"name": "Fit", "description": "Snug fit"}]}, {"name": "Material", "features": [{"name": "Fabric", "description": "Merino Wool Felt"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_bag_5, 'https://images.unsplash.com/photo-1689757855413-9e366c2011f1?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, 1),
    (p_bag_5, 'https://images.unsplash.com/photo-1607582278079-ac14e6fb064c?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 2),
    (p_bag_5, 'https://images.unsplash.com/photo-1689757875266-66446af145dc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D', false, 3),
    (p_bag_5, 'https://images.unsplash.com/photo-1607582278043-57198ac8da43?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 4);


    ---------------------------------------------------------------------------
    -- 4. INSERT PRODUCTS & IMAGES (Batch 2: APPAREL)
    ---------------------------------------------------------------------------

    -- Product 6: Essential Cotton Tee (Images: 21-24 Filled)
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_app_1, seller_1, cat_apparel_tshirts, 'Essential Cotton Tee - Black', 'The perfect t-shirt. 100% organic cotton.', 250000.00, 20000.00, 450000.00, NOW(), NOW() + INTERVAL '11 days', 'active', true, true, 250000.00,
    '[{"name": "Fit", "features": [{"name": "Type", "description": "Regular Fit"}]}, {"name": "Fabric", "features": [{"name": "Material", "description": "Organic Cotton"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_app_1, 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-featured-product-shot.jpg', true, 1),
    (p_app_1, 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-product-shot-01.jpg', false, 2),
    (p_app_1, 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-product-shot-02.jpg', false, 3),
    (p_app_1, 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg', false, 4);

    -- Product 7: Signature Pullover Hoodie (Images: 25-28 Filled)
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_app_2, seller_3, cat_apparel_hoodies, 'Signature Pullover Hoodie', 'Heavyweight french terry fleece.', 750000.00, 50000.00, 1100000.00, NOW(), NOW() + INTERVAL '13 days', 'active', true, true, 750000.00, '[{"name": "Warmth", "features": [{"name": "Material", "description": "French Terry Fleece"}, {"name": "Hood", "description": "Double-lined"}]}, {"name": "Care", "features": [{"name": "Instructions", "description": "Wash cold, hang dry"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_app_2, 'https://images.unsplash.com/photo-1738486260184-5b091fd0e90b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDd8fHxlbnwwfHx8fHw%3D', true, 1),
    (p_app_2, 'https://images.unsplash.com/photo-1738486260120-983c44c7703a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D', false, 2),
    (p_app_2, 'https://images.unsplash.com/photo-1738486260122-b696482eaddc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D', false, 3),
    (p_app_2, 'https://images.unsplash.com/photo-1738486260590-23c954cf29b8?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 4);

    -- Product 8: Urban Crewneck Sweatshirt (Images: 29-32 Filled)
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_app_3, seller_2, cat_apparel_hoodies, 'Urban Crewneck Sweatshirt', 'A classic silhouette modernized.', 600000.00, 50000.00, 950000.00, NOW(), NOW() + INTERVAL '8 days', 'active', true, true, 650000.00, '[{"name": "Style", "features": [{"name": "Collar", "description": "Ribbed Crewneck"}]}, {"name": "Fabric", "features": [{"name": "Blend", "description": "80% Cotton / 20% Poly"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_app_3, 'https://plus.unsplash.com/premium_photo-1689327920844-fdaf6e7dd76d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D', true, 1),
    (p_app_3, 'https://plus.unsplash.com/premium_photo-1689327920765-7cd33bde6e56?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 2),
    (p_app_3, 'https://plus.unsplash.com/premium_photo-1689327920655-52e42cf05219?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 3),
    (p_app_3, 'https://plus.unsplash.com/premium_photo-1689327920831-a4024422b4ef?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D', false, 4);

    -- Product 9: 5-Panel Performance Cap (Images: 33-36 Filled)
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_app_4, seller_5, cat_apparel_hats, '5-Panel Performance Cap', 'Lightweight nylon construction.', 280000.00, 20000.00, 450000.00, NOW(), NOW() + INTERVAL '14 days', 'active', true, true, 280000.00, '[{"name": "Features", "features": [{"name": "Fabric", "description": "Quick-dry Nylon"}, {"name": "Closure", "description": "Adjustable Clip"}]}, {"name": "Size", "features": [{"name": "Fit", "description": "One size fits most"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_app_4, 'https://images.unsplash.com/photo-1651325715667-37e773724c91?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, 1),
    (p_app_4, 'https://images.unsplash.com/photo-1651325715755-c2431cf5a0b9?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 2),
    (p_app_4, 'https://images.unsplash.com/photo-1651325716419-d7bf21e98a45?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 3),
    (p_app_4, 'https://images.unsplash.com/photo-1651325715671-954d66a15b89?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 4);

    -- Product 10: Relaxed Fit Joggers
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_app_5, seller_4, cat_apparel_pants, 'Relaxed Fit Joggers', 'Ultimate comfort. Tapered leg.', 550000.00, 50000.00, 850000.00, NOW(), NOW() + INTERVAL '9 days', 'active', true, true, 600000.00, '[{"name": "Fit Guide", "features": [{"name": "Leg", "description": "Tapered with Cuffs"}, {"name": "Waist", "description": "Elastic with Drawstring"}]}, {"name": "Pockets", "features": [{"name": "Count", "description": "3 Pockets (2 side, 1 back)"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_app_5, 'https://images.unsplash.com/photo-1763499390126-d431dcb095bc?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, 1), (p_app_5, 'https://images.unsplash.com/photo-1763499390110-8221cb9cc28f?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 2), (p_app_5, 'https://images.unsplash.com/photo-1763499390053-c7067878efd6?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 3), (p_app_5, 'https://unsplash.com/photos/woman-wearing-a-white-tank-top-and-green-pants-cQ0V_rgeMbA', false, 4);

    ---------------------------------------------------------------------------
    -- 5. INSERT PRODUCTS & IMAGES (Batch 3: FOOTWEAR)
    ---------------------------------------------------------------------------

    -- Product 11: City White Low-Tops
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_foot_1, seller_1, cat_footwear_sneakers, 'City White Low-Tops', 'Minimalist leather sneakers.', 1100000.00, 100000.00, 1800000.00, NOW(), NOW() + INTERVAL '10 days', 'active', true, true, 1100000.00,
    '[{"name": "Composition", "features": [{"name": "Upper", "description": "Leather"}, {"name": "Sole", "description": "Rubber"}]}, {"name": "Fit", "features": [{"name": "Size", "description": "True to size"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_foot_1, 'https://plus.unsplash.com/premium_photo-1728664899523-01ce1164da74?q=80&w=1047&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, 1), (p_foot_1, 'https://plus.unsplash.com/premium_photo-1728664897494-6ee88aacee96?q=80&w=486&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 2), (p_foot_1, 'https://plus.unsplash.com/premium_photo-1728664899764-4131241aa49d?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 3), (p_foot_1, 'https://plus.unsplash.com/premium_photo-1728664898233-ad366f4cb584?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 4);

    -- Product 12: All-Terrain Trail Runners
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_foot_2, seller_2, cat_footwear_sneakers, 'All-Terrain Trail Runners', 'Designed for the elements.', 1300000.00, 100000.00, 1950000.00, NOW(), NOW() + INTERVAL '14 days', 'active', true, true, 1300000.00, '[{"name": "Tech", "features": [{"name": "Membrane", "description": "Gore-Tex Waterproof"}, {"name": "Grip", "description": "Vibram Megagrip"}]}, {"name": "Drop", "features": [{"name": "Heel-to-Toe", "description": "8mm"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_foot_2, 'https://images.unsplash.com/photo-1698732644440-c52c85340605?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, 1), (p_foot_2, 'https://images.unsplash.com/photo-1698732644723-1afeb8aac964?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 2), (p_foot_2, 'https://plus.unsplash.com/premium_photo-1663054418461-19b342c3749c?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 3), (p_foot_2, 'https://images.unsplash.com/photo-1723375386110-729a0612ab99?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 4);

    -- Product 13: Heritage Leather Boots
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_foot_3, seller_3, cat_footwear_boots, 'Heritage Leather Boots', 'Goodyear welted construction.', 1800000.00, 150000.00, 2900000.00, NOW(), NOW() + INTERVAL '12 days', 'active', false, true, 2000000.00, '[{"name": "Construction", "features": [{"name": "Method", "description": "Goodyear Welted"}, {"name": "Resoleable", "description": "Yes"}]}, {"name": "Leather", "features": [{"name": "Type", "description": "Horween Chromexcel"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_foot_3, 'https://plus.unsplash.com/premium_photo-1744492015000-7d6ab1e42bda?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, 1), (p_foot_3, 'https://plus.unsplash.com/premium_photo-1744492013902-ebcab18175e4?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 2), (p_foot_3, 'https://plus.unsplash.com/premium_photo-1744492014859-a7a51b420ad1?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 3), (p_foot_3, 'https://plus.unsplash.com/premium_photo-1744492020747-c3b0eaabba24?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', false, 4);

    -- Product 14: Classic Canvas Slip-Ons
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_foot_4, seller_4, cat_footwear_slipons, 'Classic Canvas Slip-Ons', 'Easy summer style.', 400000.00, 20000.00, 650000.00, NOW(), NOW() + INTERVAL '8 days', 'active', true, true, 420000.00, '[{"name": "Materials", "features": [{"name": "Upper", "description": "10 oz Canvas"}, {"name": "Sole", "description": "Waffle Rubber"}]}, {"name": "Pattern", "features": [{"name": "Style", "description": "Checkerboard"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_foot_4, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/140/774/products/1-fe288f22-ac21-46c3-a987-cbf879f4d117.jpg?v=1741086581583', true, 1), (p_foot_4, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/140/774/products/2-fd6abd86-1497-4df6-9a9a-606a1edc3eb6.jpg?v=1741086582560', false, 2), (p_foot_4, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/140/774/products/3-4de72a3e-d6e9-413c-a24f-e0df5b647684.jpg?v=1741086583383', false, 3), (p_foot_4, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/140/774/products/4-d32d9c67-c1ac-41d0-a89c-35ec00030cce.jpg?v=1741086584377', false, 4);

    -- Product 15: Post-Workout Slides
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_foot_5, seller_5, cat_footwear_slipons, 'Post-Workout Slides', 'Cloud-like foam cushioning.', 300000.00, 10000.00, 500000.00, NOW(), NOW() + INTERVAL '7 days', 'active', true, true, 300000.00, '[{"name": "Comfort", "features": [{"name": "Foam", "description": "EVA Recovery Foam"}, {"name": "Arch", "description": "High Support"}]}, {"name": "Use", "features": [{"name": "Best For", "description": "Post-Run / Gym"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_foot_5, 'https://assets.footlocker.com/is/image/FLDM/V4484602_01?fmt=webp-alpha&bfc=on&wid=500&hei=500', true, 1), (p_foot_5, 'https://assets.footlocker.com/is/image/FLDM/V4484602_04?fmt=webp-alpha&bfc=on&wid=500&hei=500', false, 2), (p_foot_5, 'https://assets.footlocker.com/is/image/FLDM/V4484602_05?fmt=webp-alpha&bfc=on&wid=500&hei=500', false, 3), (p_foot_5, 'https://assets.footlocker.com/is/image/FLDM/V4484602_06?fmt=webp-alpha&bfc=on&wid=500&hei=500', false, 4);

    ---------------------------------------------------------------------------
    -- 6. INSERT PRODUCTS & IMAGES (Batch 4: ELECTRONICS)
    ---------------------------------------------------------------------------

    -- Product 16: Pro Noise Cancelling Headphones
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_elec_1, seller_4, cat_elec_headphones, 'Pro Noise Cancelling Headphones', 'Industry-leading ANC technology.', 2000000.00, 200000.00, 3500000.00, NOW(), NOW() + INTERVAL '12 days', 'active', true, true, 2000000.00,
    '[{"name": "Technical", "features": [{"name": "Driver", "description": "40mm"}, {"name": "Impedance", "description": "32 Ohm"}]}, {"name": "Battery", "features": [{"name": "Life", "description": "30 Hours"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_elec_1, 'https://songlongmedia.com/media/product/3574_sony_wh_1000xm5_like_new_songlongmedia__1_.jpg', true, 1), (p_elec_1, 'https://songlongmedia.com/media/product/3574_sony_wh_1000xm5_like_new_songlongmedia__2_.jpg', false, 2), (p_elec_1, 'https://songlongmedia.com/media/product/3574_sony_wh_1000xm5_like_new_songlongmedia__3_.jpg', false, 3), (p_elec_1, 'https://songlongmedia.com/media/product/3574_sony_wh_1000xm5_like_new_songlongmedia__4_.jpg', false, 4), (p_elec_1, 'https://songlongmedia.com/media/product/3574_sony_wh_1000xm5_like_new_songlongmedia__5_.jpg', false, 5), (p_elec_1, 'https://songlongmedia.com/media/product/3574_sony_wh_1000xm5_like_new_songlongmedia__6_.jpg', false, 6);

    -- Product 17: True Wireless Earbuds
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_elec_2, seller_3, cat_elec_earbuds, 'True Wireless Earbuds', 'Crystal clear sound in a compact package.', 900000.00, 50000.00, 1500000.00, NOW(), NOW() + INTERVAL '9 days', 'active', true, true, 950000.00, '[{"name": "Audio", "features": [{"name": "Codecs", "description": "AAC, aptX"}, {"name": "Mic", "description": "4-mic array"}]}, {"name": "Case", "features": [{"name": "Charging", "description": "Wireless Qi"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_elec_2, 'https://tainghe.com.vn/media/product/6992_tai_nghe_bluetooth_soundpeats_air5_pro_plus_chinh_hang.webp', true, 1), (p_elec_2, 'https://tainghe.com.vn/media/product/6992_tai_nghe_bluetooth_soundpeats_air5_pro_plus_chinh_hang_2.webp', false, 2), (p_elec_2, 'https://tainghe.com.vn/media/product/6992_tai_nghe_bluetooth_soundpeats_air5_pro_plus_chinh_hang.webp', false, 3), (p_elec_2, 'https://tainghe.com.vn/media/product/6992_tai_nghe_bluetooth_soundpeats_air5_pro_plus_chinh_hang_3.webp', false, 4);

    -- Product 18: Mechanical Keyboard 65%
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_elec_3, seller_1, cat_elec_key_mouse, 'Mechanical Keyboard 65%', 'Tactile brown switches.', 1200000.00, 100000.00, 1800000.00, NOW(), NOW() + INTERVAL '14 days', 'active', true, true, 1300000.00, '[{"name": "Switch Specs", "features": [{"name": "Type", "description": "Gateron Brown Tactile"}, {"name": "Actuation", "description": "45g Force"}]}, {"name": "Build", "features": [{"name": "Frame", "description": "CNC Aluminum"}, {"name": "Keycaps", "description": "Double-shot PBT"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_elec_3, 'https://mastodon.gadgetoid.com/system/media_attachments/files/113/012/634/657/261/771/small/b899a717308603b7.jpeg', true, 1), (p_elec_3, 'https://mastodon.gadgetoid.com/system/media_attachments/files/113/012/651/738/160/151/small/ae7aa3e7c2fa8d5b.jpeg', false, 2), (p_elec_3, 'https://mastodon.gadgetoid.com/system/media_attachments/files/113/012/632/135/056/073/small/f474c3674f2d759b.jpeg', false, 3), (p_elec_3, 'https://mastodon.gadgetoid.com/system/media_attachments/files/113/012/544/379/916/393/small/f89a2ececc8c2238.jpeg', false, 4);

    -- Product 19: Precision Wireless Mouse
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_elec_4, seller_5, cat_elec_key_mouse, 'Precision Wireless Mouse', 'Ergonomic shape for productivity.', 600000.00, 50000.00, 990000.00, NOW(), NOW() + INTERVAL '10 days', 'active', true, true, 600000.00, '[{"name": "Sensor", "features": [{"name": "DPI", "description": "20,000"}, {"name": "Tracking", "description": "Glass-compatible"}]}, {"name": "Connectivity", "features": [{"name": "Type", "description": "Bluetooth & 2.4Ghz"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_elec_4, 'https://surfaceviet.vn/wp-content/uploads/2019/05/surface-precision-mouse-chinh-hang-1.png', true, 1), (p_elec_4, 'https://surfaceviet.vn/wp-content/uploads/2019/05/surface-precision-mouse-gia.jpg', false, 2), (p_elec_4, 'https://surfaceviet.vn/wp-content/uploads/2019/05/surface-precision-mouse-gia-ban.jpg', false, 3), (p_elec_4, 'https://surfaceviet.vn/wp-content/uploads/2019/05/surface-precision-mouse-chinh-hang-tai-ha-noi.jpg', false, 4);

    -- Product 20: Walnut Monitor Stand
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_elec_5, seller_2, cat_elec_stands, 'Walnut Monitor Stand', 'Elevate your workspace.', 700000.00, 50000.00, 1200000.00, NOW(), NOW() + INTERVAL '13 days', 'active', true, true, 750000.00, '[{"name": "Material", "features": [{"name": "Wood", "description": "American Black Walnut"}, {"name": "Legs", "description": "Anodized Aluminum"}]}, {"name": "Dimensions", "features": [{"name": "Size", "description": "42in x 9in"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_elec_5, 'https://preview.redd.it/waterfall-walnut-monitor-stand-v0-hjddqp6rdthe1.jpg?width=1080&crop=smart&auto=webp&s=23b1d3a310be004973da29509c6e4206f0b94122', true, 1), (p_elec_5, 'https://preview.redd.it/waterfall-walnut-monitor-stand-v0-fbdt3o6rdthe1.jpg?width=1080&crop=smart&auto=webp&s=2f64fab0e5e86d1fa064e29decd77d5e5ec47e71', false, 2), (p_elec_5, 'https://preview.redd.it/waterfall-walnut-monitor-stand-v0-vna8no6rdthe1.jpg?width=1080&crop=smart&auto=webp&s=ff5b76a10acf7e2dbb4d0664624e258b9785b4c3', false, 3), (p_elec_5, 'https://preview.redd.it/waterfall-walnut-monitor-stand-v0-a8j6a26rdthe1.jpg?width=1080&crop=smart&auto=webp&s=406a0c01293d81d1d88840653b75a308f94b1c02', false, 4), (p_elec_5, 'https://preview.redd.it/waterfall-walnut-monitor-stand-v0-8cwhr26rdthe1.jpg?width=1080&crop=smart&auto=webp&s=a50acfe4c5ad0e8f1fe5d7e26bb6c6e3c69ba5fd', false, 5);

    ---------------------------------------------------------------------------
    -- 7. INSERT PRODUCTS & IMAGES (Batch 5: HOME)
    ---------------------------------------------------------------------------

    -- Product 21: Hand-Thrown Ceramic Mug
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_home_1, seller_5, cat_home_drinkware, 'Hand-Thrown Ceramic Mug', 'Speckled white glaze.', 200000.00, 10000.00, 350000.00, NOW(), NOW() + INTERVAL '8 days', 'active', true, true, 220000.00,
    '[{"name": "Product Info", "features": [{"name": "Material", "description": "Stoneware Clay"}, {"name": "Capacity", "description": "12oz"}]}, {"name": "Care", "features": [{"name": "Dishwasher", "description": "Safe"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_home_1, 'https://i.ebayimg.com/images/g/zUQAAOSwkwJjbU7o/s-l1600.webp', true, 1), (p_home_1, 'https://i.ebayimg.com/images/g/k8IAAOSwozpjbU7o/s-l1600.webp', false, 2), (p_home_1, 'https://i.ebayimg.com/images/g/~gcAAOSwUdRjbU7n/s-l1600.webp', false, 3), (p_home_1, 'https://i.ebayimg.com/images/g/2CAAAOSwCQpjbU7o/s-l1600.webp', false, 4);

    -- Product 22: Vacuum Insulated Water Bottle
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_home_2, seller_3, cat_home_drinkware, 'Vacuum Insulated Water Bottle', 'Matte black finish.', 250000.00, 20000.00, 450000.00, NOW(), NOW() + INTERVAL '12 days', 'active', true, true, 250000.00, '[{"name": "Insulation", "features": [{"name": "Cold", "description": "24 Hours"}, {"name": "Hot", "description": "12 Hours"}]}, {"name": "Material", "features": [{"name": "Body", "description": "18/8 Stainless Steel"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_home_2, 'https://i.ebayimg.com/images/g/KH0AAOSwVUpc~3rO/s-l1600.webp', true, 1), (p_home_2, 'https://i.ebayimg.com/images/g/P4cAAOSwUY9dAKkW/s-l1600.webp', false, 2), (p_home_2, 'https://i.ebayimg.com/images/g/2U0AAOSwpLBc~3sW/s-l1600.webp', false, 3), (p_home_2, 'https://i.ebayimg.com/images/g/hbMAAOSwS8tdAKkY/s-l1600.webp', false, 4);

    -- Product 23: Washed Linen Throw Pillow
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_home_3, seller_2, cat_home_pillow, 'Washed Linen Throw Pillow', 'Soft, textured 100% linen.', 400000.00, 50000.00, 750000.00, NOW(), NOW() + INTERVAL '7 days', 'active', true, true, 400000.00, '[{"name": "Fabric", "features": [{"name": "Material", "description": "European Flax Linen"}, {"name": "Fill", "description": "Duck Feather"}]}, {"name": "Care", "features": [{"name": "Wash", "description": "Machine Washable Cover"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_home_3, 'https://i.ebayimg.com/images/g/5QQAAeSwpklpRB7s/s-l1600.webp', true, 1), (p_home_3, 'https://i.ebayimg.com/images/g/pjoAAeSwAyppRB7s/s-l1600.webp', false, 2), (p_home_3, 'https://i.ebayimg.com/images/g/iwYAAeSwi4VpRB7s/s-l1600.webp', false, 3), (p_home_3, 'https://i.ebayimg.com/images/g/qKUAAeSwVbFpRB7s/s-l1600.webp', false, 4);

    -- Product 24: Concrete Planter Pot
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_home_4, seller_1, cat_home_planters, 'Concrete Planter Pot', 'Modern geometric design.', 180000.00, 20000.00, 300000.00, NOW(), NOW() + INTERVAL '14 days', 'active', true, true, 200000.00, '[{"name": "Design", "features": [{"name": "Shape", "description": "Hexagonal"}, {"name": "Drainage", "description": "Yes, with saucer"}]}, {"name": "Size", "features": [{"name": "Diameter", "description": "6 inches"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_home_4, 'https://i.ebayimg.com/images/g/qmMAAOSwzQVhoHd0/s-l1600.webp', true, 1), (p_home_4, 'https://i.ebayimg.com/images/g/kKoAAOSwsidhoHd0/s-l1600.webp', false, 2), (p_home_4, 'https://i.ebayimg.com/images/g/yn4AAOSw3w1hoHdz/s-l1600.webp', false, 3);

    -- Product 25: Architect Desk Lamp
    INSERT INTO public.products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, start_time, end_time, status, allow_unrated_bidder, auto_extend, current_price, specifications) VALUES
    (p_home_5, seller_4, cat_home_lighting, 'Architect Desk Lamp', 'Classic swing-arm design.', 500000.00, 50000.00, 900000.00, NOW(), NOW() + INTERVAL '11 days', 'active', true, true, 500000.00, '[{"name": "Lighting", "features": [{"name": "Socket", "description": "E26 Standard Base"}, {"name": "Max Wattage", "description": "60W"}]}, {"name": "Adjustability", "features": [{"name": "Arms", "description": "Spring-loaded swing arm"}]}]'::jsonb);

    INSERT INTO public.product_images (product_id, image_url, is_thumbnail, position) VALUES
    (p_home_5, 'https://i.ebayimg.com/images/g/JXUAAOSwn8doMjNU/s-l1600.webp', true, 1), (p_home_5, 'https://i.ebayimg.com/images/g/YnMAAOSwKtZoMjNU/s-l1600.webp', false, 2), (p_home_5, 'https://i.ebayimg.com/images/g/IdkAAOSw0fxoMjNU/s-l1600.webp', false, 3), (p_home_5, 'https://i.ebayimg.com/images/g/8FQAAOSwHSRoMjNV/s-l1600.webp', false, 4);
-- Seed: product_descriptions for 25 products
-- Columns: (id, product_id, content, author_id, created_at)
-- Notes:
-- - product_id is resolved by product name
-- - author_id uses the seller_id of the product
-- - created_at uses NOW()

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Everyday Zip Tote'),
  'A durable everyday tote with a secure zip closure. Crafted from cotton canvas; ideal for daily carry and errands.',
  (SELECT seller_id FROM public.products WHERE name = 'Everyday Zip Tote'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Nomad Travel Backpack'),
  'Water-resistant 25L backpack with a dedicated 16-inch laptop sleeve. Built for travel and commuting.',
  (SELECT seller_id FROM public.products WHERE name = 'Nomad Travel Backpack'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Heritage Leather Duffle'),
  'Full-grain leather weekender bag that ages beautifully. A classic pick for short trips.',
  (SELECT seller_id FROM public.products WHERE name = 'Heritage Leather Duffle'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Tech Organizer Pouch'),
  'Compact organizer for cables, chargers, and drives. Keeps tech essentials neat and accessible.',
  (SELECT seller_id FROM public.products WHERE name = 'Tech Organizer Pouch'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Minimalist Laptop Sleeve'),
  'Wool felt sleeve designed for 13–14 inch laptops. Slim protection with a clean, minimalist look.',
  (SELECT seller_id FROM public.products WHERE name = 'Minimalist Laptop Sleeve'),
  NOW()
);

-- Apparel
INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Essential Cotton Tee - Black'),
  '100% organic cotton tee with a comfortable regular fit. Wardrobe essential for everyday wear.',
  (SELECT seller_id FROM public.products WHERE name = 'Essential Cotton Tee - Black'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Signature Pullover Hoodie'),
  'Heavyweight french terry hoodie with a double-lined hood. Warm and durable for cooler days.',
  (SELECT seller_id FROM public.products WHERE name = 'Signature Pullover Hoodie'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Urban Crewneck Sweatshirt'),
  'Classic crewneck sweatshirt with a modern fit. Soft cotton blend for everyday comfort.',
  (SELECT seller_id FROM public.products WHERE name = 'Urban Crewneck Sweatshirt'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = '5-Panel Performance Cap'),
  'Lightweight quick-dry nylon cap with adjustable clip closure. Breathable and ready for activity.',
  (SELECT seller_id FROM public.products WHERE name = '5-Panel Performance Cap'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Relaxed Fit Joggers'),
  'Comfort-first joggers with a tapered leg and elastic waist. Everyday staples for home or gym.',
  (SELECT seller_id FROM public.products WHERE name = 'Relaxed Fit Joggers'),
  NOW()
);

-- Footwear
INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'City White Low-Tops'),
  'Minimalist leather sneakers with durable rubber soles. Clean look that pairs with anything.',
  (SELECT seller_id FROM public.products WHERE name = 'City White Low-Tops'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'All-Terrain Trail Runners'),
  'Designed for trails and elements; waterproof membrane with confident grip. Built for performance outdoors.',
  (SELECT seller_id FROM public.products WHERE name = 'All-Terrain Trail Runners'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Heritage Leather Boots'),
  'Goodyear welted leather boots, resolable for long-term wear. Heritage build with timeless style.',
  (SELECT seller_id FROM public.products WHERE name = 'Heritage Leather Boots'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Classic Canvas Slip-Ons'),
  'Easy slip-on canvas shoes with a waffle rubber sole. Casual comfort for everyday use.',
  (SELECT seller_id FROM public.products WHERE name = 'Classic Canvas Slip-Ons'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Post-Workout Slides'),
  'Recovery slides with cloud-like cushioning and high arch support. Ideal after runs or gym sessions.',
  (SELECT seller_id FROM public.products WHERE name = 'Post-Workout Slides'),
  NOW()
);

-- Electronics
INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Pro Noise Cancelling Headphones'),
  'Industry-leading ANC over-ear headphones with long battery life. Immersive sound for travel and focus.',
  (SELECT seller_id FROM public.products WHERE name = 'Pro Noise Cancelling Headphones'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'True Wireless Earbuds'),
  'Compact true wireless earbuds with clear calls and wireless charging case. Convenient for daily use.',
  (SELECT seller_id FROM public.products WHERE name = 'True Wireless Earbuds'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Mechanical Keyboard 65%'),
  '65% mechanical keyboard with tactile switches and aluminum frame. Balanced form factor for productivity.',
  (SELECT seller_id FROM public.products WHERE name = 'Mechanical Keyboard 65%'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Precision Wireless Mouse'),
  'Ergonomic wireless mouse with high DPI sensor and multi-device connectivity. Designed for all-day work.',
  (SELECT seller_id FROM public.products WHERE name = 'Precision Wireless Mouse'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Walnut Monitor Stand'),
  'Solid walnut monitor stand to elevate your setup. Adds ergonomics and a premium aesthetic to your desk.',
  (SELECT seller_id FROM public.products WHERE name = 'Walnut Monitor Stand'),
  NOW()
);

-- Home
INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Hand-Thrown Ceramic Mug'),
  'Handmade ceramic mug with speckled glaze. Dishwasher-safe and perfect for daily coffee rituals.',
  (SELECT seller_id FROM public.products WHERE name = 'Hand-Thrown Ceramic Mug'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Vacuum Insulated Water Bottle'),
  'Vacuum-insulated stainless steel bottle with matte finish. Keeps drinks cold up to 24h, hot up to 12h.',
  (SELECT seller_id FROM public.products WHERE name = 'Vacuum Insulated Water Bottle'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Washed Linen Throw Pillow'),
  'Soft washed linen pillow with feather fill. Adds cozy texture to living spaces.',
  (SELECT seller_id FROM public.products WHERE name = 'Washed Linen Throw Pillow'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Concrete Planter Pot'),
  'Modern geometric concrete planter with drainage. Ideal for small houseplants and succulents.',
  (SELECT seller_id FROM public.products WHERE name = 'Concrete Planter Pot'),
  NOW()
);

INSERT INTO public.product_descriptions (id, product_id, content, author_id, created_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.products WHERE name = 'Architect Desk Lamp'),
  'Classic swing-arm desk lamp with adjustable arms. Functional lighting for focused workspaces.',
  (SELECT seller_id FROM public.products WHERE name = 'Architect Desk Lamp'),
  NOW()
);

END $$;

