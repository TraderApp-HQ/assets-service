import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { DEFAULT_PAGE, DEFAULT_ROWS_PER_PAGE } from "../config/constants";
import { checkAdmin, checkUser } from "../helpers/middlewares";
import { Candlestick, SignalRisk, SignalStatus } from "../config/enums";

export async function validateCreateSignalRequest(
	req: Request,
	_res: Response,
	next: NextFunction
) {
	try {
		// check accessToken and admin role
		await checkAdmin(req);

		// Joi schema for supportedExchanges as array of ObjectId
		const supportedExchangesSchema = Joi.array()
			.items(Joi.string().required().label("Object ID"))
			.min(1)
			.required()
			.label("Supported Exchanges");

		// Joi schema for targetProfits
		const targetProfitSchema = {
			price: Joi.number().required().label("Target profit price"),
			percent: Joi.number().integer().min(1).required().label("Target profit percentage"),
			isReached: Joi.boolean().required().label("Target profit flag"),
		};

		// Joi schema for stop loss
		const stopLoss = {
			price: Joi.number().required().label("Stop loss price"),
			percent: Joi.number().integer().min(1).required().label("Stop loss percentage"),
			isReached: Joi.boolean().required().label("Stop loss flag"),
		};

		// Joi schema to validate request body
		const schema = Joi.object({
			asset: Joi.number().required().label("Asset Id"),
			baseCurrency: Joi.number().required().label("Base Currency ID"),
			supportedExchanges: supportedExchangesSchema,
			// entry: Joi.object().keys(entry).required().label("Entry"),
			entryPrice: Joi.number().required().label("Entry price"),
			stopLoss: Joi.object().keys(stopLoss).required().label("Stop loss"),
			targetProfits: Joi.array()
				.items(targetProfitSchema)
				.min(1)
				.required()
				.label("Target Profits"),
			tradeNote: Joi.string().required().label("Trade note"),
			candlestick: Joi.string()
				.valid(...Object.values(Candlestick))
				.required()
				.label("Candlestick"),
			risk: Joi.string()
				.valid(...Object.values(SignalRisk))
				.required()
				.label("Risk"),
			isSignalTradable: Joi.boolean().required(),
			chart: Joi.string().label("Chart"),
			// chart: Joi.string().base64().required().label("Chart"),
		});

		/* Validate request body.
		 ** NB: abortEarly flag means all params in request body will be validated before throwing error if any
		 */
		const { error } = schema.validate(req.body);

		if (error) {
			// strip string of double quotes
			error.message = error.message.replace(/\"/g, "");
			next(error);
			return;
		}

		next();
	} catch (err: any) {
		next(err);
	}
}

export async function validateGetAllSignalsRequest(
	req: Request,
	_res: Response,
	next: NextFunction
) {
	try {
		// check accessToken and user role
		await checkUser(req);

		const querySchema = Joi.object({
			rowsPerPage: Joi.number()
				.integer()
				.min(1)
				.positive()
				.default(DEFAULT_ROWS_PER_PAGE)
				.label("Rows per page"),
			page: Joi.number().integer().min(1).default(DEFAULT_PAGE).label("next page"),
			sortBy: Joi.string().label("createdAt"),
			sortOrder: Joi.string().label("asc"),
			keyword: Joi.string().lowercase().label("Search keyword"),
			status: Joi.custom((value: string) => {
				const validStatuses = Object.values(SignalStatus);
				const statuses = value
					.split(",")
					.map((str: string) => str.trim())
					.filter((status) => validStatuses.includes(status as SignalStatus));
				return statuses;
			}, "custom status transformation").label("status"),
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

export async function validateGetSignalsRequest(req: Request, _res: Response, next: NextFunction) {
	try {
		// check accessToken and user role
		await checkUser(req);

		const querySchema = Joi.object({
			rowsPerPage: Joi.number()
				.integer()
				.min(1)
				.positive()
				.default(DEFAULT_ROWS_PER_PAGE)
				.label("Rows per page"),
			page: Joi.number().integer().min(1).default(DEFAULT_PAGE).label("next page"),
			sortBy: Joi.string().label("createdAt"),
			sortOrder: Joi.string().label("asc"),
			keyword: Joi.string().lowercase().label("Search keyword"),
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

export async function validateGetSignalByIdRequest(
	req: Request,
	_res: Response,
	next: NextFunction
) {
	try {
		// check accessToken and user role
		await checkUser(req);

		const paramsSchema = Joi.object({
			id: Joi.string().required().label("signal id"),
		});
		const { error, value } = paramsSchema.validate(req.params, {
			abortEarly: true,
		});

		req.params = value;

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

export async function validateUpdateSignalByIdRequest(
	req: Request,
	_res: Response,
	next: NextFunction
) {
	try {
		// Check accessToken and user role
		await checkUser(req);

		const paramsSchema = Joi.object({
			id: Joi.string().required().label("signal id"),
		});

		const bodySchema = Joi.object({
			status: Joi.string()
				.valid(...Object.values(SignalStatus))
				.required()
				.label("status"),
		});

		// Validate req.params
		const { error: paramsError, value: paramsValue } = paramsSchema.validate(req.params, {
			abortEarly: true,
		});

		// Validate req.body
		const { error: bodyError, value: bodyValue } = bodySchema.validate(req.body, {
			abortEarly: true,
		});

		// If any validation errors occurred, handle them
		if (paramsError) {
			paramsError.message = `Invalid parameter: ${paramsError.message.replace(/\"/g, "")}`;
			next(paramsError);
			return;
		}

		if (bodyError) {
			bodyError.message = `Invalid status provided: ${bodyError.message.replace(/\"/g, "")}`;
			next(bodyError);
			return;
		}

		// Assign validated values back to req
		req.params = paramsValue;
		req.body = bodyValue;

		next();
	} catch (err: any) {
		next(err);
	}
}
