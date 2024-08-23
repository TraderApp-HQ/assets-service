import axios from "axios";
import { config } from "dotenv";
import Exchange from "../models/Exchange";
import { TradeStatus } from "../config/enums";
// import { PrismaClient } from "@prisma/client";

// load env variables
config();

// const prisma = new PrismaClient();

const CMC_API_KEY = process.env.CMC_API_KEY as string;
const exchanges = ["binance", "kucoin"];
let url = `https://pro-api.coinmarketcap.com/v1/exchange/info?slug=${exchanges[0]}`;
const data: any[] = [];

// attach the rest of exchange items to url string
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

		// get returned values
		Object.values(result.data).forEach((exchange: any) => {
			const id = exchange.id;
			const name = exchange.name;
			const slug = exchange.slug;
			const description = exchange.description;
			const logo = exchange.logo;
			const makerFee = exchange.maker_fee;
			const takerFee = exchange.taker_fee;
			const urls = JSON.stringify(exchange.urls);
			const dateLaunched = exchange.date_launched;

			data.push({
				_id: id,
				name,
				slug,
				description,
				logo,
				makerFee,
				takerFee,
				urls,
				dateLaunched,
				status: TradeStatus.inactive,
			});
		});

		// insert records into db
		const ex = await Exchange.insertMany(data, { ordered: false });
		console.log("records inserted: ", ex);
	} catch (err: any) {
		console.log("Error getting exchanges: ", err.message);
	}
}
