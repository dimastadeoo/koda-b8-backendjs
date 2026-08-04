CREATE TABLE "whishlists" (
    "id_profile"  BIGINT NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "id_product"  BIGINT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE ("id_profile", "id_product")
);