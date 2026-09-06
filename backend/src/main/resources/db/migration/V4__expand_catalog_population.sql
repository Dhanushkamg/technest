-- =============================================================================
-- TechNest Catalog Expansion Migration (V4)
-- Expands realistic electronics catalog to 30+ items across all core categories.
-- Uses ON CONFLICT / NOT EXISTS for idempotent execution.
-- =============================================================================

-- 1. Smartphones (+3)
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Apple iPhone 15 Pro Max 256GB', 'Titanium design, A17 Pro chip, 48MP main camera, 5x Telephoto, Action button.', 1199.00, 20, c.id, 4.9, 58, NOW()
FROM categories c WHERE c.name = 'Smartphones'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Apple iPhone 15 Pro Max 256GB');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Xiaomi 14 Ultra 5G Leica Optics', 'Snapdragon 8 Gen 3, Quad 50MP Leica summicron optics, 120Hz LTPO AMOLED.', 1099.00, 14, c.id, 4.7, 21, NOW()
FROM categories c WHERE c.name = 'Smartphones'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Xiaomi 14 Ultra 5G Leica Optics');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Sony Xperia 1 VI 5G Flagship', 'Snapdragon 8 Gen 3, Continuous optical zoom lens 85-170mm, Pro OLED display.', 1299.00, 10, c.id, 4.6, 16, NOW()
FROM categories c WHERE c.name = 'Smartphones'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sony Xperia 1 VI 5G Flagship');

-- 2. Laptops (+2)
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Apple MacBook Pro 16-inch M3 Max', '16-core CPU, 40-core GPU, 48GB Unified Memory, 1TB SSD, Liquid Retina XDR.', 3499.00, 8, c.id, 4.9, 45, NOW()
FROM categories c WHERE c.name = 'Laptops'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Apple MacBook Pro 16-inch M3 Max');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'HP Spectre x360 14 2-in-1 OLED Laptop', 'Intel Core Ultra 7 155H, 2.8K OLED Touchscreen, 32GB LPDDR5x, 1TB SSD.', 1449.00, 12, c.id, 4.8, 23, NOW()
FROM categories c WHERE c.name = 'Laptops'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'HP Spectre x360 14 2-in-1 OLED Laptop');

-- 3. Audio (+1)
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Sennheiser Momentum 4 Wireless Headphones', 'Audiophile-inspired 42mm transducer system, 60-hour battery life, Adaptive ANC.', 379.95, 18, c.id, 4.8, 37, NOW()
FROM categories c WHERE c.name = 'Audio'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sennheiser Momentum 4 Wireless Headphones');

-- 4. Smart Watches (+1)
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Garmin Fenix 7 Pro Sapphire Solar', 'Multisport GPS smartwatch, Solar charging power sapphire lens, Built-in LED flashlight.', 799.99, 11, c.id, 4.9, 29, NOW()
FROM categories c WHERE c.name = 'Smart Watches'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Garmin Fenix 7 Pro Sapphire Solar');

-- 5. Tablets (+1)
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Apple iPad Pro 13-inch M4 Ultra Retina', 'Breakthrough Tandem OLED Ultra Retina XDR display, M4 powerhouse chip, 256GB.', 1299.00, 14, c.id, 4.9, 33, NOW()
FROM categories c WHERE c.name = 'Tablets'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Apple iPad Pro 13-inch M4 Ultra Retina');

-- 6. Monitors (+1)
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'ASUS ROG Swift 32-inch 4K OLED Gaming Monitor', '32-inch 4K UHD 240Hz 0.03ms QD-OLED gaming monitor with custom heatsink.', 1299.00, 6, c.id, 4.9, 18, NOW()
FROM categories c WHERE c.name = 'Monitors'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'ASUS ROG Swift 32-inch 4K OLED Gaming Monitor');

-- 7. Gaming & Accessories (+2)
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Corsair K70 RGB PRO Mechanical Gaming Keyboard', 'CHERRY MX Speed Silver switches, AXON 8,000Hz hyper-polling, PBT double-shot keycaps.', 159.99, 28, c.id, 4.7, 44, NOW()
FROM categories c WHERE c.name = 'Gaming & Accessories'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Corsair K70 RGB PRO Mechanical Gaming Keyboard');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Elgato Stream Deck MK.2 Studio Controller', '15 customizable LCD keys for studio triggers, audio adjustments, and livestream macros.', 149.99, 32, c.id, 4.8, 51, NOW()
FROM categories c WHERE c.name = 'Gaming & Accessories'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Elgato Stream Deck MK.2 Studio Controller');
