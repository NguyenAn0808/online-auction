-- SAMPLE DATA SEED SCRIPT
-- RUN THIS AFTER init_schema.sql

-- Clear existing data (optional, be careful in production!)
-- TRUNCATE TABLE users, categories, products, bids, orders, ratings, watchlist, questions, answers, product_images, product_descriptions, blocked_bidders, upgrade_requests CASCADE;

-- 1. USERS
-- Password for all: "password123" (hashed bcrypt example)
-- $2b$10$YourHashedPasswordHere... (using a placeholder hash for example)
-- Let's assume a valid bcrypt hash for 'Password123' is: $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWrn9.0p/AbkRg.9r.2eL.W5q.Nu6e

INSERT INTO users (id, full_name, email, hashed_password, role, is_verified, address, phone, rating_points)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@example.com', '$2b$10$CdCNoevW7279p/qNvNqPOuvyskUODBgx.ffEbAJyVAbBYhQXV6wty', 'admin', true, '123 Admin St', '1234567890', 100),
  ('00000000-0000-0000-0000-000000000002', 'Seller John', 'seller@example.com', '$2b$10$CdCNoevW7279p/qNvNqPOuvyskUODBgx.ffEbAJyVAbBYhQXV6wty', 'seller', true, '456 Seller Ave', '0987654321', 50),
  ('00000000-0000-0000-0000-000000000003', 'Bidder anhnguyen', 'anhnguyen@example.com', '$2b$10$CdCNoevW7279p/qNvNqPOuvyskUODBgx.ffEbAJyVAbBYhQXV6wty', 'bidder', true, '789 Bidder Blvd', '1112223333', 10),
  ('00000000-0000-0000-0000-000000000004', 'Bidder nguyenan', 'nguyenan@example.com', '$2b$10$CdCNoevW7279p/qNvNqPOuvyskUODBgx.ffEbAJyVAbBYhQXV6wty', 'bidder', true, '321 Buyer Ln', '4445556666', 0)
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (id, name, parent_id)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Electronics', NULL),
  ('10000000-0000-0000-0000-000000000002', 'Laptops', '10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'Watches', NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. PRODUCTS
-- Product 1: MacBook Pro (Active Auction)
-- Product 2: Rolex Submariner (Ended/Sold)
-- Product 3: Gaming PC (Active, no bids yet)

INSERT INTO products (id, seller_id, category_id, name, description, start_price, step_price, buy_now_price, current_price, price_holder, start_time, end_time, status, auto_extend)
VALUES 
  -- Active MacBook Pro
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Rolex', 'Rolex Watch', 2000.00, 50.00, 3000.00, 2100.00, '00000000-0000-0000-0000-000000000003', NOW(), NOW() + INTERVAL '3 days', 'active', true),
  
  -- Ended Rolex (Sold to Alice)
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Rolex Submariner', 'Classic diver watch in excellent condition.', 8000.00, 100.00, 12000.00, 9500.00, '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', 'ended', false),

   -- Active Gaming PC
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'High End Gaming PC', 'RTX 4090, i9 14900K.', 3000.00, 100.00, NULL, 3000.00, NULL, NOW(), NOW() + INTERVAL '7 days', 'active', true)
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCT IMAGES
INSERT INTO product_images (product_id, image_url, is_thumbnail, position)
VALUES 
  ('20000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80', true, 0),
  ('20000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80', true, 0),
  ('20000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80', true, 0)
ON CONFLICT DO NOTHING;

-- 5. BIDS
INSERT INTO bids (id, product_id, bidder_id, amount, max_bid, status, timestamp)
VALUES 
  -- Bids on MacBook
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 2050.00, 2200.00, 'accepted', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 2100.00, 2500.00, 'accepted', NOW() - INTERVAL '1 day'),

  -- Bids on Rolex (Winner is anhnguyen)
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 8500.00, 9000.00, 'accepted', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 9500.00, 10000.00, 'accepted', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- 6. ORDERS
INSERT INTO orders (id, product_id, buyer_id, seller_id, final_price, status, created_at)
VALUES 
  -- Completed Order for Rolex
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 9500.00, 'completed', NOW() - INTERVAL '1 day')
ON CONFLICT (product_id) DO NOTHING;

-- 7. RATINGS
INSERT INTO ratings (product_id, reviewer_id, target_user_id, score, comment)
VALUES 
  -- anhnguyen rates Seller John
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 1, 'Great seller, item exactly as described!'),
  
  -- Seller John rates anhnguyen
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 1, 'Fast payment, recommended buyer.')
ON CONFLICT DO NOTHING;

-- 8. WATCHLIST
INSERT INTO watchlist (user_id, product_id)
VALUES 
  ('00000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001') -- Alice watching MacBook
ON CONFLICT DO NOTHING;

-- 9. QUESTIONS & ANSWERS
INSERT INTO questions (id, product_id, user_id, question_text)
VALUES 
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Does this come with the original box?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (question_id, user_id, answer_text)
VALUES 
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Yes, it comes with original packaging and charger.')
ON CONFLICT DO NOTHING;

-- 10. UPGRADE REQUESTS
INSERT INTO upgrade_requests (user_id, reason, contact, status)
VALUES 
  ('00000000-0000-0000-0000-000000000004', 'I want to sell my collection of vintage cameras.', 'nguyenan@example.com', 'pending')
ON CONFLICT DO NOTHING;
