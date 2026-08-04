CREATE TABLE "carts_list" (
    "id_product"  BIGINT NOT NULL REFERENCES "products"("id"),
    "id_cart"     BIGINT NOT NULL REFERENCES "carts"("id") ON DELETE CASCADE,
    "qty"         INT NOT NULL CHECK ("qty" > 0),
    "status"      VARCHAR(20) NOT NULL DEFAULT 'active'
                  CHECK ("status" IN ('active', 'not checked', 'checkout', 'sold out', 'not found')),
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);