-- CreateEnum
CREATE TYPE "CheckoutType" AS ENUM ('CART', 'BUY_NOW');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "cart_id" TEXT,
ADD COLUMN     "checkout_type" "CheckoutType" NOT NULL DEFAULT 'CART';

-- CreateIndex
CREATE INDEX "payments_checkout_type_idx" ON "payments"("checkout_type");

-- CreateIndex
CREATE INDEX "payments_cart_id_idx" ON "payments"("cart_id");
