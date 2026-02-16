/*
  Warnings:

  - You are about to drop the column `actual_amount` on the `expenses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "actual_amount",
ADD COLUMN     "final_amount" INTEGER;
