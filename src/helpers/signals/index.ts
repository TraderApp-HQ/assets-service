import { ChannelClient } from "../../services/ChannelClientService";
import * as WebSocketType from "ws";

export const addUserConnectionToCache = async (ws: WebSocketType.WebSocket, userId: string) => {
	// Initialise client Map
	const channelClient = ChannelClient.getInstance();
	try {
		// Add user to memory
		await channelClient.addChannelClient({ userId, ws });
	} catch (error) {
		console.log("Error saving client connection", error);
	}
};

export const removeUserConnectionFromCache = async (userId: string) => {
	// Initialise client Map
	const channelClient = ChannelClient.getInstance();
	try {
		// Remove user from memory
		await channelClient.removeChannelClient(userId);
	} catch (error) {
		console.error("Error deleting client connection", error);
	}
};
