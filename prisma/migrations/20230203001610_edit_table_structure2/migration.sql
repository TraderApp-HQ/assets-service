/*
  Warnings:

  - You are about to alter the column `makerFee` on the `exchange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.
  - You are about to alter the column `takerFee` on the `exchange` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Double`.

*/
-- AlterTable
ALTER TABLE `exchange` MODIFY `makerFee` DOUBLE NOT NULL,
    MODIFY `takerFee` DOUBLE NOT NULL;
