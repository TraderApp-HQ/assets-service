import { Exchange } from "../../config/enums";
import { ChannelClient } from "../../services/ChannelClientService";
import { RedisClient } from "../../clients/RedisClient";
import WebSocket, * as WebSocketType from "ws";

export const clientSignals = async () => {
	const redisCache = RedisClient.getInstance();
	const channelClient = ChannelClient.getInstance();

	try {
		// Get all web socket connection
		const clients =
			(await channelClient.getChannelClients()) as unknown as WebSocketType.WebSocket[];
		// const clients = (await redisCache.getChannelClients()) as unknown as WebSocketType[];

		// Get signals current prices
		const signalsPrice = await redisCache.getAllSignalsPrices(Exchange.binance);

		// Send prices to clients
		clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(signalsPrice));
			} else {
				throw new Error("Client connection is closed.");
			}
		});
	} catch (error: any) {
		console.error(`Error sending real time prices: ${error.message}`);
	} finally {
		// Close redis connection
		await redisCache.closeConnection();
	}
};
