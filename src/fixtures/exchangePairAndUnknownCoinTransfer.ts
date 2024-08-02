import { Connection } from "mongoose";
import { ExchangePairSchema } from "../models/ExchangePair";
import { UnknownCoinSchema } from "../models/UnkownCoin";

export const exchangePairAndUnknownCoinTransfer = async ({
	conn1,
	conn2,
}: {
	conn1: Connection;
	conn2?: Connection;
}) => {
	if (!conn2) {
		throw new Error("Second database connection is required for this operation.");
	}

	// fetch and inserted into exchangePair in Atlas
	const ExchangePairModel1 = conn1.model("ExchangePair", ExchangePairSchema, "exchangepairs");
	const ExchangePairModel2 = conn2.model("ExchangePair", ExchangePairSchema, "exchangepairs");

	const coins = await ExchangePairModel2.find().exec();
	console.log(`Fetched ${coins.length} ExchangePair from db1`);

	if (coins.length > 0) {
		await ExchangePairModel1.insertMany(coins);
		console.log(`Inserted ${coins.length} ExchangePair into db2`);
	}

	// fetch and inserted into UnknownCoin in Atlas
	const UnknownCoinModel1 = conn1.model("UnknownCoin", UnknownCoinSchema, "unknowncoins");
	const UnknownCoinModel2 = conn2.model("UnknownCoin", UnknownCoinSchema, "unknowncoins");

	const coins2 = await UnknownCoinModel2.find().exec();
	console.log(`Fetched ${coins2.length} UnknownCoinModel2 from db1`);

	if (coins2.length > 0) {
		await UnknownCoinModel1.insertMany(coins2);
		console.log(`Inserted ${coins2.length} UnknownCoinModel2 into db2`);
	}
};
