/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/naming-convention */
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "dotenv";
import initSecrets from "./config/secrets";
import initDatabase from "./config/database";

import { CoinRoutes } from "./routes";
import { PrismaClient } from "@prisma/client";
import logger from "./logger/logger";

config();

const app: Application = express();

initSecrets()
	.then(() => {
		const port = process.env.PORT;
		app.listen(port, async () => {
			await initDatabase();
			startServer();
			logger.log(`Server listening at port ${port}`);
		});
	})
	.catch((err) => {
		logger.log(`Error getting secrets. === ${JSON.stringify(err)}`);
		throw err;
	});

function startServer() {
	// cors
	app.use(
		cors({
			origin: "http://localhost:3000",
			methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
		})
	);

	// parse incoming requests
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	// api routes
	app.use(`/coins`, CoinRoutes);

	// health check
	app.get(`/ping`, (_req, res) => {
		res.status(200).send({ message: "pong" });
	});

	// handle errors
	app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
		const status = "ERROR";
		let error = err.name;
		let error_message = err.message;
		let statusCode;

		if (err.name === "ValidationError") statusCode = 400;
		else if (err.name === "Unauthorized") statusCode = 401;
		else if (err.name === "Forbidden") statusCode = 403;
		else if (err.name === "NotFound") statusCode = 404;
		else {
			statusCode = 500;
			error = "InternalServerError";
			error_message = "Something went wrong. Please try again after a while.";
			console.log("Error name: ", err.name, "Error message: ", err.message);
		}

		res.status(statusCode).json({ status, error, error_message });
	});

	new PrismaClient().$use(async (params, next) => {
		if (params.action === 'findMany') {logger.log(params)
			const skip = params.args.skip || 0;
			const take = params.args.take || 30;
			const offset = skip <= 0 ? 0 : (skip - 1) * take; 
			params.args.skip = offset;
		  }
		return next(params)
	  });
}

export { app };
