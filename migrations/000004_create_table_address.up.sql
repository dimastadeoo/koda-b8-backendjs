CREATE TABLE "address" (
    "id"              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "id_profile"      BIGINT NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "label"           VARCHAR(50), -- rumah, kantor, dst
    "receiver_name"   VARCHAR(255) NOT NULL,
    "detail_address"  VARCHAR(255) NOT NULL,
    "province"        VARCHAR(100) NOT NULL,
    "city"            VARCHAR(100) NOT NULL,
    "district"        VARCHAR(100) NOT NULL,
    "village"         VARCHAR(100) NOT NULL,
    "is_primary"      BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);