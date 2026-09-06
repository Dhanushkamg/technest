-- =============================================================================
-- TechNest Catalog Seed Data Migration (V3)
-- Seeds standard realistic electronics categories and products.
-- Uses ON CONFLICT DO NOTHING for idempotent execution.
-- =============================================================================

-- 1. Insert Categories
INSERT INTO categories (name) VALUES
    ('Laptops'),
    ('Smartphones'),
    ('Audio'),
    ('Smart Watches'),
    ('Tablets'),
    ('Monitors'),
    ('Gaming & Accessories'),
    ('Components')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Products
-- Laptops
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Apple MacBook Air M2 13.6-inch', 'Apple M2 chip, 8GB Unified Memory, 256GB SSD, Liquid Retina Display.', 1099.00, 18, c.id, 4.9, 38, NOW()
FROM categories c WHERE c.name = 'Laptops'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Apple MacBook Air M2 13.6-inch');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Dell XPS 13 Plus 9320', '13.4-inch OLED 3.5K Touch, Intel Core i7-1360P, 16GB RAM, 512GB SSD.', 1299.00, 8, c.id, 4.7, 19, NOW()
FROM categories c WHERE c.name = 'Laptops'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dell XPS 13 Plus 9320');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'ASUS ROG Zephyrus G14 Gaming Laptop', '14-inch 165Hz QHD, AMD Ryzen 9 7940HS, NVIDIA RTX 4070, 16GB DDR5.', 1599.00, 10, c.id, 4.8, 27, NOW()
FROM categories c WHERE c.name = 'Laptops'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'ASUS ROG Zephyrus G14 Gaming Laptop');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Lenovo Legion Pro 5 Gen 8', '16-inch WQXGA 240Hz, Intel Core i7-13700HX, RTX 4060, 32GB RAM.', 1349.00, 14, c.id, 4.6, 15, NOW()
FROM categories c WHERE c.name = 'Laptops'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Lenovo Legion Pro 5 Gen 8');

-- Smartphones
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Samsung Galaxy S24 Ultra', '6.8-inch Dynamic AMOLED 2X, Snapdragon 8 Gen 3, 200MP Quad Camera.', 1199.99, 15, c.id, 4.8, 42, NOW()
FROM categories c WHERE c.name = 'Smartphones'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Samsung Galaxy S24 Ultra');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Google Pixel 9 Pro', '6.7-inch Super Actua Display, Google Tensor G4, Advanced Pro AI Camera.', 999.00, 12, c.id, 4.7, 24, NOW()
FROM categories c WHERE c.name = 'Smartphones'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Google Pixel 9 Pro');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'OnePlus 12 5G', '6.82-inch 120Hz ProXDR, Snapdragon 8 Gen 3, 16GB RAM, 100W SUPERVOOC.', 799.99, 20, c.id, 4.6, 18, NOW()
FROM categories c WHERE c.name = 'Smartphones'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'OnePlus 12 5G');

-- Audio
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise canceling with Auto NC Optimizer, 30hr battery.', 399.99, 25, c.id, 4.9, 56, NOW()
FROM categories c WHERE c.name = 'Audio'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sony WH-1000XM5 Wireless Headphones');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Apple AirPods Pro (2nd Gen, USB-C)', 'Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio.', 249.00, 30, c.id, 4.8, 64, NOW()
FROM categories c WHERE c.name = 'Audio'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Apple AirPods Pro (2nd Gen, USB-C)');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'JBL Live 660NC Wireless Headphones', 'JBL Signature Sound with 40mm drivers, Adaptive Noise Cancelling.', 199.95, 22, c.id, 4.5, 31, NOW()
FROM categories c WHERE c.name = 'Audio'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'JBL Live 660NC Wireless Headphones');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Bose QuietComfort Ultra Earbuds', 'Breakthrough spatialized audio, world-class active noise cancellation.', 299.00, 16, c.id, 4.7, 29, NOW()
FROM categories c WHERE c.name = 'Audio'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Bose QuietComfort Ultra Earbuds');

