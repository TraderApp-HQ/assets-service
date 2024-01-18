/*
  Warnings:

  - Added the required column `isCoinActive` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `Coin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `coin` ADD COLUMN `isCoinActive` BOOLEAN NOT NULL,
    ADD COLUMN `rank` INTEGER NOT NULL;
