import "dotenv/config";
import { IRemoveSignal, ISignalOrderBook, ISignalPrice } from "../config/interfaces";
import { AssetData, Exchange, WSChannel } from "../config/enums";
import { ISignalCache } from "./SignalCacheService";

export class InMemoryClient implements ISignalCache {
	private static instance: InMemoryClient;
	private readonly memoryCache: Map<string, ISignalPrice | ISignalOrderBook>;
	private readonly env: string;

	constructor() {
		this.env = process.env.NODE_ENV ?? "development";
		this.memoryCache = new Map();
	}

	private getAssetKey(assetType: AssetData, signalId: string, exchange: Exchange): string {
		return `${this.env}_${WSChannel.assetsUpdateWs}_${assetType}_${signalId}_${exchange}`;
	}

	private getAssetKeys(assetType: AssetData, exchange?: Exchange): string[] {
		const keys: string[] = [];

		for (const key of this.memoryCache.keys()) {
			const parts = key.split("_");

			if (parts.length !== 5) continue;

			const [env, wsType, type, , keyExchange] = parts;

			const isMatch =
				env === this.env &&
				wsType === WSChannel.assetsUpdateWs &&
				type === assetType &&
				(!exchange || keyExchange === exchange);

			if (isMatch) {
				keys.push(key);
			}
		}

		return keys;
	}

	public static getInstance(): InMemoryClient {
		if (!InMemoryClient.instance) {
			InMemoryClient.instance = new InMemoryClient();
		}

		return InMemoryClient.instance;
	}

	public addSignalPrice({
		signalId,
		exchange,
		asset,
		assetPrice,
		timestamp,
	}: ISignalPrice): void {
		const wsKey = this.getAssetKey(AssetData.price, signalId, exchange);
		const data = {
			signalId,
			exchange,
			asset,
			assetPrice,
			timestamp: timestamp ?? Date.now(),
		};

		this.memoryCache.set(wsKey, data);
	}

	public addSignalOrderBook({
		signalId,
		exchange,
		totalSellQuantityInRange,
		totalBuyQuantityInRange,
		timestamp,
	}: ISignalOrderBook): void {
		const wsKey = this.getAssetKey(AssetData.orderBook, signalId, exchange);
		const data = {
			signalId,
			exchange,
			totalBuyQuantityInRange,
			totalSellQuantityInRange,
			timestamp: timestamp ?? Date.now(),
		};

		this.memoryCache.set(wsKey, data);
	}

	public getAllSignalsPrices(exchange?: Exchange): ISignalPrice[] {
		const keys = this.getAssetKeys(AssetData.price, exchange);

		const signals = keys.flatMap((key) => {
			const assetValue = this.memoryCache.get(key);
			return assetValue ? [assetValue as ISignalPrice] : [];
		});

		return signals;
	}

	public getAllSignalsOrderBooks(exchange?: Exchange): ISignalOrderBook[] {
		const keys = this.getAssetKeys(AssetData.orderBook, exchange);

		const signals = keys.flatMap((key) => {
			const assetValue = this.memoryCache.get(key);
			return assetValue ? [assetValue as ISignalOrderBook] : [];
		});

		return signals;
	}

	public removeSignalPrice({ signalId, exchange }: IRemoveSignal): void {
		this.memoryCache.delete(this.getAssetKey(AssetData.price, signalId, exchange));
	}

	public removeSignalOrderBook({ signalId, exchange }: IRemoveSignal): void {
		this.memoryCache.delete(this.getAssetKey(AssetData.orderBook, signalId, exchange));
	}

	public deleteAllCacheRecord(): void {
		this.memoryCache.clear();
	}
}
