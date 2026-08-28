-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_address" TEXT,
ADD COLUMN     "shipping_city" TEXT,
ADD COLUMN     "shipping_country_code" TEXT,
ADD COLUMN     "shipping_first_name" TEXT,
ADD COLUMN     "shipping_last_name" TEXT,
ADD COLUMN     "shipping_phone" TEXT,
ADD COLUMN     "shipping_phone_country_code" TEXT,
ADD COLUMN     "shipping_postal_code" TEXT;
