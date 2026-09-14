CREATE TABLE refunds (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    processed_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_refunds_order_id ON refunds(order_id);
