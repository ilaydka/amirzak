-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_carrier" TEXT,
ADD COLUMN     "shipping_tracking_number" TEXT,
ADD COLUMN     "shipping_tracking_url" TEXT;
