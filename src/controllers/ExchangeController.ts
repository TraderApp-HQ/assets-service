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

		const allExchanges = await db.exchange.findMany({
			take: rowsPerPage,
			skip: offset,
			orderBy: {
				name: order as "asc" | "desc",
			},
		});
		res.status(200).json(apiResponseHandler({ object: allExchanges }));
	} catch (err) {
		next(err);
	}
}

// A function to get an Exchange by ID
export async function getExchangeById(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient();

		const exchangeId = Number(req.params.id);

		const exchange = await db.exchange.findUnique({
			where: { id: exchangeId },
		});

		if (!exchange) {
			const error = new Error("Exchange not found");
			error.name = RESPONSE_CODES.notFound;
			throw error;
		}

		res.status(200).json(apiResponseHandler({ object: exchange }));
	} catch (err) {
		next(err);
	}
}

// Function to get all assets listed in a specific exchange
export async function getAllAssetsInExchange(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient();

		const exchangeId: number | undefined = req.body.exchangeId;

		if (exchangeId === undefined) {
			const error = new Error("Exchange ID is missing in the request body");
			error.name = RESPONSE_CODES.badRequest;
			throw error;
		}

		const assetsInExchange = await db.exchangePair.findMany({
			where: {
				exchangeId,
			},
		});

		if (!assetsInExchange || assetsInExchange.length === 0) {
			const error = new Error(`No assets found in the exchange with ID '${exchangeId}'`);
			error.name = RESPONSE_CODES.notFound;
			throw error;
		}

		res.status(200).json(apiResponseHandler({ object: assetsInExchange }));
	} catch (err) {
		next(err);
	}
}

// Function to update info about an exchange
export async function updateExchangeInfo(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient();

		const exchangeId = Number(req.params.id);

		const { description, isTradingActive, makerFee, takerFee } = req.body;

		const updatedExchange = await db.exchange.update({
			where: { id: exchangeId },
			data: {
				description,
				isTradingActive,
				makerFee,
				takerFee,
			},
		});

		if (!updatedExchange) {
			const error = new Error("Exchange not found");
			error.name = RESPONSE_CODES.notFound;
			throw error;
		}

		res.status(200).json(apiResponseHandler({ object: updatedExchange }));
	} catch (err) {
		next(err);
	}
}

export async function getCurrenciesForExchange(req: Request, res: Response, next: NextFunction) {
	try {
		const exchangeId = Number(req.params.exchangeId);

		const currencyId = Number(req.params.currencyId);

		const db = await prismaClient();
		const exchangePairs = await db.exchangePair.findMany({
			where: {
				exchangeId,
				currencyId,
			},
			include: {
				exchange: true,
				coin: {
					include: {
						currency: true,
					},
				},
			},
		});

		if (exchangePairs.length === 0) {
			const error = new Error("No currencies found for the exchange");
			error.name = RESPONSE_CODES.notFound;
			throw error;
		}

		res.status(200).json(apiResponseHandler({ object: exchangePairs }));
	} catch (err) {
		next(err);
	}
}
