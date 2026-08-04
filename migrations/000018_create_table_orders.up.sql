CREATE TABLE "orders" (
    "id"              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "id_cart"         BIGINT REFERENCES "carts"("id"),
    "id_shipping"     BIGINT NOT NULL REFERENCES "method_shippings"("id"),
    "id_payment"      BIGINT NOT NULL REFERENCES "methods_payments"("id"),
    "id_voucher"      BIGINT REFERENCES "vouchers"("id"),
    "address"         VARCHAR(255) NOT NULL,
    "subtotal"        INT NOT NULL CHECK ("subtotal" >= 0),
    "discount"        INT NOT NULL DEFAULT 0 CHECK ("discount" >= 0),
    "shipping_cost"   INT NOT NULL DEFAULT 0 CHECK ("shipping_cost" >= 0),
    "total_payment"   INT NOT NULL CHECK ("total_payment" >= 0),
    "status"          VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK ("status" IN ('pending', 'paid', 'shipping', 'delivered', 'canceled', 'refunded')),
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);