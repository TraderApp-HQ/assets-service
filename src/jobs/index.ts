import { BinanceWebSocket } from "../services/BinanceWebSocketService";
import { RedisClient } from "../services/RedisService";
import { BinanceSignalsPriceUpdateJob } from "./BinanceSignalsPriceUpdate";
import { DbPriceUpdateJob } from "./DbPriceUpdate";
// import { ClientSignalsPriceUpdateJob } from "./ClientSignalsPriceUpdate";

const runAllJobs = async () => {
	// ======================================================================
	// This is for developement purpose, code is not meant for prod
	if (process.env.NODE_ENV === "development") {
		// Deletes all record from in-memory and redis cache
		const binanceCache = BinanceWebSocket.getInstance();
		binanceCache.closeAllSockects();
		console.log("============= All in-memory records deleted");

		const redisCache = new RedisClient();
		await redisCache.deleteAllCacheRecord();
		redisCache.closeConnection();
		console.log("============= All redis cache records deleted");
	}
	// ======================================================================

	BinanceSignalsPriceUpdateJob();
	DbPriceUpdateJob();
	// ClientSignalsPriceUpdateJob();
};

export default runAllJobs;
