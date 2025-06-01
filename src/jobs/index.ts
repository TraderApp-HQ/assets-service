import { BinanceWebSocketService } from "../services/BinanceWebSocketService";
import { RedisClient } from "../services/RedisService";
import { BinanceSignalsPriceUpdateJob } from "./BinanceSignalsPriceUpdate";
import { DbPriceUpdateJob } from "./DbPriceUpdate";
import {
	BinanceWebSocketsHealthCheckJob,
	RedisConnectionHealthCheckJob,
	BinanceAssetWebSocketHealthCheckJob,
} from "./HealthCheck";

const runAllJobs = async () => {
	// Deletes all record from in-memory and redis cache
	try {
		const binanceCache = BinanceWebSocketService.getInstance();
		await binanceCache.closeAllSockects();

		const redisCache = RedisClient.getInstance();
		await redisCache.deleteAllCacheRecord();
		console.log("============= Old records cleared from cache ===================");

		BinanceSignalsPriceUpdateJob();
		DbPriceUpdateJob();
		BinanceWebSocketsHealthCheckJob();
		RedisConnectionHealthCheckJob();
		BinanceAssetWebSocketHealthCheckJob();
		// ClientSignalsPriceUpdateJob();
	} catch (error) {
		console.log("============= Error clearing cache or running jobs", error);
	}
};

export default runAllJobs;
