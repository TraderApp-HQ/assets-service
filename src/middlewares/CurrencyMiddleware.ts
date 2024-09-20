import { Request, Response, NextFunction } from "express";
import { checkUser } from "../helpers/middlewares";

export async function validateCurrenciesRequest(req: Request, res: Response, next: NextFunction) {
	try {
		// check accessToken and user role
		await checkUser(req);
		next();
	} catch (err: any) {
		next(err);
	}
}
