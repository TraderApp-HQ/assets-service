-- CreateTable
CREATE TABLE `Coin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coin` VARCHAR(255) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `imgUrl` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `isTradingActive` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Currency` (
    `coinId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL,

    PRIMARY KEY (`coinId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exchange` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `imgUrl` VARCHAR(255) NOT NULL,
    `isTradingActive` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExchangePair` (
    `exchangeId` INTEGER NOT NULL,
    `coinId` INTEGER NOT NULL,
    `currencyId` INTEGER NOT NULL,

    PRIMARY KEY (`exchangeId`, `coinId`, `currencyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoinImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imgUrl` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
