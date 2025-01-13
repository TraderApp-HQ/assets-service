import Redis from "ioredis";
import * as WebSocketType from "ws";
import { AssetData, CacheKey, Exchange } from "../config/enums";
import {
	IAddClient,
	ICacheSignalOrderBook,
	ICacheSignalPrice,
	IClient,
	IGetClientsReturn,
	IRedisClient,
	IRemoveCacheSignal,
} from "../config/interfaces";

export class RedisClient {
	private readonly client: Redis;
	private readonly env: string;

	constructor({ redisEndpoint, env }: IRedisClient) {
		this.client = new Redis(redisEndpoint);
		this.env = env;
	}

	/*
    -------------------
    ACTIVE USERS
    -------------------
    */
	async addChannelClient({ userId, channel, ws }: IAddClient): Promise<void> {
		const wsKey = `${this.env}_${channel}_${CacheKey.clientKey}_${userId}`;
		await this.client.set(wsKey, JSON.stringify(ws));
	}

	async getChannelClients(channel: string): Promise<IGetClientsReturn[]> {
		const keys = await this.client.keys(`${this.env}_${channel}_${CacheKey.clientKey}_*`);
		const clients = await Promise.all(
			keys.map(async (key) => {
				const userId = key.replace(`${this.env}_${channel}_${CacheKey.clientKey}_`, "");
				const client = (await this.client.get(key)) as string;
				return { userId, ws: JSON.parse(client) as WebSocketType };
			})
		);

		return clients;
	}

	async getChannelClient({ userId, channel }: IClient): Promise<WebSocketType | null> {
		const wsKey = `${this.env}_${channel}_${CacheKey.clientKey}_${userId}`;
		const client = await this.client.get(wsKey);
		return client ? JSON.parse(client) : null;
	}

	async removeChannelClient({ userId, channel }: IClient): Promise<void> {
		const wsKey = `${this.env}_${channel}_${CacheKey.clientKey}_${userId}`;
		await this.client.del(wsKey);
	}

	/*
    -------------------
    ACTIVE SIGNALS
    -------------------
    */

	async addSignalPrice({ assetId, exchange, assetData }: ICacheSignalPrice) {
		const wsKey = `${this.env}_${CacheKey.assetKey}_${AssetData.price}_${exchange}_${assetId}`;
		await this.client.set(wsKey, JSON.stringify(assetData));
	}

	async addSignalOrderBook({ assetId, exchange, assetData }: ICacheSignalOrderBook) {
		const wsKey = `${this.env}_${CacheKey.assetKey}_${AssetData.order_book}_${exchange}_${assetId}`;
		await this.client.set(wsKey, JSON.stringify(assetData));
	}

	async getAllSignalsPrices(exchange?: string): Promise<ICacheSignalPrice[]> {
		const filteredKey = exchange
			? `${this.env}_${CacheKey.assetKey}_${AssetData.price}_${exchange}_*`
			: `${this.env}_${CacheKey.assetKey}_${AssetData.price}_*`;

		const keys = await this.client.keys(filteredKey);
		const signals = await Promise.all(
			keys.map(async (key) => {
				const assetId = key.split("_")[-1];
				const exchange = key.split("_")[-2] as Exchange;
				const assetValue = (await this.client.get(key)) as string;
				return { assetId, exchange, assetData: JSON.parse(assetValue) };
			})
		);

		return signals;
	}

	async getAllSignalsOrderBooks(exchange?: string): Promise<ICacheSignalOrderBook[]> {
		const filteredKey = exchange
			? `${this.env}_${CacheKey.assetKey}_${AssetData.order_book}_${exchange}_*`
			: `${this.env}_${CacheKey.assetKey}_${AssetData.order_book}_*`;

		const keys = await this.client.keys(filteredKey);
		const signals = await Promise.all(
			keys.map(async (key) => {
				const assetId = key.split("_")[-1];
				const exchange = key.split("_")[-2] as Exchange;
				const assetValue = (await this.client.get(key)) as string;
				return { assetId, exchange, assetData: JSON.parse(assetValue) };
			})
		);

		return signals;
	}

	async removeSignalPrice({ assetId, exchange }: IRemoveCacheSignal): Promise<void> {
		const wsKey = `${this.env}_${CacheKey.assetKey}_${AssetData.price}_${exchange}_${assetId}`;
		await this.client.del(wsKey);
	}

	async removeSignalOrderBook({ assetId, exchange }: IRemoveCacheSignal): Promise<void> {
		const wsKey = `${this.env}_${CacheKey.assetKey}_${AssetData.order_book}_${exchange}_${assetId}`;
		await this.client.del(wsKey);
	}

	closeConnection(): void {
		this.client.disconnect();
	}
}
