/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `coinimage` table. All the data in the column will be lost.
  - Added the required column `logo` to the `CoinImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `coinimage` DROP COLUMN `imgUrl`,
    ADD COLUMN `logo` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `CoinsUnknown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(10) NOT NULL,
    `exchangeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CoinsUnknown` ADD CONSTRAINT `CoinsUnknown_exchangeId_fkey` FOREIGN KEY (`exchangeId`) REFERENCES `Exchange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
