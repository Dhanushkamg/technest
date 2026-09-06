-- =============================================================================
-- TechNest Reliability & Performance Upgrade Migration (V2)
-- =============================================================================

-- 1. Add Optimistic Locking version columns to orders and payments (Stage 6.5)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- 2. Add Deduplication Key to notifications (Stage 6.5)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS deduplication_key VARCHAR(255);
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_notifications_dedup_key'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT uq_notifications_dedup_key UNIQUE (deduplication_key);
    END IF;
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- 3. High-Performance Composite Indexes
-- Order querying by user and status
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Product discovery by category
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Inventory movement auditing by product and timestamp
CREATE INDEX IF NOT EXISTS idx_inv_mov_product_created ON inventory_movements(product_id, created_at);

-- Notification polling by user and read state
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
