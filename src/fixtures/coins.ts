/* eslint-disable no-unneeded-ternary */
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios from "axios";
import { config } from "dotenv";
import Coin from "../models/Coin";
import Currency from "../models/Currency";
// import { PrismaClient } from "@prisma/client";

// load env variables
config();

// const prisma = new PrismaClient();

const CMC_API_KEY = process.env.CMC_API_KEY as string;
const limit = 500; // Batch size

export async function initCoins() {
	// start and limit for cmc api query params
	const startPoints: number[] = [];

	// total number of coins to get from cmc
	const total = 5000;
	let last = 1;
	while (last <= total) {
		startPoints.push(last);
		last += limit;
	}

	// Helper function to retrieve coins with a delay
	const retrieveCoinsWithDelay = async (start: number) => {
		await getCoins(start);
		return new Promise((resolve) => setTimeout(resolve, 30000)); // Wait for 1 minute (60,000 milliseconds)
	};

	// Using async/await to iterate over startPoints with a delay
	for (const start of startPoints) {
		await retrieveCoinsWithDelay(start);
	}
}

async function getCoinsRequest(url: string) {
	try {
		const res = await axios({
			method: "get",
			url,
			headers: {
				Accept: "application/json",
				"X-CMC_PRO_API_KEY": CMC_API_KEY,
				"Accept-Encoding": "deflate, gzip",
			},
		});
		return res.data;
	} catch (error: any) {
		console.log(`Error on getting coins request: ${error.message}`);
		throw error;
	}
}

async function getCoinsMetadata(url: string) {
	try {
		const res = await axios({
			method: "get",
			url,
			headers: {
				Accept: "application/json",
				"X-CMC_PRO_API_KEY": CMC_API_KEY,
				"Accept-Encoding": "deflate, gzip",
			},
		});
		return res.data;
	} catch (error: any) {
		console.log(`Error getting coins meta data: ${error.message}`);
		throw error;
	}
}

async function getCoins(start: number) {
	const coins: { [k: number]: any } = {};
	const data: any[] = [];
	const currencies: any[] = [];

	// get the first 1000 coins on coinmarketcap
	const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?sort=cmc_rank&start=${start}&limit=${limit}`;
	console.log(`Getting coins from ${start} to ${start + limit}`);

	try {
		// get coins
		const result = await getCoinsRequest(url);

		// loop through coins and get id, rank, etc
		Object.values(result.data).forEach((coin: any) => {
			coins[coin.id] = {
				id: coin.id,
				rank: coin.rank,
				isActive: coin.is_active,
			};

			// get currencies. USDT etc.
			if (coin.symbol === "USDT" || coin.symbol === "BTC" || coin.symbol === "ETH") {
				currencies.push({ _id: coin.id, name: coin.name, symbol: coin.symbol });
			}
		});

		const coinsArr = Object.values(coins);

		// add the first coinArr item id to the url
		let url2 = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${coinsArr[0].id}`;

		// attach the rest of coin id to url string
		for (let i = 1; i < coinsArr.length; i++) {
			url2 += `,${coinsArr[i].id}`;
		}

		// make request to get coins metadata
		const result2 = await getCoinsMetadata(url2);
		Object.values(result2.data).forEach((coin: any) => {
			const id = coin.id;
			const name = coin.name;
			const slug = coin.slug;
			const symbol = coin.symbol;
			const description = coin.description;
			const logo = coin.logo;
			const urls = JSON.stringify(coin.urls);
			const rank = coins[id].rank;
			const isCoinActive = coins[id].isActive === 1 ? true : false;
			const dateLaunched = coin.date_launched ? coin.date_launched : coin.date_added;

			data.push({
				_id: id,
				name,
				slug,
				symbol,
				description,
				logo,
				urls,
				dateLaunched,
				isCoinActive,
				rank,
			});
		});

		// insert records into db
		if (data.length) {
			await Coin.insertMany(data, { ordered: false });
			console.log(`inserted ${data.length} coins from ${start} to ${start + limit}`);
		}

		// insert currencies
		if (currencies.length) {
			await Currency.insertMany(currencies, { ordered: false });
			console.log("currencies inserted");
		}
	} catch (err: any) {
		console.log("Error getting coins: ", err.code, err.message);
		console.log(`Error inserting coins from ${start} to ${start + limit}`);
	}
}
