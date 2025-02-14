import { BinanceWebSocketService } from "../services/BinanceWebSocketService";
import { RedisClient } from "../services/RedisService";
import { BinanceSignalsPriceUpdateJob } from "./BinanceSignalsPriceUpdate";
import { DbPriceUpdateJob } from "./DbPriceUpdate";

const runAllJobs = async () => {
	// Deletes all record from in-memory and redis cache
	try {
		const binanceCache = BinanceWebSocketService.getInstance();
		binanceCache.closeAllSockects();

		const redisCache = new RedisClient();
		await redisCache.deleteAllCacheRecord();
	} catch (error) {
		console.log("============= Error clearing cache", error);
	}

	BinanceSignalsPriceUpdateJob();
	DbPriceUpdateJob();
	// ClientSignalsPriceUpdateJob();
};

export default runAllJobs;
