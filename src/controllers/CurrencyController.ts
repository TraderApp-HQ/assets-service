import { apiResponseHandler } from "@traderapp/shared-resources";
import { Request, Response, NextFunction } from "express";
import { ResponseMessage, ResponseType } from "../config/constants";
import { HttpStatus } from "../utils/httpStatus";
import { CurrencyService } from "../services/CurrencyService";

export async function getAllCurrencies(req: Request, res: Response, next: NextFunction) {
	const currencyService: CurrencyService = new CurrencyService();
	try {
		const currencies = await currencyService.getSelectedExchanges();

		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				object: currencies,
				message: ResponseMessage.GET_CURRENCIES,
			})
		);
	} catch (err: any) {
		next(err);
	}
}
