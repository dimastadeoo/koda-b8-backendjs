CREATE TABLE "methods_payments" (
    "id"          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name"        VARCHAR(100) NOT NULL,
    "payment_type"  VARCHAR(50) DEFAULT 'BANK',   -- BANK, EWALLET, RETAIL, etc
    "is_active"     BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);