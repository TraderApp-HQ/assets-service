/* eslint-disable @typescript-eslint/promise-function-async */
import Redis from "ioredis";
import { AssetData, Exchange, WSChannel } from "../config/enums";
import { IRemoveSignal, ISignalOrderBook, ISignalPrice } from "../config/interfaces";

export class RedisClient {
	private static instance: RedisClient;
	public client: Redis | null;
	private readonly env: string;

	private constructor() {
		this.env = process.env.NODE_ENV ?? "development";
		try {
			this.client = new Redis({
				host: process.env.REDIS_URL ?? "localhost",
				port: 6379,
			});

			this.client.on("ready", () => console.log("Redis connection established ✅✅✅"));

			// Handles error in redis connection
			this.client.on("error", async (err) => {
				console.error("❌ Redis connection error:", err);
				await this.closeConnection();
			});

			this.client.on("end", () => console.error("❌ Redis connection closed."));
		} catch (error) {
			console.error("⚠️ Failed to initialize Redis:", error);
			this.client = null;
		}
	}

	public static getInstance(): RedisClient {
		if (!RedisClient.instance) {
			RedisClient.instance = new RedisClient();
		}
		return RedisClient.instance;
	}

	async addSignalPrice({ signalId, exchange, asset, assetPrice, timestamp }: ISignalPrice) {
		try {
			const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_${signalId}_${exchange}`;
			const data = {
				signalId,
				exchange,
				asset,
				assetPrice,
				timestamp: timestamp ?? Date.now(),
			};
			await this.client?.set(wsKey, JSON.stringify(data));
		} catch (error) {
			console.error(`Failed to add signal(${asset.assetPair}) price to Redis:`, error);
		}
	}

	async addSignalOrderBook({
		signalId,
		exchange,
		totalSellQuantityInRange,
		totalBuyQuantityInRange,
		timestamp,
	}: ISignalOrderBook) {
		try {
			const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_${signalId}_${exchange}`;
			const data = {
				signalId,
				exchange,
				totalBuyQuantityInRange,
				totalSellQuantityInRange,
				timestamp: timestamp ?? Date.now(),
			};

			await this.client?.set(wsKey, JSON.stringify(data));
		} catch (error) {
			console.error(`Failed to add signal(${signalId}) order book to Redis:`, error);
		}
	}

	async getAllSignalsPrices(exchange?: Exchange): Promise<ISignalPrice[]> {
		const filteredKey = exchange
			? `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_*_${exchange}`
			: `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_*`;

		const keys = await this.client?.keys(filteredKey);
		const signals = keys
			? await Promise.all(
					keys.map(async (key) => {
						const keyArray = key.split("_");
						const signalId = keyArray[keyArray.length - 2];
						const exchange = keyArray[keyArray.length - 1] as Exchange;
						const assetValue = (await this.client?.get(key)) as string;
						const { asset, assetPrice, timestamp } = JSON.parse(assetValue);

						return { signalId, exchange, asset, assetPrice, timestamp };
					})
			  )
			: [];

		return signals;
	}

	async getAllSignalsOrderBooks(exchange?: string): Promise<ISignalOrderBook[]> {
		const filteredKey = exchange
			? `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_*_${exchange}`
			: `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_*`;

		const keys = await this.client?.keys(filteredKey);
		const signals = keys
			? await Promise.all(
					keys.map(async (key) => {
						const keyArray = key.split("_");
						const signalId = keyArray[keyArray.length - 2];
						const exchange = keyArray[keyArray.length - 1] as Exchange;
						const assetValue = (await this.client?.get(key)) as string;
						const { totalBuyQuantityInRange, totalSellQuantityInRange, timestamp } =
							JSON.parse(assetValue);
						return {
							signalId,
							exchange,
							totalSellQuantityInRange,
							totalBuyQuantityInRange,
							timestamp,
						};
					})
			  )
			: [];

		return signals;
	}

	async removeSignalPrice({ signalId, exchange }: IRemoveSignal): Promise<void> {
		try {
			const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.price}_${signalId}_${exchange}`;
			await this.client?.del(wsKey);
		} catch (error) {
			console.error(`Failed to remove signal price from Redis:`, error);
		}
	}

	async removeSignalOrderBook({ signalId, exchange }: IRemoveSignal): Promise<void> {
		try {
			const wsKey = `${this.env}_${WSChannel.assetsUpdateWs}_${AssetData.orderBook}_${signalId}_${exchange}`;
			await this.client?.del(wsKey);
		} catch (error) {
			console.error(`Failed to remove signal order book from Redis:`, error);
		}
	}

	async deleteAllCacheRecord(): Promise<void> {
		const key = `${this.env}_${WSChannel.assetsUpdateWs}_*`;

		const keys = await this.client?.keys(key);

		if (keys && keys?.length > 0) {
			await this.client?.unlink(...keys);
		}

		// await this.closeConnection();
	}

	async closeConnection(): Promise<void> {
		if (!this.client) return;

		try {
			await this.client.quit();
			this.client = null;
		} catch (error) {
			console.error("❌ Error closing Redis connection:", error);
		}
	}
}
