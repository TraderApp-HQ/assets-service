/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import axios from "axios";
import { config } from "dotenv";
import { getAllCurrencies, insertExchangePairs } from "./helpers";

// load env variables
config();

export async function getKucoinMarkets() {
	// kucoin cmc id
	const exchangeId = 311;

	// kucoin api endpoint
	const url = "https://api.kucoin.com/api/v2/symbols";

	const symbols: { [k: string]: any } = {};

	try {
		// retrieve all currencies from db
		const currencies = await getAllCurrencies();

		// fetch from kucoin api
		const res = await axios({
			method: "get",
			url,
		});
		const result = res.data;

		// loop through and get only active markets in our speciefied currencies. E.g USDT etc
		Object.keys(currencies).forEach((currency: any) => {
			const assets: any[] = [];
			result.data?.forEach((symbol: any) => {
				if (symbol.enableTrading && symbol.quoteCurrency === currency) {
					assets.push(symbol.baseCurrency);
				}
			});

			// add assets to symbol object
			symbols[currency] = assets;
		});

		// insert exchange pairs
		await insertExchangePairs(symbols, exchangeId);
	} catch (err: any) {
		console.log("Error getting kucoin markets: ", err);
	}
}
