import express, { Application, Request, Response, NextFunction } from "express";
import { apiResponseHandler, initSecrets, logger } from "@traderapp/shared-resources";
import cors from "cors";
import { config } from "dotenv";
import initDatabase from "./config/database";

import { CoinRoutes, ExchangeRoutes } from "./routes";
import secretsJson from "./env.json";
import { ENVIRONMENTS } from "./config/constants";
import swaggerUi from "swagger-ui-express";
import specs from "./utils/swagger";

config();
const app: Application = express();

const env = process.env.NODE_ENV || "development";
const suffix = ENVIRONMENTS[env] || "dev";
const secretNames = ["common-secrets", "assets-service-secrets"];

initSecrets({
	env: suffix,
	secretNames,
	secretsJson,
})
	.then(() => {
		const port = process.env.PORT as string;
		app.listen(port, async () => {
			await initDatabase();
			startServer();
			logger.log(`Server listening at port ${port}`);
			logger.log(`Docs available at http://localhost:${port}/api-docs`);
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

	// documentation
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

	// api routes
	app.use(`/coins`, CoinRoutes);
	app.use(`/exchanges`, ExchangeRoutes);

	// health check
	app.get(`/ping`, (_req, res) => {
		res.status(200).send(apiResponseHandler({ message: "pong from assets service" }));
	});

	// handle errors
	app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
		const error = err;
		let errorMessage = err.message;
		let statusCode;

		if (err.name === "ValidationError") statusCode = 400;
		else if (err.name === "Unauthorized") statusCode = 401;
		else if (err.name === "Forbidden") statusCode = 403;
		else if (err.name === "NotFound") statusCode = 404;
		else {
			statusCode = 500;
			error.name = "InternalServerError";
			errorMessage = "Something went wrong. Please try again after a while.";
			console.log("Error name: ", err.name, "Error message: ", err.message);
		}

		res.status(statusCode).json(
			apiResponseHandler({
				type: "error",
				object: error,
				message: errorMessage,
			})
		);
	});
}

export { app };
