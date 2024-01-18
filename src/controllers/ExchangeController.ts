import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../config/database";
import { apiResponseHandler } from "@traderapp/shared-resources";
import { IExchangeResultData } from "../helpers/interfaces/pageResult";
import { RESPONSE_CODES } from "../config/constants";

//	A function to get all Exchange
export async function exchangesHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient();

		const page: number = parseInt(req.query.page as string) || 1;
		let rowsPerPage: number = parseInt(req.query.rowsPerPage as string) || 10;
		rowsPerPage = rowsPerPage > 100 ? 100 : rowsPerPage;

		const order = (req.query.orderBy as string) || "asc";
		const offset = page <= 0 ? 0 : (page - 1) * rowsPerPage;

		const exchanges: any = await db.exchange.findMany({
			take: rowsPerPage,
			skip: offset,
			where: { isTradingActive: false },
			orderBy: {
				name: order as "asc" | "desc",
			},
			select: {
				id: true,
				name: true,
				description: true,
				slug: true,
				logo: true,
				dateLaunched: true,
				urls: true,
				makerFee: true,
				takerFee: true,
			},
		});

		//	parse urls back to js Object. NB: Urls was stored in db as strings using JSON.stringify
		const exchange = exchanges.map((exchange: any) => {
			return { ...exchange, urls: JSON.parse(exchange.urls) };
		});

		const count = await db.exchange.count({
			where: { isTradingActive: true },
		});

		const pageCount = Math.ceil(count / rowsPerPage);

		const response: IExchangeResultData = {
			currentPage: page,
			itemsCount: count,
			pageCount: pageCount,
			rowsPerPage: rowsPerPage,
			orderBy: order,
			exchange: exchange,
		};

		res.status(200).json(apiResponseHandler({ object: response }));
	} catch (err: any) {
		next(err);
	}
}

// A function to get an Exchange by ID
export async function getExchangeByIdHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient();

		// Extract exchange ID from req params and convert to int
		const exchangeId = Number(req.params.id);

		// Find the exchange by ID
		const exchange = await db.exchange.findUnique({
			where: { id: exchangeId },
			select: {
				id: true,
				name: true,
				description: true,
				slug: true,
				logo: true,
				dateLaunched: true,
				urls: true,
				makerFee: true,
				takerFee: true,
			},
		});

		// Check if the exchange exists
		if (!exchange) {
			const error = new Error("Exchange not found");
			error.name = RESPONSE_CODES.notFound;
			throw error;
		}

		// Parse URLs back to a JavaScript Object
		const parsedExchange = { ...exchange, urls: JSON.parse(exchange.urls) };

		// Return the exchange details
		res.status(200).json(apiResponseHandler({ object: parsedExchange }));
	} catch (err) {
		next(err);
	}
}
