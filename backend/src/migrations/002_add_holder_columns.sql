DO $$ 
BEGIN 
    -- Add price_holder column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_holder') THEN 
        ALTER TABLE products ADD COLUMN price_holder UUID;
    END IF;

    -- Drop current_holder column if it exists (cleanup)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'current_holder') THEN 
        ALTER TABLE products DROP COLUMN current_holder;
    END IF;
END $$;
