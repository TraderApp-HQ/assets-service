import { ChannelClient } from "../../services/ChannelClientService";
// import { RedisClient } from "../../services/RedisService";
import * as WebSocketType from "ws";

export const addUserConnectionToCache = async (ws: WebSocketType.WebSocket, userId: string) => {
	// Initialise client Map
	const channelClient = ChannelClient.getInstance();
	// const redisClient = new RedisClient();
	try {
		// Add user to redis cache
		// await redisClient.addChannelClient({ userId, ws });
		await channelClient.addChannelClient({ userId, ws });
	} catch (error) {
		console.log("Error saving client connection", error);
	}
};

export const removeUserConnectionFromCache = async (userId: string) => {
	// Initialise client Map
	// const redisCache = new RedisClient();
	const channelClient = ChannelClient.getInstance();
	try {
		// Remove user from redis cache
		// redisCache.removeChannelClient(userId);
		await channelClient.removeChannelClient(userId);
	} catch (error) {
		console.error("Error deleting client connection", error);
	}
};
