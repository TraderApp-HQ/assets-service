import express, { Request, Response, NextFunction } from "express";
import cors from 'cors';

const app = express();

app.listen(8000, () => {
	console.log("Server listening at port 8000");
	startServer();
});

function startServer() {
	//cors
	app.use(
		cors({
			origin: "http://localhost:3000",
			methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
		})
	);

	//parse incoming requests
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	//api routes

	//health check
	app.get("/api/v1/ping", (_req, res) => {
		res.status(200).send({ message: "pong" });
	});

	//handle errors
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
			error_message =
				"Something went wrong. Please try again after a while.";
			console.log(
				"Error name: ",
				err.name,
				"Error message: ",
				err.message
			);
		}

		res.status(statusCode).json({ status, error, error_message });
	});
}
