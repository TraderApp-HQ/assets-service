import { WSChannel } from "../config/enums";
import * as WebSocketType from "ws";

export class ChannelClient {
	private static instance: ChannelClient;
	private readonly env: string;
	private readonly clientMap: Map<string, WebSocketType.WebSocket>;

	private constructor() {
		this.env = process.env.NODE_ENV as string;
		this.clientMap = new Map();
	}

	public static getInstance(): ChannelClient {
		if (!ChannelClient.instance) {
			ChannelClient.instance = new ChannelClient();
		}

		return ChannelClient.instance;
	}

	/*
    -------------------
    ACTIVE USERS
    -------------------
    */
	async addChannelClient({
		userId,
		ws,
	}: {
		userId: string;
		ws: WebSocketType.WebSocket;
	}): Promise<void> {
		const wsKey = `${this.env}_${WSChannel.usersWs}_${userId}`;
		this.clientMap.set(wsKey, ws);
	}

	async getChannelClients(): Promise<WebSocketType.WebSocket[]> {
		const keys = Array.from(this.clientMap.keys());
		const clients = await Promise.all(
			keys.map(async (key) => {
				const client = this.clientMap.get(key);
				return client as WebSocketType.WebSocket;
			})
		);

		return clients;
	}

	async getChannelClient(userId: string): Promise<WebSocketType.WebSocket | null> {
		const wsKey = `${this.env}_${WSChannel.usersWs}_${userId}`;
		const client = this.clientMap.get(wsKey);
		return client ?? null;
	}

	async removeChannelClient(userId: string): Promise<void> {
		const wsKey = `${this.env}_${WSChannel.usersWs}_${userId}`;
		this.clientMap.delete(wsKey);
	}
}
