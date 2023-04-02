import axios from "axios";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

//load env variables
config();

const prisma = new PrismaClient();

const CMC_API_KEY = process.env.CMC_API_KEY as string;

//start and limit for cmc api query params
const startPoints: number[] = [];
const limit = 500;

//get the first 10000 coins from cmc
const total = 5000;
let last = 1;
while (last <= total) {
	startPoints.push(last);
	last += limit;
}

//populate db with coins from cmc
startPoints.forEach((start) => {
	getCoins(start);
});

async function getCoins(start: number) {
	const coins: { [k: number]: any } = {};
	const data: any[] = [];
	const currencies: any[] = [];

	//get the first 1000 coins on coinmarketcap
	let url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?sort=cmc_rank&start=${start}&limit=${limit}`;

	try {
		//get coins
		const res = await axios({
			method: "get",
			url,
			headers: {
				Accept: "application/json",
				"X-CMC_PRO_API_KEY": CMC_API_KEY,
				"Accept-Encoding": "deflate, gzip",
			},
		});

		const result = res.data;

		//loop through coins and get id, rank, etc
		Object.values(result.data).forEach((coin: any) => {
			coins[coin.id] = {
				id: coin.id,
				rank: coin.rank,
				isActive: coin.is_active,
			};

			//get currencies. USDT etc.
			if (coin.symbol === "USDT") currencies.push({ coinId: coin.id });
		});

		const coinsArr = Object.values(coins);

		//add the first coinArr item id to the url
		let url2 = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${coinsArr[0].id}`;

		//attach the rest of coin id to url string
		for (let i = 1; i < coinsArr.length; i++) {
			url2 += `,${coinsArr[i].id}`;
		}

		//make request to get coins metadata
		const res2 = await axios({
			method: "get",
			url: url2,
			headers: {
				Accept: "application/json",
				"X-CMC_PRO_API_KEY": CMC_API_KEY,
				"Accept-Encoding": "deflate, gzip",
			},
		});

		const result2 = res2.data;

		//loop through coins
		Object.values(result2.data).forEach((coin: any) => {
			let id = coin.id;
			let name = coin.name;
			let slug = coin.slug;
			let symbol = coin.symbol;
			let description = coin.description;
			let logo = coin.logo;
			let urls = JSON.stringify(coin.urls);
			let rank = coins[id].rank;
			let isCoinActive = coins[id].isActive === 1 ? true : false;
			let dateLaunched = coin.date_launched
				? coin.date_launched
				: coin.date_added;

			data.push({
				id,
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

		//insert records into db
		if (data.length) {
			await prisma.coin.createMany({ data });

			console.log(`inserted coins from ${start} to ${start + limit}`);
		}

		//insert currencies
		if (currencies.length) {
			await prisma.currency.createMany({ data: currencies });
			console.log("currencies inserted");
		}
	} catch (err: any) {
		console.log("Error getting coins: ", err.code, err.message);
	}
}
