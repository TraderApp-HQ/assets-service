-- AlterTable
ALTER TABLE `coin` MODIFY `isTradingActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `currency` MODIFY `isActive` BOOLEAN NOT NULL DEFAULT true;
