import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllCoins() {
	//hash table for easy searching and retrieval
	const coins: { [k: string]: any } = {};

	//get all coins from db
	const allCoins = await prisma.coin.findMany();

	//put allCoins into hash Table for easy searching
	allCoins.forEach((coin: any) => {
		coins[coin.symbol] = coin.id;
	});

	return coins;
}

export async function getAllCurrencies() {
	const currencies: { [k: string]: any } = {};

	//get currencies from db
	const allCurrencies = await prisma.currency.findMany({
		include: { coin: true },
	});

	//put currencies in hash table for easy retrieval
	allCurrencies.forEach((currency: any) => {
		currencies[currency.coin?.symbol] = currency.coinId;
	});

	return currencies;
}

export async function insertExchangePairs(
	symbols: { [k: string]: any },
	exchangeId: number
) {
	const coins = await getAllCoins();
	const currencies = await getAllCurrencies();
	let pairs: any[] = [];
	let symbolsMissing: any[] = [];

	//filter out symbols not in db
	Object.entries(symbols).forEach((symbol: any) => {
		symbols[symbol[0]] = symbol[1].filter((item: any) => {
			if (coins[item]) return item;
			else symbolsMissing.push(item); //get symbols missing
		});
	});

	//group coin pairs
	Object.entries(symbols).forEach((symbol: any) => {
		const pair = symbol[1].map((item: any) => {
			return {
				exchangeId,
				coinId: coins[item],
				currencyId: currencies[symbol[0]],
			};
		});

		pairs = [...pairs, ...pair];
	});

	//remove any duplicates from symbolsMissing
	symbolsMissing = [...new Set(symbolsMissing)];

	//prepare for insertion
	symbolsMissing = symbolsMissing.map((symbol: any) => {
		return { symbol, exchangeId };
	});

	//insert pairs
	if (pairs.length) {
		await prisma.exchangePair.createMany({ data: pairs });
		console.log("Exchange pairs inserted");
	}

	if (symbolsMissing.length) {
		await prisma.coinsUnknown.createMany({ data: symbolsMissing });
		console.log("unkown coins inserted");
	}
}
