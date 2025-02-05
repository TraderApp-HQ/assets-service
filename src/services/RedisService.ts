/* eslint-disable @typescript-eslint/promise-function-async */
import Redis from "ioredis";
import { AssetData, Exchange, WSChannel } from "../config/enums";
import { IRemoveSignal, ISignalOrderBook, ISignalPrice } from "../config/interfaces";

export class RedisClient {
	private client: Redis | null = null;
	private readonly env: string;

	constructor() {
		this.env = process.env.NODE_ENV as string;
		this.client = new Redis({
			host: process.env.REDIS_URL,
			port: Number(process.env.REDIS_PORT),
			maxRetriesPerRequest: 5, // Stops reconnectiong after 5 failed attempts
		});

		this.client.on("ready", () => console.log("Redis connection established"));

		// Handles error in redis connection
		this.client.on("error", (err) => {
			console.error("Redis connection error:", err);
			this.client = null; // Mark redis as unavailable
		});
	}

	async addSignalPrice({ signalId, exchange, asset, assetPrice }: ISignalPrice) {
		if (!this.client) {
			console.warn("Redis is unavailable. Skipping operation.");
			return;
		}

		const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_${signalId}_${exchange}`;
		const data = {
			asset,
			assetPrice,
		};
		await this.client.set(wsKey, JSON.stringify(data));
	}

	async addSignalOrderBook({
		signalId,
		exchange,
		totalSellQuantityInRange,
		totalBuyQuantityInRange,
	}: ISignalOrderBook) {
		if (!this.client) {
			console.warn("Redis is unavailable. Skipping operation.");
			return;
		}

		const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_${signalId}_${exchange}`;
		const data = {
			totalBuyQuantityInRange,
			totalSellQuantityInRange,
		};

		await this.client.set(wsKey, JSON.stringify(data));
	}

	async getAllSignalsPrices(exchange?: string): Promise<ISignalPrice[]> {
		if (!this.client) {
			console.warn("Redis is unavailable. Skipping operation.");
			return [];
		}

		const filteredKey = exchange
			? `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_*_${exchange}`
			: `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_*`;

		const keys = await this.client.keys(filteredKey);
		const signals = await Promise.all(
			keys.map(async (key) => {
				const keyArray = key.split("_");
				const signalId = keyArray[keyArray.length - 2];
				const exchange = keyArray[keyArray.length - 1] as Exchange;
				const assetValue = (await this.client?.get(key)) as string;
				const { asset, assetPrice } = JSON.parse(assetValue);

				return { signalId, exchange, asset, assetPrice };
			})
		);

		return signals;
	}

	async getAllSignalsOrderBooks(exchange?: string): Promise<ISignalOrderBook[]> {
		if (!this.client) {
			console.warn("Redis is unavailable. Skipping operation.");
			return [];
		}

		const filteredKey = exchange
			? `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_*_${exchange}`
			: `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_*`;

		const keys = await this.client.keys(filteredKey);
		const signals = await Promise.all(
			keys.map(async (key) => {
				const keyArray = key.split("_");
				const signalId = keyArray[keyArray.length - 2];
				const exchange = keyArray[keyArray.length - 1] as Exchange;
				const assetValue = (await this.client?.get(key)) as string;
				const { totalBuyQuantityInRange, totalSellQuantityInRange } =
					JSON.parse(assetValue);
				return { signalId, exchange, totalSellQuantityInRange, totalBuyQuantityInRange };
			})
		);

		return signals;
	}

	async removeSignalPrice({ signalId, exchange }: IRemoveSignal): Promise<void> {
		if (!this.client) {
			console.warn("Redis is unavailable. Skipping operation.");
			return;
		}
		const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_${signalId}_${exchange}`;
		await this.client.del(wsKey);
	}

	async removeSignalOrderBook({ signalId, exchange }: IRemoveSignal): Promise<void> {
		if (!this.client) {
			console.warn("Redis is unavailable. Skipping operation.");
			return;
		}
		const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_${signalId}_${exchange}`;
		await this.client.del(wsKey);
	}

	async deleteAllCacheRecord(): Promise<void> {
		if (!this.client) {
			console.warn("Redis is unavailable. Skipping operation.");
			return;
		}

		const key = `${this.env}_${WSChannel.assetsUpdateWs}_*`;

		const keys = await this.client.keys(key);

		if (keys.length > 0) {
			await this.client.unlink(...keys);
		}

		await this.closeConnection();
	}

	async closeConnection(): Promise<void> {
		if (!this.client) {
			console.warn("Redis is unavailable. Skipping operation.");
			return;
		}
		try {
			await this.client.quit();
		} catch (error) {
			console.error("Error closing Redis connection:", error);
		}
	}
}
