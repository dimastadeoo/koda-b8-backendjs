CREATE TABLE "img_product" (
    "id"          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "id_product"  BIGINT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "url_img"     VARCHAR(255) NOT NULL,
    "sort_order"  INTEGER NOT NULL DEFAULT 0,
    "is_primary"  BOOLEAN NOT NULL DEFAULT false,
    "alt_text"    VARCHAR(255),
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);