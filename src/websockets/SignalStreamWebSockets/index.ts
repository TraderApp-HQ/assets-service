import { WebsocketRequestHandler } from "express-ws";
import { addUserConnectionToCache, removeUserConnectionFromCache } from "../../helpers/signals";

export const signalsStreamHandler: WebsocketRequestHandler = async (ws, req) => {
	const userId = req.query.userId as string;

	// Add user connection to cache
	await addUserConnectionToCache(ws, userId);

	ws.on("close", () => {
		// Delete user connection from cache
		removeUserConnectionFromCache(userId);
	});
};
