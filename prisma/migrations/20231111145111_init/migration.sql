-- CreateTable
CREATE TABLE "Coin" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "symbol" VARCHAR(255) NOT NULL,
    "logo" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "urls" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "isCoinActive" BOOLEAN NOT NULL,
    "isTradingActive" BOOLEAN NOT NULL DEFAULT true,
    "dateLaunched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "coinId" INTEGER NOT NULL,
    "isTradingActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("coinId")
);

-- CreateTable
CREATE TABLE "Exchange" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "isTradingActive" BOOLEAN NOT NULL DEFAULT false,
    "urls" TEXT NOT NULL,
    "makerFee" DOUBLE PRECISION NOT NULL,
    "takerFee" DOUBLE PRECISION NOT NULL,
    "dateLaunched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exchange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangePair" (
    "exchangeId" INTEGER NOT NULL,
    "coinId" INTEGER NOT NULL,
    "currencyId" INTEGER NOT NULL,

    CONSTRAINT "ExchangePair_pkey" PRIMARY KEY ("exchangeId","coinId","currencyId")
);

-- CreateTable
CREATE TABLE "CoinImage" (
    "id" SERIAL NOT NULL,
    "logo" VARCHAR(255) NOT NULL,

    CONSTRAINT "CoinImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinsUnknown" (
    "id" SERIAL NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "exchangeId" INTEGER NOT NULL,

    CONSTRAINT "CoinsUnknown_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Coin_symbol_idx" ON "Coin"("symbol");

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangePair" ADD CONSTRAINT "ExchangePair_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangePair" ADD CONSTRAINT "ExchangePair_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangePair" ADD CONSTRAINT "ExchangePair_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("coinId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinsUnknown" ADD CONSTRAINT "CoinsUnknown_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
