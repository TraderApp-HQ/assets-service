import axios from "axios";
import { config } from "dotenv";
import { getAllCurrencies, getTradingPlatformData, insertTradingPlatformPairs } from "./helpers";

// load env variables
config();

export async function getBinanceMarkets() {
	// binance api endpoint
	const url = "https://api.binance.com/api/v3/exchangeInfo";

	const symbols: Record<string, any> = {};

	try {
		// retrieve all currencies & binance data from db
		const [currencies, platform] = await Promise.all([
			getAllCurrencies(),
			getTradingPlatformData("binance"),
		]);

		// fetch from binance api
		const res = await axios.get(url);
		const result = res.data;

		// loop through and get only active markets in our speciefied currencies. E.g USDT etc
		Object.keys(currencies).forEach((currency: any) => {
			const assets: any[] = [];
			result.symbols?.forEach((symbol: any) => {
				if (symbol.status === "TRADING" && symbol.quoteAsset === currency) {
					assets.push(symbol.baseAsset);
				}
			});

			// add assets to symbol object
			symbols[currency] = assets;
		});

		// insert exchange pairs
		await insertTradingPlatformPairs(symbols, platform);
	} catch (err: any) {
		console.log("Error getting binance markets: ", err.message);
	}
}
