import cronjob from "node-cron";
import { SignalService } from "../../services/SignalService";
import { RedisClient } from "../../services/RedisService";

export const BinanceSignalsPriceUpdateJob = () => {
	const env = process.env.NODE_ENV as string;
	const redisEndpoint = "";
	const signalService = new SignalService();
	const redisCache = new RedisClient({ redisEndpoint, env });

	// cron job that runs every 1 minute
	cronjob.schedule("* * * * *", async () => {
		try {
			// Fetch active signals from db together with their supported exchanges
			const activeSignals = await signalService.getExchangeActiveSignals("binance");

			// Stops function execution if no active signal is found
			if (!activeSignals || activeSignals.length === 0) return;

			// Fetch signals from redis cache
			const cacheSignals = await redisCache.getAllSignals("binance");

			// // Loop out stale signal
			// const staleSignal: ICacheSignl[] = cacheSignals.filter(
			// 	(cacheSignal) =>
			// 		!activeSignals
			// 			.map((activeSignal) => activeSignal.id)
			// 			.includes(cacheSignal.assetId)
			// );

			// // Deletes stale cached signal
			// staleSignal.forEach(
			// 	async (signal) =>
			// 		await redisCache.removeSignal({
			// 			assetId: signal.assetId,
			// 			exchange: signal.exchange,
			// 		})
			// );

			// Loop through cache and delete stale signal
			cacheSignals
				.filter(
					(cacheSignal) =>
						!activeSignals
							.map((activeSignal) => activeSignal.id)
							.includes(cacheSignal.assetId)
				)
				.forEach(
					async (signal) =>
						await redisCache.removeSignal({
							assetId: signal.assetId,
							exchange: signal.exchange,
						})
				);

			// Open web sockets to get price update and save to redis
			activeSignals.forEach((signal) => {
				// Open binance web socket for the signal prices and save to redis
			});
		} catch (error: any) {
			console.error(`Error getting asset real time prices: ${error.message}`);
		} finally {
			// Close redis connection
			redisCache.closeConnection();
		}
	});
};
