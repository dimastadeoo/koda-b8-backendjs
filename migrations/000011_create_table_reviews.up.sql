CREATE TABLE "reviews" (
    "id"          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "id_product"  BIGINT NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
    "id_user"     BIGINT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "stars"       INT NOT NULL CHECK ("stars" BETWEEN 1 AND 5),
    "review"      TEXT,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);