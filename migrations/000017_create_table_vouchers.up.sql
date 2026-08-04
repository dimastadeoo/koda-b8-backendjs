CREATE TABLE "vouchers" (
    "id"              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "code"            VARCHAR(50) NOT NULL UNIQUE,
    "type"            VARCHAR(20) NOT NULL CHECK ("type" IN ('percentage', 'fixed')),
    "value"           INT NOT NULL CHECK ("value" >= 0),
    "min_purchase"    INT NOT NULL DEFAULT 0,
    "quota"           INT NOT NULL DEFAULT 0,
    "valid_from"      TIMESTAMPTZ NOT NULL,
    "valid_until"     TIMESTAMPTZ NOT NULL,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK ("valid_until" > "valid_from")
);