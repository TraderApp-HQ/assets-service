import "dotenv/config";
import { FeatureFlagManager } from "../clients/SplitIOClient";
import { redisFlagUserId } from "../clients/SplitIOClient/feature-flags";
import { Exchange } from "../config/enums";
import { IRemoveSignal, ISignalOrderBook, ISignalPrice } from "../config/interfaces";
import { RedisClient } from "../clients/RedisClient";
import { LocalCacheClient } from "../clients/LocalCacheClient";

export interface ICache {
	addSignalPrice: (data: ISignalPrice) => void | Promise<void>;
	addSignalOrderBook: (data: ISignalOrderBook) => void | Promise<void>;
	getAllSignalsPrices: (exchange?: Exchange) => ISignalPrice[] | Promise<ISignalPrice[]>;
	getAllSignalsOrderBooks: (
		exchange?: Exchange
	) => ISignalOrderBook[] | Promise<ISignalOrderBook[]>;
	removeSignalPrice: (data: IRemoveSignal) => void | Promise<void>;
	removeSignalOrderBook: (data: IRemoveSignal) => void | Promise<void>;
	deleteAllCacheRecord: () => void | Promise<void>;
}

export class CacheService {
	private static instance: CacheService;
	private static isRedisCacheEnabled: boolean = false;
	private static isFlagChecked: boolean = false;

	private Cache: ICache | undefined = undefined;

	private constructor() {}

	public static async getInstance(): Promise<CacheService> {
		if (!CacheService.instance) {
			CacheService.instance = new CacheService();
			await CacheService.instance.initializeSignalCache();
		}

		return CacheService.instance;
	}

	private async initializeSignalCache(): Promise<void> {
		if (!CacheService.isFlagChecked) {
			const featureFlags = new FeatureFlagManager();
			CacheService.isRedisCacheEnabled = await featureFlags.checkToggleFlag(
				"release-redis-cache",
				redisFlagUserId
			);
			CacheService.isFlagChecked = true;
		}

		this.Cache = CacheService.isRedisCacheEnabled
			? RedisClient.getInstance()
			: LocalCacheClient.getInstance();
	}

	public async isRedisCacheEnabled(): Promise<boolean> {
		if (!CacheService.isFlagChecked) {
			const featureFlags = new FeatureFlagManager();
			CacheService.isRedisCacheEnabled = await featureFlags.checkToggleFlag(
				"release-redis-cache",
				redisFlagUserId
			);
			CacheService.isFlagChecked = true;
		}

		return CacheService.isRedisCacheEnabled;
	}

	public async getCache(): Promise<ICache> {
		if (!this.Cache) {
			await this.initializeSignalCache();
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.Cache!;
	}
}
