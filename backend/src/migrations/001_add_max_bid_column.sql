-- Migration: Add auto-bid feature columns
-- Date: 2025-12-31
-- Description: Enables auto-bid functionality where users set a maximum bid
--              and the system automatically bids just enough to win

-- =====================================================
-- PART 1: Add max_bid column to bids table
-- =====================================================

-- Add max_bid column
ALTER TABLE bids ADD COLUMN IF NOT EXISTS max_bid DECIMAL(12, 2);

-- For existing bids, set max_bid equal to amount (they were manual bids)
UPDATE bids SET max_bid = amount WHERE max_bid IS NULL;

-- Add index for efficient auto-bid competition queries
CREATE INDEX IF NOT EXISTS idx_bids_max_bid ON bids(max_bid DESC);

-- =====================================================
-- PART 2: Add current_price column to products table
-- =====================================================

-- Add current_price column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS current_price DECIMAL(10, 2);

-- For existing products, set current_price to start_price (or highest bid if exists)
UPDATE products p
SET current_price = COALESCE(
  (SELECT MAX(b.amount) FROM bids b WHERE b.product_id = p.id AND b.status != 'rejected'),
  p.start_price
);

-- =====================================================
-- Verify columns were added
-- =====================================================
SELECT 'bids.max_bid' as column_added, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bids' AND column_name = 'max_bid'
UNION ALL
SELECT 'products.current_price' as column_added, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'current_price';
