-- Create product_variants table
CREATE TABLE product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(100),
    size VARCHAR(50),
    sku VARCHAR(100) UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0,
    price_override DECIMAL(10,2)
);

CREATE INDEX idx_prod_var_product ON product_variants(product_id);

-- Update cart_items
ALTER TABLE cart_items
ADD COLUMN variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL;

-- Update order_items
ALTER TABLE order_items
ADD COLUMN variant_id BIGINT REFERENCES product_variants(id) ON DELETE SET NULL,
ADD COLUMN variant_name VARCHAR(255);

-- Update inventory_movements
ALTER TABLE inventory_movements
ADD COLUMN variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE;
