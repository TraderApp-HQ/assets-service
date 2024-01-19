import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { checkAdmin, checkUser } from "../utils/tokens";

// A function to validate request to get all Exchange
export async function validateExchangesRequest(req: Request, _res: Response, next: NextFunction) {
	try {
		// check accessToken and admin role
		await checkAdmin(req);
		next();
	} catch (err: any) {
		next(err);
	}
}

// A function to validate request to get an Exchange by its ID
export async function validateExchangeRequest(req: Request, _res: Response, next: NextFunction) {
	// get id from request params and convert it to integer
	const id = Number(req.params.id);

	try {
		// Joi schema to validate id req param
		const schema = Joi.object({
			id: Joi.number().required().label("Exchange ID"),
		});

		// validate id param
		const { error } = schema.validate({ id });

		if (error) {
			// strip string of double quotes
			error.message = error.message.replace(/\"/g, "");
			next(error);
			return;
		}

		// check accessToken and user role
		await checkUser(req);
		next();
	} catch (err: any) {
		next(err);
	}
}
