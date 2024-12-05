import axios from "axios";

export async function getCoinsLatestPrice(coins: string) {
	const apiKey = process.env.CMC_API_KEY;
	const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${coins}&convert=USDT&CMC_PRO_API_KEY=${apiKey}`;

	try {
		const res = await axios.get(url);
		return res.data.data;
	} catch (error: any) {
		console.log(`Error getting coins meta data: ${error.message}`);
		throw error;
	}
}
