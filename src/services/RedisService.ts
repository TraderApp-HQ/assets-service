/* eslint-disable @typescript-eslint/promise-function-async */
import Redis from "ioredis";
import { AssetData, Exchange, WSChannel } from "../config/enums";
import { IRemoveSignal, ISignalOrderBook, ISignalPrice } from "../config/interfaces";
import * as WebSocketType from "ws";

export class RedisClient {
	private readonly client: Redis;
	private readonly env: string;

	constructor() {
		this.client = new Redis({
			host: process.env.REDIS_URL,
			port: Number(process.env.REDIS_PORT),
		});
		this.env = process.env.NODE_ENV as string;
	}

	/*
    -------------------
    ACTIVE USERS
    -------------------
    */

	async addChannelClient({ userId, ws }: { userId: string; ws: string }): Promise<void> {
		const wsKey = `${this.env}_${WSChannel.usersWs}_${userId}`;
		this.client.set(wsKey, ws);
	}

	async getChannelClients(): Promise<WebSocketType[]> {
		const keys = await this.client.keys(`${this.env}_${WSChannel.usersWs}_*`);
		const clients = await Promise.all(
			keys.map(async (key) => {
				const client = await this.client.get(key);
				return JSON.parse(client ?? "") as WebSocketType;
			})
		);

		return clients;
	}

	async getChannelClient(userId: string): Promise<WebSocket | null> {
		const wsKey = `${this.env}_${WSChannel.usersWs}_${userId}`;
		const client = await this.client.get(wsKey);
		return client ? JSON.parse(client ?? "") : null;
	}

	async removeChannelClient(userId: string): Promise<void> {
		const wsKey = `${this.env}_${WSChannel.usersWs}_${userId}`;
		this.client.del(wsKey);
	}

	/*
    -------------------
    ACTIVE SIGNALS
    -------------------
    */

	async addSignalPrice({ signalId, exchange, signalData }: ISignalPrice) {
		const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_${signalId}_${exchange}`;
		await this.client.set(wsKey, JSON.stringify(signalData));
	}

	async addSignalOrderBook({
		signalId,
		exchange,
		totalSellQuantityInRange,
		totalBuyQuantityInRange,
	}: ISignalOrderBook) {
		const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_${signalId}_${exchange}`;
		const data = {
			totalBuyQuantityInRange,
			totalSellQuantityInRange,
		};
		await this.client.set(wsKey, JSON.stringify(data));
	}

	async getAllSignalsPrices(exchange?: string): Promise<ISignalPrice[]> {
		const filteredKey = exchange
			? `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_*_${exchange}`
			: `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_*`;

		const keys = await this.client.keys(filteredKey);
		const signals = await Promise.all(
			keys.map(async (key) => {
				const keyArray = key.split("_");
				const signalId = keyArray[keyArray.length - 2];
				const exchange = keyArray[keyArray.length - 1] as Exchange;
				const assetValue = (await this.client.get(key)) as string;

				return { signalId, exchange, signalData: JSON.parse(assetValue) };
			})
		);

		return signals;
	}

	async getAllSignalsOrderBooks(exchange?: string): Promise<ISignalOrderBook[]> {
		const filteredKey = exchange
			? `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_*_${exchange}`
			: `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_*`;

		const keys = await this.client.keys(filteredKey);
		const signals = await Promise.all(
			keys.map(async (key) => {
				const keyArray = key.split("_");
				const signalId = keyArray[keyArray.length - 2];
				const exchange = keyArray[keyArray.length - 1] as Exchange;
				const assetValue = (await this.client.get(key)) as string;
				const { totalBuyQuantityInRange, totalSellQuantityInRange } =
					JSON.parse(assetValue);
				return { signalId, exchange, totalSellQuantityInRange, totalBuyQuantityInRange };
			})
		);

		return signals;
	}

	async removeSignalPrice({ signalId, exchange }: IRemoveSignal): Promise<void> {
		const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_${signalId}_${exchange}`;
		await this.client.del(wsKey);
	}

	async removeSignalOrderBook({ signalId, exchange }: IRemoveSignal): Promise<void> {
		const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_${signalId}_${exchange}`;
		await this.client.del(wsKey);
	}

	async deleteAllCacheRecord() {
		const priceFilteredKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_*`;
		const orderBookFilteredKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_*`;

		const priceKeys = await this.client.keys(priceFilteredKey);
		const orderBookKeys = await this.client.keys(orderBookFilteredKey);

		const delPrice = priceKeys.map((price) => this.client.del(price));
		const delOrderBook = orderBookKeys.map((order) => this.client.del(order));

		await Promise.all([...delPrice, ...delOrderBook]);
	}

	closeConnection(): void {
		this.client.disconnect();
	}
}
