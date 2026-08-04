CREATE TABLE "shipping_tracking" (
    "id_order"        BIGINT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "resi_number"     VARCHAR(100),
    "courier_status"  VARCHAR(100),
    "note"            TEXT,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);