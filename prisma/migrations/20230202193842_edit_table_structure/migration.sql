/*
  Warnings:

  - You are about to drop the column `code` on the `coin` table. All the data in the column will be lost.
  - You are about to drop the column `coin` on the `coin` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `coin` table. All the data in the column will be lost.
  - You are about to drop the column `imgUrl` on the `coin` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `coin` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `exchange` table. All the data in the column will be lost.
  - You are about to drop the column `imgUrl` on the `exchange` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `exchange` table. All the data in the column will be lost.
  - Added the required column `logo` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urls` to the `Coin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logo` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `makerFee` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `takerFee` to the `Exchange` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urls` to the `Exchange` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `coin` DROP COLUMN `code`,
    DROP COLUMN `coin`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `imgUrl`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `dateLaunched` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `logo` VARCHAR(255) NOT NULL,
    ADD COLUMN `name` VARCHAR(255) NOT NULL,
    ADD COLUMN `slug` VARCHAR(255) NOT NULL,
    ADD COLUMN `symbol` VARCHAR(10) NOT NULL,
    ADD COLUMN `urls` TEXT NOT NULL,
    MODIFY `id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `exchange` DROP COLUMN `createdAt`,
    DROP COLUMN `imgUrl`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `dateLaunched` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `logo` VARCHAR(255) NOT NULL,
    ADD COLUMN `makerFee` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    ADD COLUMN `takerFee` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `urls` TEXT NOT NULL,
    MODIFY `isTradingActive` BOOLEAN NOT NULL DEFAULT false;
