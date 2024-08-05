import { apiResponseHandler } from "@traderapp/shared-resources";
import { Request, Response, NextFunction } from "express";
import {
	DEFAULT_PAGE,
	DEFAULT_ROWS_PER_PAGE,
	ResponseMessage,
	ResponseType,
} from "../config/constants";
import { ExchangeService } from "../services/ExchangeService";
import { HttpStatus } from "../utils/httpStatus";
import ExchangePairModel from "../models/ExchangePair";
import Currency from "../models/Currency";
import Coin from "../models/Coin";

export async function getAllExchanges(req: Request, res: Response, next: NextFunction) {
	const exchangeService: ExchangeService = new ExchangeService();

	try {
		const page: number = parseInt(req.query.page as string, 10) || DEFAULT_PAGE;
		const rowsPerPage: number = Math.min(
			parseInt(req.query.rowsPerPage as string, 10) || DEFAULT_ROWS_PER_PAGE,
			100
		);
		const orderBy: "asc" | "desc" = (req.query.orderBy as "asc" | "desc") || "asc";

		const exchanges = await exchangeService.getAllExchanges({
			page,
			rowsPerPage,
			orderBy,
		});

		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				object: exchanges,
				message: ResponseMessage.GET_EXCHANGES,
			})
		);
	} catch (error) {
		next(error);
	}
}

export async function getExchangeById(req: Request, res: Response, next: NextFunction) {
	const exchangeService: ExchangeService = new ExchangeService();
	try {
		const { id } = req.params;
		const exchange = await exchangeService.getExchangeById(id);

		if (!exchange) {
			return res.status(HttpStatus.BAD_REQUEST).json(
				apiResponseHandler({
					type: ResponseType.ERROR,
					object: null,
					message: ResponseMessage.EXCHANGE_NOT_FOUND,
				})
			);
		}

		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				object: exchange,
				message: ResponseMessage.GET_EXCHANGE,
			})
		);
	} catch (error) {
		next(error);
	}
}

export async function getAllAssetsInExchange(req: Request, res: Response, next: NextFunction) {
	const exchangeService: ExchangeService = new ExchangeService();
	try {
		const exchangeId = Number(req.params.exchangeId);

		const populateFields = [
			{
				path: "coinId",
				model: Coin,
			},
		];

		const assetsInExchange = await exchangeService.getManyExchangeById(
			ExchangePairModel,
			exchangeId,
			populateFields
		);
		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				object: assetsInExchange,
				message: ResponseMessage.GET_ASSETS,
			})
		);
	} catch (error) {
		next(error);
	}
}

export async function updateExchangeInfo(req: Request, res: Response, next: NextFunction) {
	const exchangeService: ExchangeService = new ExchangeService();
	try {
		const exchangeId = Number(req.params.exchangeId);

		const { description, isTradingActive, makerFee, takerFee } = req.body;

		const updateData = {
			description,
			isTradingActive,
			makerFee,
			takerFee,
		};

		const updatedExchange = await exchangeService.updateExchangeById(exchangeId, updateData);

		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				object: updatedExchange,
				message: ResponseMessage.UPDATE_EXCHANGE,
			})
		);
	} catch (err) {
		next(err);
	}
}

// Function to get all currencies in an exchange
export async function getCurrenciesForExchange(req: Request, res: Response, next: NextFunction) {
	const exchangeService: ExchangeService = new ExchangeService();
	try {
		const exchangeId = Number(req.params.exchangeId);

		// Define the populate fields if needed
		const populateFields = [
			{
				path: "currencyId",
				model: Currency,
			},
		];

		// Call the reusable function
		const exchangePairs = await exchangeService.getManyExchangeById(
			ExchangePairModel,
			exchangeId,
			populateFields
		);

		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				object: exchangePairs,
				message: ResponseMessage.GET_CURRENCIES,
			})
		);
	} catch (err) {
		next(err);
	}
}
