import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { apiResponseHandler, initSecrets, logger } from "@traderapp/shared-resources";
import cors from "cors";
import { config } from "dotenv";
// import initDatabase from "./config/database";

import { CoinRoutes, CurrencyRoutes, ExchangeRoutes, SignalRoutes } from "./routes";
import secretsJson from "./env.json";
import { ENVIRONMENTS } from "./config/constants";
import swaggerUi from "swagger-ui-express";
import specs from "./utils/swagger";

config();
const app: Application = express();

const env = process.env.NODE_ENV ?? "development";
const suffix = ENVIRONMENTS[env] ?? "dev";
const secretNames = ["common-secrets", "assets-service-secrets"];

(async function () {
	await initSecrets({
		env: suffix,
		secretNames,
		secretsJson,
	});
	// const port = process.env.PORT ?? "";
	const port = 8082;
	const dbUrl = process.env.ASSETS_SERVICE_DB_URL ?? "";
	// connect to mongodb
	mongoose
		.connect(dbUrl)
		.then(() => {
			app.listen(port, () => {
				logger.log(`Server listening at port ${port}`);
				startServer();
				logger.log(`Docs available at http://localhost:${port}/api-docs`);
			});
		})
		.catch((err) => {
			logger.error(`Unable to connect to mongodb. Error === ${JSON.stringify(err)}`);
		});
})();

function startServer() {
	// cors
	// Define an array of allowed origins
	const allowedOrigins = [
		"http://localhost:3000",
		"http://localhost:8788",
		"https://users-dashboard-dev.traderapp.finance",
		"https://web-dashboard-dev.traderapp.finance",
		"https://www.web-dashboard-dev.traderapp.finance",
		"https://web-dashboard-staging.traderapp.finance",
		"https://www.web-dashboard-staging.traderapp.finance",
	];

	const corsOptions = {
		origin: (
			origin: string | undefined,
			callback: (error: Error | null, allow?: boolean) => void
		) => {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			} else {
				return callback(new Error(`Not allowed by CORS: ${origin}`));
			}
		},
		methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
		credentials: true, // Allow credentials
	};
	app.use(cors(corsOptions));

	// parse incoming requests
	app.use(express.urlencoded({ extended: true, limit: "8mb" }));
	app.use(express.json({ limit: "8mb" }));

	// documentation
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

	// api routes
	app.use(`/coins`, CoinRoutes);
	app.use(`/exchanges`, ExchangeRoutes);
	app.use(`/signals`, SignalRoutes);
	app.use(`/currencies`, CurrencyRoutes);

	// health check
	app.get(`/ping`, (_req, res) => {
		res.status(200).send(
			apiResponseHandler({
				message: `Pong!!! Assets service is running on ${env} environment now`,
			})
		);
	});

	// handle errors
	app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
		let errorName = err.name;
		let errorMessage = err.message;
		let statusCode;

		if (err.name === "ValidationError") statusCode = 400;
		else if (err.name === "Unauthorized") statusCode = 401;
		else if (err.name === "Forbidden") statusCode = 403;
		else if (err.name === "NotFound") statusCode = 404;
		else {
			statusCode = 500;
			errorName = "InternalServerError";
			errorMessage = "Something went wrong. Please try again after a while.";
			logger.error(`Error: , ${err}`);
		}

		res.status(statusCode).json(
			apiResponseHandler({
				type: "error",
				object: {
					statusCode,
					errorName,
					errorMessage,
				},
				message: errorMessage,
			})
		);
	});
}

export { app };
