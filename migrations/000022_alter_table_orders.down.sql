-- Hapus kolom checkout_step
ALTER TABLE "orders" DROP COLUMN "checkout_step";

-- Kembalikan kolom menjadi NOT NULL
ALTER TABLE "orders" ALTER COLUMN "id_shipping" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "id_payment" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN address SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "subtotal" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "total_payment" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "shipping_cost" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "discount" SET NOT NULL;

-- Kembalikan CHECK constraint status seperti semula
ALTER TABLE "orders" DROP CONSTRAINT "orders_status_check";
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_check"
CHECK (status IN ('pending', 'paid', 'shipping', 'delivered', 'canceled', 'refunded'));