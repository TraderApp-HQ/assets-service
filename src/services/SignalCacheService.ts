import "dotenv/config";
import { FeatureFlagManager } from "../clients/SplitIOClient";
import { redisFlagUserId } from "../clients/SplitIOClient/feature-flags";
import { Exchange } from "../config/enums";
import { IRemoveSignal, ISignalOrderBook, ISignalPrice } from "../config/interfaces";
import { InMemoryClient } from "./InMemoryService";
import { RedisClient } from "./RedisService";

export interface ISignalCache {
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

export class SignalCacheClient {
	private static instance: SignalCacheClient;
	private static isRedisCacheEnabled: boolean = false;
	private static isFlagChecked: boolean = false;

	private SignalCache: ISignalCache | undefined = undefined;

	private constructor() {}

	public static async getInstance(): Promise<SignalCacheClient> {
		if (!SignalCacheClient.instance) {
			SignalCacheClient.instance = new SignalCacheClient();
			await SignalCacheClient.instance.initializeSignalCache();
		}

		return SignalCacheClient.instance;
	}

	private async initializeSignalCache(): Promise<void> {
		if (!SignalCacheClient.isFlagChecked) {
			const featureFlags = new FeatureFlagManager();
			SignalCacheClient.isRedisCacheEnabled = await featureFlags.checkToggleFlag(
				"release-redis-cache",
				redisFlagUserId
			);
			SignalCacheClient.isFlagChecked = true;
		}

		this.SignalCache = SignalCacheClient.isRedisCacheEnabled
			? RedisClient.getInstance()
			: InMemoryClient.getInstance();
	}

	public async isRedisCacheEnabled(): Promise<boolean> {
		if (!SignalCacheClient.isFlagChecked) {
			const featureFlags = new FeatureFlagManager();
			SignalCacheClient.isRedisCacheEnabled = await featureFlags.checkToggleFlag(
				"release-redis-cache",
				redisFlagUserId
			);
			SignalCacheClient.isFlagChecked = true;
		}

		return SignalCacheClient.isRedisCacheEnabled;
	}

	public async getSignalCache(): Promise<ISignalCache> {
		if (!this.SignalCache) {
			await this.initializeSignalCache();
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.SignalCache!;
	}
}
