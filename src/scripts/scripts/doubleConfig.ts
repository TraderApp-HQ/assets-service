import mongoose from "mongoose";
import { config } from "dotenv";

// load env variables
config();
export interface ScriptConfig {
	scriptFunction: (connections: {
		conn1: mongoose.Connection;
		conn2?: mongoose.Connection;
	}) => Promise<void>;
}

export const runScript = ({ scriptFunction }: ScriptConfig): void => {
	const dbUrl1 = process.env.ASSETS_SERVICE_DB_URL ?? "";
	const dbUrl2 = process.env.ASSETS_SERVICE_DB_URL2 ?? "";

	// Create connection for the first database
	const connection1 = mongoose.createConnection(dbUrl1);

	// Create connection for the second database if URL is provided
	const connection2 = dbUrl2 ? mongoose.createConnection(dbUrl2) : null;

	const connections = [connection1];
	if (connection2) {
		connections.push(connection2);
	}

	Promise.all(connections.map(async (conn) => conn.asPromise()))
		.then(async ([conn1, conn2]) => {
			console.log("Connected to the necessary databases");
			return scriptFunction({ conn1, conn2 });
		})
		.then(() => {
			console.log("Operation finished successfully!");
		})
		.catch((err) => {
			console.error(`An error occurred: ${err}`);
		})
		.finally(() => {
			const disconnectPromises = [connection1.close()];
			if (connection2) {
				disconnectPromises.push(connection2.close());
			}

			Promise.all(disconnectPromises)
				.then(() => {
					console.log("Disconnected from the necessary databases");
				})
				.catch((err) => {
					console.error(`An error occurred while disconnecting: ${err}`);
				});
		});
};
