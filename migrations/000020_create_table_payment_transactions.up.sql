CREATE TABLE "payment_transactions" (
    "id"                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "id_order"            BIGINT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "id_method_payment"   BIGINT NOT NULL REFERENCES "methods_payments"("id"),
    "reference_number"    VARCHAR(100) UNIQUE,
    "amount"              INT NOT NULL CHECK ("amount" >= 0),
    "status"              VARCHAR(20) NOT NULL DEFAULT 'pending'
                          CHECK ("status" IN ('pending', 'success', 'failed', 'expired')),
    "proof_url"           VARCHAR(255),
    "paid_at"             TIMESTAMPTZ,
    "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);