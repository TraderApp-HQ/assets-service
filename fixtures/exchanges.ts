import axios from "axios";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

//load env variables
config();

const prisma = new PrismaClient();

const CMC_API_KEY = process.env.CMC_API_KEY as string;
const exchanges = ["binance", "kucoin"];
let url = `https://pro-api.coinmarketcap.com/v1/exchange/info?slug=${exchanges[0]}`;
const data: any[] = [];

//attach the rest of exchange items to url string
for (let i = 1; i < exchanges.length; i++) {
	url += `,${exchanges[i]}`;
}

export async function getExchanges() {
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

		const result = res.data;

		//get returned values
		Object.values(result.data).forEach((exchange: any) => {
			let id = exchange.id;
			let name = exchange.name;
			let slug = exchange.slug;
			let description = exchange.description;
			let logo = exchange.logo;
			let makerFee = exchange.maker_fee;
			let takerFee = exchange.taker_fee;
			let urls = JSON.stringify(exchange.urls);
			let dateLaunched = exchange.date_launched;

			data.push({
				id,
				name,
				slug,
				description,
				logo,
				makerFee,
				takerFee,
				urls,
				dateLaunched,
			});
		});

		//insert records into db
		const ex = await prisma.exchange.createMany({ data });
		console.log("records inserted: ", ex);
	} catch (err: any) {
		console.log("Error getting exchanges: ", err.message);
	}
}

getExchanges();
