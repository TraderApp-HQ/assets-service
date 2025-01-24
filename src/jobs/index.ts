import { RedisClient } from "../services/RedisService";
import { BinanceSignalsPriceUpdateJob } from "./BinanceSignalsPriceUpdate";
import { DbPriceUpdateJob } from "./DbPriceUpdate";
// import { ClientSignalsPriceUpdateJob } from "./ClientSignalsPriceUpdate";

const runAllJobs = async () => {
	const redisCache = new RedisClient();

	// ======================================================================
	// This is for developement purpose, code is not meant for prod
	// Deletes all record from cache
	await redisCache.deleteAllCacheRecord();
	redisCache.closeConnection();
	// ======================================================================

	BinanceSignalsPriceUpdateJob();
	DbPriceUpdateJob();
	// ClientSignalsPriceUpdateJob();
};

export default runAllJobs;
