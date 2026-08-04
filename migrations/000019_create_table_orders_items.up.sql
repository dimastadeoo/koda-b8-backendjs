CREATE TABLE "order_items" (
    "id_order"                BIGINT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "id_product"              BIGINT NOT NULL REFERENCES "products"("id"),
    "product_name_snapshot"   VARCHAR(200) NOT NULL,
    "price_snapshot"          INT NOT NULL CHECK ("price_snapshot" >= 0),
    "qty"                     INT NOT NULL CHECK ("qty" > 0),
    "created_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);