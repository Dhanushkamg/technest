-- =============================================================================
-- TechNest Database Baseline Schema Migration (V1)
-- Represents the initial baseline schema for TechNest.
-- =============================================================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255)
);

-- 2. Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    postal_code VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 4. Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    price NUMERIC(38, 2) NOT NULL,
    stock INTEGER NOT NULL,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    average_rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE
);

-- 5. Carts table
CREATE TABLE IF NOT EXISTS carts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL
);

-- 7. Orders table (Baseline)
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    subtotal NUMERIC(38, 2),
    discount_amount NUMERIC(38, 2),
    coupon_code VARCHAR(255),
    total_amount NUMERIC(38, 2) NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(255),
    postal_code VARCHAR(255),
    country VARCHAR(255)
);

-- 8. Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    price NUMERIC(38, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal NUMERIC(38, 2) NOT NULL
);

-- 9. Payments table (Baseline)
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(38, 2) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- 10. Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    discount_type VARCHAR(255) NOT NULL,
    discount_value NUMERIC(38, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expiration_date TIMESTAMP WITHOUT TIME ZONE,
    max_usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    min_order_amount NUMERIC(38, 2),
    max_discount_amount NUMERIC(38, 2),
    per_user_limit INTEGER,
    first_order_only BOOLEAN NOT NULL DEFAULT FALSE
);

-- 11. Inventory Movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    old_stock INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    movement_type VARCHAR(255) NOT NULL,
    reason VARCHAR(255),
    responsible_user VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- 12. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- 13. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT uq_reviews_user_product UNIQUE (user_id, product_id)
);

-- 14. Wishlist Items table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id)
);
