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
export async function getExchangeByIdHandler(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient();

		// Extract exchange ID from req params and convert to int
		const exchangeId = Number(req.params.id);

		// Find the exchange by ID
		const exchange = await db.exchange.findUnique({
			where: { id: exchangeId },
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

// Function to get the exchange with a specific asset (coin or binance)
export async function getExchangeByAssetName(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient();
		const assetName = req.params.assetName;

		const exchangeWithAsset = await db.exchangePair.findUnique({
			where: {
				currency: {
					coin: {
						name: assetName,
					},
				},
			},
		});

		// Check if the exchange with the asset exists
		if (!exchangeWithAsset) {
			const error = new Error(`No exchange found with the asset '${assetName}'`);
			error.name = RESPONSE_CODES.notFound;
			throw error;
		}

		// Return the exchange with the specified asset
		res.status(200).json(apiResponseHandler({ object: exchangeWithAsset }));
	} catch (err) {
		next(err);
	}
}

// Function to update info about an exchange
export async function updateExchangeInfo(req: Request, res: Response, next: NextFunction) {
	try {
		const db = await prismaClient();

		const exchangeId = Number(req.params.id);

		// Extract the fields to update from the request body
		const { description, isTradingActive, makerFee, takerFee } = req.body;

		// Find the exchange by ID and update the specified fields
		const updatedExchange = await db.exchange.update({
			where: { id: exchangeId },
			data: {
				description,
				isTradingActive,
				makerFee,
				takerFee,
			},
		});

		// Check if the exchange exists
		if (!updatedExchange) {
			const error = new Error("Exchange not found");
			error.name = RESPONSE_CODES.notFound;
			throw error;
		}

		// Return the updated exchange details
		res.status(200).json(apiResponseHandler({ object: updatedExchange }));
	} catch (err) {
		next(err);
	}
}

export async function currenciesByExchangeHandler(req: Request, res: Response, next: NextFunction) {
	try {
		// Get exchange id from req params and convert to int
		const exchangeId = Number(req.params.exchangeId);

		// Fetch exchangePairs for the given exchangeId
		const db = await prismaClient();
		const exchangePairs = await db.exchangePair.findMany({
			where: { exchangeId: exchangeId },
			include: {
				currency: {
					include: {
						coin: {
							select: { id: true, name: true, slug: true, logo: true },
						},
					},
				},
			},
		});

		if (exchangePairs.length === 0) {
			const error = new Error("No currencies found for the exchange");
			error.name = RESPONSE_CODES.notFound;
			throw error;
		}

		// Extract currencies from exchangePairs
		const currencies: any[] = exchangePairs.map((pair) => ({
			...pair.currency.coin,
		}));

		res.status(200).json(apiResponseHandler({ object: currencies }));
	} catch (err) {
		next(err);
	}
}
