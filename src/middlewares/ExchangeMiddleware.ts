import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { checkAdmin } from "../utils/tokens";

export async function validateExchangesRequest(req: Request, _res: Response, next: NextFunction) {
	try {
		// check accessToken and admin role
		await checkAdmin(req);

		const querySchema = Joi.object({
			rowsPerPage: Joi.number().integer().min(1).positive().label("Rows per page"),
			page: Joi.number().integer().min(1).label("Page"),
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
			id: Joi.number().required().label("Exchange Id"),
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

export async function validateExchangeIdRequest(req: Request, _res: Response, next: NextFunction) {
	try {
		// check accessToken and admin role
		await checkAdmin(req);

		const schema = Joi.object({
			exchangeId: Joi.number().required().label("Exchange Id"),
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

		const exchangeId = req.params;

		const { description, isTradingActive, makerFee, takerFee } = req.body;

		const schema = Joi.object({
			exchangeId: Joi.number().required().label("Exchange Id"),
			description: Joi.string().optional().label("Description"),
			isTradingActive: Joi.boolean().optional().label("Is Trading Active"),
			makerFee: Joi.number().optional().label("Maker Fee"),
			takerFee: Joi.number().optional().label("Taker Fee"),
		});

		const data = {
			description,
			isTradingActive,
			makerFee,
			takerFee,
		};
		const { error } = schema.validate({
			exchangeId,
			data,
		});

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
