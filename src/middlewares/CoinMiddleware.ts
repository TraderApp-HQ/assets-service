import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { checkUser } from "../utils/tokens";

// A function to validate request to get all coins
export async function validateCoinsRequest(req: Request, res: Response, next: NextFunction) {
	try {
		//check accessToken and user role
		await checkUser(req);
		next();
	} catch (err: any) {
		next(err);
	}
}

// A function to validate request to get a coin
export async function validateCoinRequest(req: Request, res: Response, next: NextFunction) {
	//get id from request params and convert it to integer
	let id = Number(req.params.id);

	try {
		//Joi schema to validate id req param
		const schema = Joi.object({
			id: Joi.number().required().label("Coin ID"),
		});

		//validate id param
		const { error } = schema.validate({ id });

		if (error) {
			//strip string of double quotes
			error.message = error.message.replace(/\"/g, "");
			next(error);
			return;
		}

		//check accessToken and user role
		await checkUser(req);
		next();
	} catch (err: any) {
		next(err);
	}
}
