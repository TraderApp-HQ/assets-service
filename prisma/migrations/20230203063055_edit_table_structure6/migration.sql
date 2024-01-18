/*
  Warnings:

  - You are about to drop the column `isActive` on the `currency` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `currency` DROP COLUMN `isActive`,
    ADD COLUMN `isTradingActive` BOOLEAN NOT NULL DEFAULT true;
