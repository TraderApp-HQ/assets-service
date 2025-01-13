import { Exchange } from "../../config/enums";
import {
	ICacheSignalOrderBook,
	ICacheSignalPrice,
	IGetExchangeActiveSignalsReturn,
} from "../../config/interfaces";
import { RedisClient } from "../../services/RedisService";
import { SignalService } from "../../services/SignalService";
import { openBinanceWebSocketConnection } from "../../websockets/BinanceWebSockets";

export const binanceSignals = async () => {
	const env = process.env.NODE_ENV as string;
	const redisEndpoint = process.env.REDIS_ENDPOINT as string;
	const signalService = new SignalService();
	const redisCache = new RedisClient({ redisEndpoint, env });

	try {
		// Initialiase redords for active, cached and stale signals
		const activeSignalsTable: Record<string, IGetExchangeActiveSignalsReturn> = {};
		const cachedSignalsPriceTable: Record<string, ICacheSignalPrice> = {};
		const cachedSignalsOrderBookTable: Record<string, ICacheSignalOrderBook> = {};
		const newSignals: IGetExchangeActiveSignalsReturn[] = [];
		const staleSignalsPrice: ICacheSignalPrice[] = [];
		const staleSignalsOrderBook: ICacheSignalOrderBook[] = [];

		// Fetch active signals from db together with their supported exchanges
		const activeSignals: IGetExchangeActiveSignalsReturn[] =
			await signalService.getExchangeActiveSignals(Exchange.binance);

		// Fetch all signals prices and order books from redis cache
		const cacheSignalsPrices: ICacheSignalPrice[] = await redisCache.getAllSignalsPrices(
			Exchange.binance
		);
		const cacheSignalsOrderBooks: ICacheSignalOrderBook[] =
			await redisCache.getAllSignalsOrderBooks(Exchange.binance);

		// List active signals in hash table for active signals
		activeSignals.forEach(
			(activeSignal) => (activeSignalsTable[activeSignal.assetId] = activeSignal)
		);

		// List cache signals prices in hash table for cached signals prices
		cacheSignalsPrices.forEach(
			(priceCache) => (cachedSignalsPriceTable[priceCache.assetId] = priceCache)
		);

		// List cache signals order books in hash table for cached signals order books
		cacheSignalsOrderBooks.forEach(
			(orderBookCache) =>
				(cachedSignalsOrderBookTable[orderBookCache.assetId] = orderBookCache)
		);

		// Check for stale signals price to delete from cache
		cacheSignalsPrices.forEach((priceCache) => {
			if (!activeSignalsTable[priceCache.assetId]) staleSignalsPrice.push(priceCache);
		});

		// Check for stale signals order book to delete from cache
		cacheSignalsOrderBooks.forEach((orderBookCache) => {
			if (!activeSignalsTable[orderBookCache.assetId])
				staleSignalsOrderBook.push(orderBookCache);
		});

		// Check for new signals to add to cache
		activeSignals.forEach((activeSignal) => {
			if (
				!cachedSignalsPriceTable[activeSignal.assetId] &&
				!cachedSignalsOrderBookTable[activeSignal.assetId]
			)
				newSignals.push(activeSignal);
		});

		// Open binance web sockets to get price & order book update and save to redis
		newSignals.forEach((signal: IGetExchangeActiveSignalsReturn) => {
			openBinanceWebSocketConnection(signal);
		});

		// Delete stale signals price and order book from cache
		// eslint-disable-next-line @typescript-eslint/promise-function-async
		const pricePromises = staleSignalsPrice.map(({ assetId, exchange, assetData }) => {
			// close asset price websocket before deleting from cache
			assetData.priceWs.close();

			return redisCache.removeSignalPrice({ assetId, exchange });
		});

		// eslint-disable-next-line @typescript-eslint/promise-function-async
		const orderBookPromises = staleSignalsOrderBook.map(({ assetId, exchange, assetData }) => {
			// close asset orderbook websocket before deleting from cache
			assetData.orderBookWs.close();

			return redisCache.removeSignalOrderBook({ assetId, exchange });
		});

		// make batch requests to delete stale signals from cache
		await Promise.all([...pricePromises, ...orderBookPromises]);
	} catch (error: any) {
		console.error(`Error getting asset real time prices: ${error.message}`);
	} finally {
		// Close redis connection
		redisCache.closeConnection();
	}
};
