import { apiResponseHandler } from "@traderapp/shared-resources";
import { Request, Response, NextFunction } from "express";
import { ResponseMessage, ResponseType } from "../config/constants";
import { HttpStatus } from "../utils/httpStatus";
import { CoinService } from "../services/CoinService";
import { ICoin, IPagedResultData } from "../interfaces/controllers";
import { Category } from "../config/enums";

export async function getAllCoins(req: Request, res: Response, next: NextFunction) {
	const coinService: CoinService = new CoinService();
	try {
		const category = req.query.category as Category;
		const page: number = parseInt(req.query.page as string, 10) || 1;
		let rowsPerPage: number = parseInt(req.query.rowsPerPage as string, 10) || 10;
		rowsPerPage = rowsPerPage > 100 ? 100 : rowsPerPage;

		const orderBy: "asc" | "desc" = (req.query.orderBy as "asc" | "desc") || "asc";
		const sortBy: string = (req.query.sortBy as string) || "rank";

		const coinsArr = await coinService.getAllCoins({
			category,
			page,
			rowsPerPage,
			orderBy,
			sortBy,
		});

		if (!coinsArr) {
			return res.status(404).json(apiResponseHandler({ message: "No coins found." }));
		}

		// Parse URLs back to JS Object. NB: URLs were stored in the DB as strings using JSON.stringify
		const coins: ICoin[] = coinsArr.map((coin) => {
			const coinObj = coin.toObject() as ICoin;
			return { ...coinObj, urls: JSON.parse(coinObj.urls), id: coin._id };
		});

		// Assuming you have a method to count the documents, you can include it here.
		// const count = await CoinService.countActiveCoins(); // Implement this method in CoinService
		const count = 10; // Placeholder count value

		const pageCount = Math.ceil(count / rowsPerPage);

		const response: IPagedResultData = {
			currentPage: page,
			itemsCount: count,
			pageCount,
			rowsPerPage,
			sortBy,
			orderBy,
			coins,
		};

		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				object: response,
				message: ResponseMessage.GET_COINS,
			})
		);
	} catch (err: any) {
		next(err);
	}
}

//	A function to get coin, exchange and currency details for a coin
export async function getCoinById(req: Request, res: Response, next: NextFunction) {
	const coinService: CoinService = new CoinService();
	// const exchangesTable: Record<number, any> = {};
	// const currenciesTable: Record<number, any> = {};
	const exchanges: any[] = [];
	const currencies: any[] = [];

	try {
		// get coin id from req params and convert to int
		const id = Number(req.params.id);

		// const populateFields = [
		// 	{
		// 		path: "exchangePairs",
		// 		populate: [
		// 			{
		// 				path: "exchangeId",
		// 				select: "id name slug logo",
		// 			},
		// 			{
		// 				path: "currencyId",
		// 				populate: {
		// 					path: "coin",
		// 					select: "id name slug logo",
		// 				},
		// 			},
		// 		],
		// 	},
		// ];

		// fetch coin by id using the service method
		const coin: any = await coinService.getCoinById({ id });
		console.log("coins ...............", coin);

		// // loop through coin exchange pairs
		// coin?.exchagePairs.forEach((pair: any) => {
		//   // get exchanges
		//   if (!exchangesTable[pair.exchangeId]) {
		//     exchangesTable[pair.exchangeId] = true;
		//     exchanges.push({ ...pair.exchange });
		//   }

		//   // get currencies
		//   if (!currenciesTable[pair.currencyId]) {
		//     currenciesTable[pair.currencyId] = true;
		//     currencies.push({ ...pair.currency?.coin });
		//   }
		// });

		// // delete exchange pairs property from returned result
		// if (coin) {
		//   delete coin.exchagePairs;
		// }

		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				object: { ...coin.toObject(), exchanges, currencies },
				message: ResponseMessage.GET_COIN,
			})
		);
	} catch (err: any) {
		next(err);
	}
}
