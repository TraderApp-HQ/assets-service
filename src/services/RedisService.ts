import Redis from "ioredis";
import * as WebSocketType from "ws";

export class RedisClient {
	private readonly client: Redis;
	private readonly env: string;

	constructor(redisEndpoint: string, env: string) {
		this.client = new Redis(redisEndpoint);
		this.env = env;
	}

	/*
    -------------------
    ACTIVE USERS
    -------------------
    */
	async addClient(userId: string, endpoint: string, ws: WebSocketType): Promise<void> {
		const wsKey = `${this.env}_${endpoint}_ws_${userId}`;
		await this.client.set(wsKey, JSON.stringify(ws));
	}

	async getClients(endpoint: string): Promise<Array<{ userId: string; ws: WebSocketType }>> {
		const keys = await this.client.keys(`${this.env}_${endpoint}_ws_*`);
		const clients = await Promise.all(
			keys.map(async (key) => {
				const userId = key.replace(`${this.env}_${endpoint}_ws_`, "");
				const client = (await this.client.get(key)) as string;
				return { userId, ws: JSON.parse(client) as WebSocketType };
			})
		);

		return clients;
	}

	async getClient(userId: string, endpoint: string): Promise<WebSocketType | null> {
		const wsKey = `${this.env}_${endpoint}_ws_${userId}`;
		const client = await this.client.get(wsKey);
		return client ? JSON.parse(client) : null;
	}

	async removeClient(userId: string, endpoint: string): Promise<void> {
		const wsKey = `${this.env}_${endpoint}_ws_${userId}`;
		await this.client.del(wsKey);
	}

	/*
    -------------------
    ACTIVE SIGNALS
    -------------------
    */

	async addSignal(assetName: string, exchange: string, assetPrice: any, assetOrderBook: any) {
		const wsKey = `${this.env}_asset_${exchange}_${assetName}`;
		const data = { price: assetPrice, orderBook: assetOrderBook };
		await this.client.set(wsKey, JSON.stringify(data));
	}

	async getAllSignals(): Promise<
		Array<{
			signal: string;
			exchange: string;
			data: any;
		}>
	> {
		const keys = await this.client.keys(`${this.env}_asset_*`);
		const signals = await Promise.all(
			keys.map(async (key) => {
				const assetName = key.split("_")[-1];
				const exchange = key.split("_")[-2];
				const assetValue = (await this.client.get(key)) as string;
				return { signal: assetName, exchange, data: JSON.parse(assetValue) };
			})
		);

		return signals;
	}

	async deleteSignal(assetName: string, exchange: string) {
		const wsKey = `${this.env}_asset_${exchange}_ws_${assetName}`;
		await this.client.del(wsKey);
	}

	closeConnection(): void {
		this.client.disconnect();
	}
}
