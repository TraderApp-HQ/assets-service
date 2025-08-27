import { BinanceWebSocketService } from "../services/BinanceWebSocketService";
import { CacheService } from "../services/CacheService";
import { BinanceSignalsPriceUpdateJob } from "./BinanceSignalsPriceUpdate";
import { DbPriceUpdateJob } from "./DbPriceUpdate";
import {
	BinanceAssetWebSocketHealthCheckJob,
	BinanceWebSocketsHealthCheckJob,
	RedisConnectionHealthCheckJob,
} from "./HealthCheck";

const runAllJobs = async () => {
	// Deletes all record from in-memory and redis cache if redis is used for caching
	try {
		const binanceCache = BinanceWebSocketService.getInstance();
		binanceCache.closeAllSockects();

		const cacheService = await CacheService.getInstance();
		const cache = await cacheService.getCache();
		await cache.deleteAllCacheRecord();
		console.log("============= Old records cleared from cache ===================");

		// Start all jobs
		await Promise.all([
			BinanceSignalsPriceUpdateJob(),
			DbPriceUpdateJob(),
			BinanceWebSocketsHealthCheckJob(),
			RedisConnectionHealthCheckJob(),
			BinanceAssetWebSocketHealthCheckJob(),
		]);
	} catch (error) {
		console.log("============= Error clearing cache or running jobs", error);
	}
};

export default runAllJobs;
