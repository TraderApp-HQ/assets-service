import mongoose from "mongoose";

interface ScriptConfig {
	scriptFunction: () => Promise<void>;
}

export const runScript = ({ scriptFunction }: ScriptConfig): void => {
	const dbUrl = process.env.ASSETS_SERVICE_DB_URL ?? "";

	mongoose
		.connect(dbUrl)
		.then(async () => {
			console.log("Connected to db");
			return scriptFunction();
		})
		.then(() => {
			console.log("Operation finished successfully!");
		})
		.catch((err) => {
			console.error(`An error occurred: ${err}`);
		})
		.finally(() => {
			mongoose.disconnect().then(() => {
				console.log("Disconnected from db");
			});
		});
};
