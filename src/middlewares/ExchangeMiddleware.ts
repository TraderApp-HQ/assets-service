import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { DEFAULT_PAGE, DEFAULT_ROWS_PER_PAGE } from "../config/constants";
import { checkAdmin, checkUser } from "../helpers/middlewares";
import { TradeStatus } from "../config/enums";

export async function validateExchangesRequest(req: Request, _res: Response, next: NextFunction) {
	try {
		// check accessToken and user role
		await checkUser(req);

		const querySchema = Joi.object({
			rowsPerPage: Joi.number()
				.integer()
				.min(1)
				.positive()
				.default(DEFAULT_ROWS_PER_PAGE)
				.label("Row per page"),
			page: Joi.number().integer().min(1).default(DEFAULT_PAGE).label("Page"),
			orderBy: Joi.string().label("asc"),
			status: Joi.string()
				.valid(...Object.values(TradeStatus))
				.label("status"),
		});
		const { error } = querySchema.validate(req.query, { abortEarly: true });

		if (error) {
			error.message = error.message.replace(/\"/g, "");
			next(error);
			return;
		}
		next();
	} catch (err: any) {
		next(err);
	}
}

export async function validateExchangeRequest(req: Request, _res: Response, next: NextFunction) {
	try {
		// check accessToken and admin role
		await checkAdmin(req);

		const schema = Joi.object({
			id: Joi.number().required().label("id"),
		});

		const { error } = schema.validate(req.params);

		if (error) {
			error.message = error.message.replace(/\"/g, "");
			next(error);
			return;
		}

		next();
	} catch (err: any) {
		next(err);
	}
}

export async function validateUpdateExchangeInfoRequest(
	req: Request,
	_res: Response,
	next: NextFunction
) {
	try {
		// check accessToken and admin role
		await checkAdmin(req);

		const exchangeId = Number(req.params.exchangeId);

		const { description, status, makerFee, takerFee } = req.body;

		const schema = Joi.object({
			exchangeId: Joi.number().required().label("Exchange Id"),
			description: Joi.string().optional().label("Description"),
			status: Joi.string()
				.valid(...Object.values(TradeStatus))
				.label("status"),
			makerFee: Joi.number().optional().label("Maker Fee"),
			takerFee: Joi.number().optional().label("Taker Fee"),
		});

		const data = {
			exchangeId,
			description,
			status,
			makerFee,
			takerFee,
		};
		const { error } = schema.validate(data);

		if (error) {
			error.message = error.message.replace(/\"/g, "");
			next(error);
			return;
		}

		next();
	} catch (err: any) {
		next(err);
	}
}

export async function validateGetSupportedExchangesRequest(
	req: Request,
	_res: Response,
	next: NextFunction
) {
	try {
		// check accessToken and user role
		await checkAdmin(req);

		const querySchema = Joi.object({
			currencyId: Joi.number().required().label("currency Id"),
			coinId: Joi.number().required().label("coin Id"),
		});
		const { error } = querySchema.validate(req.query, { abortEarly: true });

		if (error) {
			error.message = error.message.replace(/\"/g, "");
			next(error);
			return;
		}
		next();
	} catch (err: any) {
		next(err);
	}
}
