import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../config/database";
import { apiResponseHandler } from "@traderapp/shared-resources";
import { RESPONSE_CODES } from "../config/constants";

//	A function to get all Exchange
export async function getAllExchanges(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient();

		const page: number = parseInt(req.query.page as string) || 1;
		let rowsPerPage: number = parseInt(req.query.rowsPerPage as string) || 10;
		rowsPerPage = rowsPerPage > 100 ? 100 : rowsPerPage;

		const order = (req.query.orderBy as string) || "asc";
		const offset = page <= 0 ? 0 : (page - 1) * rowsPerPage;

		const exchanges = await db.exchange.findMany({
			take: rowsPerPage,
			skip: offset,
			orderBy: {
				name: order as "asc" | "desc",
			},
			include: {
				exchangePairs: true,
				coinsUnknown: true,
			},
		});
		res.status(200).json(apiResponseHandler({ object: exchanges }));
	} catch (err) {
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
			include: {
				exchangePairs: true,
				coinsUnknown: true,
			},
		});

		// Check if the exchange exists
		if (!exchange) {
			const error = new Error("Exchange not found");
			error.name = RESPONSE_CODES.notFound;
			throw error;
		}

		// Return the exchange details
		res.status(200).json(apiResponseHandler({ object: exchange }));
	} catch (err) {
		next(err);
	}
}
