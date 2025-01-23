import { WebsocketRequestHandler } from "express-ws";
import { addUserConnectionToCache, removeUserConnectionFromCache } from "../../helpers/signals";

export const signalsStreamHandler: WebsocketRequestHandler = async (ws, req) => {
	const userId = req.query.userId as string;

	// Add user connection to cache
	// await addUserConnectionToCache(JSON.stringify(ws), userId);
	await addUserConnectionToCache(ws, userId);
	// console.log("==================== User connection added to cache");

	ws.on("close", () => {
		// Delete user connection from cache
		removeUserConnectionFromCache(userId);
		console.log("====================== Client disconnected and deleted from cache");
	});
};
