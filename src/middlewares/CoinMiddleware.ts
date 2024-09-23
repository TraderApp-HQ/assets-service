import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { checkUser } from "../helpers/middlewares";

// A function to validate request to get all coins
export async function validateCoinsRequest(req: Request, res: Response, next: NextFunction) {
	try {
		// check accessToken and user role
		await checkUser(req);
		const querySchema = Joi.object({
			page: Joi.number().integer().min(1).positive().default(1).label("page"),
			rowsPerPage: Joi.number()
				.integer()
				.min(1)
				.positive()
				.default(1000)
				.label("Rows per page"),
			sortBy: Joi.string().label("rank"),
			orderBy: Joi.string().label("asc"),
		});
		const { error, value } = querySchema.validate(req.query, {
			abortEarly: true,
		});

		req.query = value;

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

// A function to validate request to get a coin
export async function validateCoinRequest(req: Request, res: Response, next: NextFunction) {
	// get id from request params and convert it to integer
	const id = Number(req.params.id);

	try {
		// Joi schema to validate id req param
		const schema = Joi.object({
			id: Joi.number().required().label("Coin ID"),
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
