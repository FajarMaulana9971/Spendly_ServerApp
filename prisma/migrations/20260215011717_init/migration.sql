/*
  Warnings:

  - You are about to drop the column `createdAt` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `spentAt` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `spent_at` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `expenses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_paymentId_fkey";

-- DropIndex
DROP INDEX "expenses_category_spentAt_idx";

-- DropIndex
DROP INDEX "expenses_createdAt_idx";

-- DropIndex
DROP INDEX "expenses_isPaid_idx";

-- DropIndex
DROP INDEX "expenses_paymentId_idx";

-- DropIndex
DROP INDEX "expenses_spentAt_idx";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "createdAt",
DROP COLUMN "isPaid",
DROP COLUMN "paidAt",
DROP COLUMN "paymentId",
DROP COLUMN "spentAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paid_at" DATE,
ADD COLUMN     "payment_id" BIGINT,
ADD COLUMN     "spent_at" DATE NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Payment";

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expenses_spent_at_idx" ON "expenses"("spent_at");

-- CreateIndex
CREATE INDEX "expenses_created_at_idx" ON "expenses"("created_at");

-- CreateIndex
CREATE INDEX "expenses_category_spent_at_idx" ON "expenses"("category", "spent_at");

-- CreateIndex
CREATE INDEX "expenses_is_paid_idx" ON "expenses"("is_paid");

-- CreateIndex
CREATE INDEX "expenses_payment_id_idx" ON "expenses"("payment_id");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
