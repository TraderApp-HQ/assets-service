import { getBinanceMarkets } from "../fixtures/binance";

async function initBinance() {
	await getBinanceMarkets();
}

void initBinance();
