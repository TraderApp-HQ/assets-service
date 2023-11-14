import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../config/database";
import { IPagedResult } from "../helpers/interfaces/pageResult";

//	A function to get all coins
export async function coinsHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient()

		const page: number = parseInt(req.query.page as string) || 1;
    	const pageSize:number = parseInt(req.query.pageSize as string) || 10;
		const order = req.query.orderBy as string || 'asc';
		const sort = req.query.sort as string || 'rank';
		const offset = page <= 0 ? 0 : (page - 1) * pageSize; 

		const variable = sort 
		const orderby = {
			[variable]: order
		}

		const coinsArr: any = await db.coin.findMany({
			take: pageSize,
			skip: offset,
			orderBy: [
				orderby
			],
			where: { isTradingActive: true, isCoinActive: true },
			select: {
				id: true,
				name: true,
				symbol: true,
				rank: true,
				logo: true,
				dateLaunched: true,
				urls: true
			},
		});

		//	parse urls back to js Object. NB: Urls was stored in db as strings using JSON.stringify
		const coins = coinsArr.map((coin: any) => {
			return { ...coin, urls: JSON.parse(coin.urls) };
		});

		const count = await db.coin.count({
			where: { isTradingActive: true, isCoinActive: true },
		})

		const pageCount = Math.ceil(count / pageSize);

		const response: IPagedResult = {
			code: "00",
			isSuccessful: true,
			message: "Request processed successfully",
			data: {
			  currentPage : page,
			  itemsCount: count,
			  pageCount: pageCount,
			  rowsPerPage: pageSize,
			  sortBy: sort,
			  orderBy: order,
			  items: coins,
			}
		  }; 

		res.status(200).json(response);
	} catch (err: any) {
		next(err);
	}
}

//	A function to get coin, exchange and currency details for a coin
export async function coinHandler(req: Request, res: Response, next: NextFunction) {
	const exchangesTable: Record<number, any> = {};
	const currenciesTable: Record<number, any> = {};
	const exchanges: any[] = [];
	const currencies: any[] = [];

	try {
		//	get coin id from req params and convert to int
		const id = Number(req.params.id);

		//	fetch coin by id
		const db = await prismaClient();
		const coin: any = await db.coin.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				slug: true,
				symbol: true,
				logo: true,
				//	add exchange pair relation
				exchagePairs: {
					include: {
						//	get exchange relation
						exchange: {
							select: { id: true, name: true, slug: true, logo: true },
						},
						//	get currency relation
						currency: {
							include: {
								//	get coin relation
								coin: {
									select: { id: true, name: true, slug: true, logo: true },
								},
							},
						},
					},
				},
			},
		});

		//	loop through coin exchange pairs
		coin?.exchagePairs.forEach((pair: any) => {
			//	get exchanges
			if (!exchangesTable[pair.exchangeId]) {
				exchangesTable[pair.exchangeId] = true;
				exchanges.push({ ...pair.exchange });
			}

			//	get currencies
			if (!currenciesTable[pair.currencyId]) {
				currenciesTable[pair.currencyId] = true;
				currencies.push({ ...pair.currency?.coin });
			}
		});

		//	delete exchange pairs property from returned result
		delete coin?.exchagePairs;

		res.status(200).json({ ...coin, exchanges, currencies });
	} catch (err: any) {
		next(err);
	}
}