-- Smart Watches
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Apple Watch Series 9 GPS 45mm', 'S9 SiP with Double Tap gesture, Bright 2000-nit Always-On display.', 429.00, 18, c.id, 4.8, 35, NOW()
FROM categories c WHERE c.name = 'Smart Watches'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Apple Watch Series 9 GPS 45mm');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Samsung Galaxy Watch 6 Classic', 'Rotating physical bezel, Advanced sleep coaching, Sapphire crystal glass.', 349.99, 15, c.id, 4.6, 22, NOW()
FROM categories c WHERE c.name = 'Smart Watches'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Samsung Galaxy Watch 6 Classic');

-- Tablets
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Apple iPad Air 11-inch M2', 'Liquid Retina display, M2 powerhouse processor, Apple Pencil Pro support.', 599.00, 16, c.id, 4.9, 41, NOW()
FROM categories c WHERE c.name = 'Tablets'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Apple iPad Air 11-inch M2');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Samsung Galaxy Tab S9 128GB', '11-inch Dynamic AMOLED 2X 120Hz, Snapdragon 8 Gen 2, Included S Pen.', 699.99, 12, c.id, 4.7, 17, NOW()
FROM categories c WHERE c.name = 'Tablets'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Samsung Galaxy Tab S9 128GB');

-- Monitors
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Dell UltraSharp 27 4K USB-C Hub Monitor', '27-inch 4K UHD (3840 x 2160) IPS Black technology with 98% DCI-P3.', 549.99, 9, c.id, 4.8, 20, NOW()
FROM categories c WHERE c.name = 'Monitors'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Dell UltraSharp 27 4K USB-C Hub Monitor');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'LG UltraGear 34-inch Curved OLED Monitor', '34-inch WQHD 240Hz 0.03ms OLED panel, 800R curve, HDMI 2.1.', 899.99, 7, c.id, 4.9, 14, NOW()
FROM categories c WHERE c.name = 'Monitors'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'LG UltraGear 34-inch Curved OLED Monitor');

-- Gaming & Accessories
INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Logitech MX Master 3S Wireless Mouse', '8000 DPI Darkfield sensor, Quiet clicks, MagSpeed electromagnetic scroll.', 99.99, 45, c.id, 4.9, 82, NOW()
FROM categories c WHERE c.name = 'Gaming & Accessories'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Logitech MX Master 3S Wireless Mouse');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Logitech MX Mechanical Wireless Keyboard', 'Tactile quiet low-profile mechanical switches, Smart smart backlighting.', 169.99, 35, c.id, 4.7, 46, NOW()
FROM categories c WHERE c.name = 'Gaming & Accessories'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Logitech MX Mechanical Wireless Keyboard');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Razer BlackShark V2 Pro Wireless Headset', 'TriForce Titanium 50mm Drivers, HyperClear Super Wideband Mic, 70hr batt.', 199.99, 20, c.id, 4.6, 28, NOW()
FROM categories c WHERE c.name = 'Gaming & Accessories'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Razer BlackShark V2 Pro Wireless Headset');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'Anker 737 Power Bank 24000mAh 140W', 'Ultra-powerful 140W two-way fast charging with smart digital display.', 149.99, 50, c.id, 4.8, 53, NOW()
FROM categories c WHERE c.name = 'Gaming & Accessories'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Anker 737 Power Bank 24000mAh 140W');

INSERT INTO products (name, description, price, stock, category_id, average_rating, review_count, created_at)
SELECT 'TechNest Precision USB-C 8-in-1 Hub', 'Dual 4K HDMI, 100W Power Delivery, Gigabit Ethernet, SD/TF Card Reader.', 59.99, 60, c.id, 4.7, 39, NOW()
FROM categories c WHERE c.name = 'Gaming & Accessories'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'TechNest Precision USB-C 8-in-1 Hub');
