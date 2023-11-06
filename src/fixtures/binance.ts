import axios from "axios";
import { config } from "dotenv";
import { getAllCurrencies, insertExchangePairs } from "./helpers";

// load env variables
config();

export async function getBinanceMarkets() {
	// binance cmc id
	const exchangeId = 270;

	// binance api endpoint
	const url = "https://api.binance.com/api/v3/exchangeInfo";

	const symbols: Record<string, any> = {};

	try {
		// retrieve all currencies from db
		const currencies = await getAllCurrencies();

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
		await insertExchangePairs(symbols, exchangeId);
	} catch (err: any) {
		console.log("Error getting binance markets: ", err);
	}
}
