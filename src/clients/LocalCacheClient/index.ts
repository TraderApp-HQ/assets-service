import "dotenv/config";
import { IRemoveSignal, ISignalOrderBook, ISignalPrice } from "../../config/interfaces";
import { AssetData, TradingPlatform, WSChannel } from "../../config/enums";
import { ICache } from "../../services/CacheService";

export class LocalCacheClient implements ICache {
	private static instance: LocalCacheClient;
	private readonly memoryCache: Map<string, ISignalPrice | ISignalOrderBook>;
	private readonly env: string;

	constructor() {
		this.env = process.env.NODE_ENV ?? "development";
		this.memoryCache = new Map();
	}

	private getAssetKey(
		assetType: AssetData,
		signalId: string,
		tradingPlatform: TradingPlatform
	): string {
		return `${this.env}_${WSChannel.assetsUpdateWs}_${assetType}_${signalId}_${tradingPlatform}`;
	}

	private getAssetKeys(assetType: AssetData, tradingPlatform?: TradingPlatform): string[] {
		const keys: string[] = [];

		for (const key of this.memoryCache.keys()) {
			const parts = key.split("_");

			if (parts.length !== 5) continue;

			const [env, wsType, type, , keyExchange] = parts;

			const isMatch =
				env === this.env &&
				wsType === WSChannel.assetsUpdateWs &&
				type === assetType &&
				(!tradingPlatform || keyExchange === tradingPlatform);

			if (isMatch) {
				keys.push(key);
			}
		}

		return keys;
	}

	public static getInstance(): LocalCacheClient {
		if (!LocalCacheClient.instance) {
			LocalCacheClient.instance = new LocalCacheClient();
		}

		return LocalCacheClient.instance;
	}

	public addSignalPrice({
		signalId,
		tradingPlatform,
		asset,
		assetPrice,
		timestamp,
	}: ISignalPrice): void {
		const wsKey = this.getAssetKey(AssetData.price, signalId, tradingPlatform);
		const data = {
			signalId,
			tradingPlatform,
			asset,
			assetPrice,
			timestamp: timestamp ?? Date.now(),
		};

		this.memoryCache.set(wsKey, data);
	}

	public addSignalOrderBook({
		signalId,
		tradingPlatform,
		totalSellQuantityInRange,
		totalBuyQuantityInRange,
		timestamp,
	}: ISignalOrderBook): void {
		const wsKey = this.getAssetKey(AssetData.orderBook, signalId, tradingPlatform);
		const data = {
			signalId,
			tradingPlatform,
			totalBuyQuantityInRange,
			totalSellQuantityInRange,
			timestamp: timestamp ?? Date.now(),
		};

		this.memoryCache.set(wsKey, data);
	}

	public getAllSignalsPrices(tradingPlatform?: TradingPlatform): ISignalPrice[] {
		const keys = this.getAssetKeys(AssetData.price, tradingPlatform);

		const signals = keys.flatMap((key) => {
			const assetValue = this.memoryCache.get(key);
			return assetValue ? [assetValue as ISignalPrice] : [];
		});

		return signals;
	}

	public getAllSignalsOrderBooks(tradingPlatform?: TradingPlatform): ISignalOrderBook[] {
		const keys = this.getAssetKeys(AssetData.orderBook, tradingPlatform);

		const signals = keys.flatMap((key) => {
			const assetValue = this.memoryCache.get(key);
			return assetValue ? [assetValue as ISignalOrderBook] : [];
		});

		return signals;
	}

	public removeSignalPrice({ signalId, tradingPlatform }: IRemoveSignal): void {
		this.memoryCache.delete(this.getAssetKey(AssetData.price, signalId, tradingPlatform));
	}

	public removeSignalOrderBook({ signalId, tradingPlatform }: IRemoveSignal): void {
		this.memoryCache.delete(this.getAssetKey(AssetData.orderBook, signalId, tradingPlatform));
	}

	public deleteAllCacheRecord(): void {
		this.memoryCache.clear();
	}
}
