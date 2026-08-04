CREATE TABLE "products" (
    "id"          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name"        VARCHAR(200) NOT NULL,
    "price"       INT NOT NULL CHECK ("price" >= 0),
    "id_merk"     BIGINT REFERENCES "merks"("id"),
    "stock"       INT NOT NULL DEFAULT 0 CHECK ("stock" >= 0),
    "description" TEXT,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);