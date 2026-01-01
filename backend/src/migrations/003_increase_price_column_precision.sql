-- Migration: Increase price column precision to support larger values (e.g., VND currency)
-- Date: 2026-01-01
-- Description: Change price columns from DECIMAL(10,2) to DECIMAL(15,2) to support currencies with larger values

-- Increase precision for product price columns
ALTER TABLE products 
  ALTER COLUMN start_price TYPE DECIMAL(15, 2),
  ALTER COLUMN current_price TYPE DECIMAL(15, 2),
  ALTER COLUMN step_price TYPE DECIMAL(15, 2),
  ALTER COLUMN buy_now_price TYPE DECIMAL(15, 2);

-- DECIMAL(15, 2) supports values up to 9,999,999,999,999.99
-- This is sufficient for VND (Vietnamese Dong) and other high-value currencies
