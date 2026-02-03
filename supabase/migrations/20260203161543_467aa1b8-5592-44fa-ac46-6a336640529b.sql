-- Add favicon_url column to imobiliarias table
ALTER TABLE imobiliarias 
ADD COLUMN IF NOT EXISTS favicon_url TEXT;