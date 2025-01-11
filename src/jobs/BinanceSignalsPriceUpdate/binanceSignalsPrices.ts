/* eslint-disable @typescript-eslint/no-unused-vars */
import { Exchange } from "../../config/enums";
import { ICacheSignal, IGetExchangeActiveSignalsReturn } from "../../config/interfaces";
import { RedisClient } from "../../services/RedisService";
import { SignalService } from "../../services/SignalService";
import { openBinanceWebSocketConnection } from "../../websockets/binanceWebSockets";

export const binanceSignalsPrices = async () => {
	const env = process.env.NODE_ENV as string;
	const redisEndpoint = "";
	const signalService = new SignalService();
	const redisCache = new RedisClient({ redisEndpoint, env });

	try {
		// Initialiase redords for active, cached and stale signals
		const activeSignalsTable: Record<string, IGetExchangeActiveSignalsReturn> = {};
		const staleSignals: ICacheSignal[] = [];

		// Fetch active signals from db together with their supported exchanges
		const activeSignals: IGetExchangeActiveSignalsReturn[] =
			await signalService.getExchangeActiveSignals(Exchange.binance);

		// list active signals in hash table
		activeSignals.forEach(
			(activeSignal) => (activeSignalsTable[activeSignal.assetId] = activeSignal)
		);

		// Fetch signals from redis cache
		const cacheSignals: ICacheSignal[] = await redisCache.getAllSignals(Exchange.binance);

		// check the stale signals to delete from cache
		cacheSignals.forEach((cacheSignal) => {
			if (!activeSignalsTable[cacheSignal.assetId]) staleSignals.push(cacheSignal);
		});

		// Open binance web sockets to get price & order book update and save to redis
		activeSignals.forEach((signal) => {
			openBinanceWebSocketConnection(signal.asset);
		});

		// add new signals to cache using Promise.all()

		// delete stale signals from cache
		staleSignals.forEach(
			async ({ assetId, exchange }) => await redisCache.removeSignal({ assetId, exchange })
		);
	} catch (error: any) {
		console.error(`Error getting asset real time prices: ${error.message}`);
	} finally {
		// Close redis connection
		redisCache.closeConnection();
	}
};
