-- Add slug column, allowing null temporarily
ALTER TABLE products ADD COLUMN slug VARCHAR(255);

-- Backfill existing products with a slug
-- Lowercase the name, replace spaces with hyphens, and append ID to ensure uniqueness
UPDATE products 
SET slug = LOWER(REPLACE(name, ' ', '-')) || '-' || id;

-- Make slug NOT NULL and add a unique constraint
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
ALTER TABLE products ADD CONSTRAINT uk_products_slug UNIQUE (slug);
