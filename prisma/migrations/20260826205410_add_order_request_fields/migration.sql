-- CreateEnum
CREATE TYPE "OrderRequestType" AS ENUM ('CANCELLATION', 'RETURN');

-- CreateEnum
CREATE TYPE "OrderRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "requestReason" TEXT,
ADD COLUMN     "requestStatus" "OrderRequestStatus",
ADD COLUMN     "requestType" "OrderRequestType",
ADD COLUMN     "request_created_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "orders_requestStatus_idx" ON "orders"("requestStatus");
