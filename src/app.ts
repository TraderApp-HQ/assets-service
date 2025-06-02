import { apiResponseHandler, initSecrets, logger } from "@traderapp/shared-resources";
import cors from "cors";
import { config } from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import expressWs from "express-ws";
import mongoose from "mongoose";
// import initDatabase from "./config/database";

import swaggerUi from "swagger-ui-express";
import { ENVIRONMENTS } from "./config/constants";
import secretsJson from "./env.json";
import { CoinRoutes, CurrencyRoutes, ExchangeRoutes, SignalRoutes } from "./routes";
import specs from "./utils/swagger";
import runAllJobs from "./jobs";
import { RedisClient } from "./services/RedisService";

config();
const app: Application = express();
expressWs(app);

const env = process.env.NODE_ENV ?? "development";
const suffix = ENVIRONMENTS[env] ?? "dev";
const secretNames = ["common-secrets", "assets-service-secrets"];

(async function () {
	try {
		// First load environment variables
		config();

		// Then initialize secrets
		await initSecrets({
			env: suffix,
			secretNames,
			secretsJson,
		});

		// Initialize Redis connection
		const redisClient = RedisClient.getInstance();
		await redisClient.getClient(); // This will initialize the connection

		const port = process.env.PORT ?? "";
		const dbUrl = process.env.ASSETS_SERVICE_DB_URL ?? "";

		// Connect to MongoDB
		await mongoose.connect(dbUrl);

		// Start the server
		app.listen(port, () => {
			logger.log(`Server listening at port ${port}`);
			startServer();
			logger.log(`Docs available at http://localhost:${port}/api-docs`);
		});
	} catch (err) {
		logger.error(`Server startup failed: ${JSON.stringify(err)}`);
		process.exit(1);
	}
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
	// app.use("/stream", StreamsRoutes);

	// health check
	app.get(`/ping`, (_req, res) => {
		res.status(200).send(
			apiResponseHandler({
				message: `Pong!!! Assets service is running on ${env} environment now`,
			})
		);
	});

	// Start cron jobs
	runAllJobs();

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
