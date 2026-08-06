-- Tambahkan kolom checkout_step untuk tracking progress
ALTER TABLE "orders" ADD COLUMN "checkout_step" VARCHAR(20) DEFAULT 'init';

-- Ubah beberapa kolom menjadi nullable (jika sebelumnya NOT NULL)
ALTER TABLE "orders" ALTER COLUMN "id_shipping" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "id_payment" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "address" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "subtotal" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "total_payment" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "shipping_cost" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "discount" DROP NOT NULL;

ALTER TABLE "orders" DROP CONSTRAINT "orders_status_check";
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_check" CHECK (status IN ('in_progress', 'pending', 'paid', 'shipping', 'delivered', 'canceled', 'refunded'));