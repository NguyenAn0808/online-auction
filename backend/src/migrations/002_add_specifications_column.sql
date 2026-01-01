ALTER TABLE products 
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb;

-- Add index for specifications queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_products_specifications ON products USING GIN (specifications);
