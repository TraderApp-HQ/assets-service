import { Exchange } from "../../config/enums";
import { IActiveSignalsData, ISignalOrderBook, ISignalPrice } from "../../config/interfaces";
import { RedisClient } from "../../services/RedisService";
import { SignalService } from "../../services/SignalService";
import { openBinanceWebSocketConnection } from "../../websockets/BinanceWebSockets";

export const binanceSignals = async () => {
	const signalService = new SignalService();
	const redisCache = new RedisClient();

	try {
		// Initialiase redords for active, cached and stale signals
		const activeSignalsTable: Record<string, IActiveSignalsData> = {};
		const cachedSignalsPriceTable: Record<string, ISignalPrice> = {};
		const cachedSignalsOrderBookTable: Record<string, ISignalOrderBook> = {};
		const newSignals: IActiveSignalsData[] = [];
		const staleSignalsPrice: ISignalPrice[] = [];
		const staleSignalsOrderBook: ISignalOrderBook[] = [];

		// Fetch active signals from db together with their supported exchanges
		const activeSignals: IActiveSignalsData[] = await signalService.getExchangeActiveSignals(
			Exchange.binance
		);

		// Fetch all signals prices and order books from redis cache
		const cacheSignalsPrices: ISignalPrice[] = await redisCache.getAllSignalsPrices(
			Exchange.binance
		);
		const cacheSignalsOrderBooks: ISignalOrderBook[] = await redisCache.getAllSignalsOrderBooks(
			Exchange.binance
		);

		// List active signals in hash table for active signals
		activeSignals.forEach(
			(activeSignal) => (activeSignalsTable[activeSignal.signalId] = activeSignal)
		);

		// List cache signals prices in hash table for cached signals prices
		cacheSignalsPrices.forEach(
			(priceCache) => (cachedSignalsPriceTable[priceCache.signalId] = priceCache)
		);

		// List cache signals order books in hash table for cached signals order books
		cacheSignalsOrderBooks.forEach(
			(orderBookCache) =>
				(cachedSignalsOrderBookTable[orderBookCache.signalId] = orderBookCache)
		);

		// Check for stale signals price to delete from cache
		cacheSignalsPrices.forEach((priceCache) => {
			if (!activeSignalsTable[priceCache.signalId]) {
				staleSignalsPrice.push(priceCache);
			}
		});

		// Check for stale signals order book to delete from cache
		cacheSignalsOrderBooks.forEach((orderBookCache) => {
			if (!activeSignalsTable[orderBookCache.signalId]) {
				staleSignalsOrderBook.push(orderBookCache);
			}
		});

		// Check for new signals to add to cache
		activeSignals.forEach((activeSignal) => {
			if (
				!cachedSignalsPriceTable[activeSignal.signalId] &&
				!cachedSignalsOrderBookTable[activeSignal.signalId]
			)
				newSignals.push(activeSignal);
		});

		// Open binance web sockets to get price & order book update and save to redis
		newSignals.forEach((signal: IActiveSignalsData) => {
			openBinanceWebSocketConnection(signal);
		});

		// Delete stale signals price and order book from cache
		// eslint-disable-next-line @typescript-eslint/promise-function-async
		const pricePromises = staleSignalsPrice.map(({ signalId, exchange, signalData }) => {
			// close asset price websocket before deleting from cache
			signalData.priceWs.close();

			return redisCache.removeSignalPrice({ signalId, exchange });
		});

		const orderBookPromises = staleSignalsOrderBook.map(
			// eslint-disable-next-line @typescript-eslint/promise-function-async
			({ signalId, exchange, signalData }) => {
				// close asset orderbook websocket before deleting from cache
				signalData.orderBookWs.close();

				return redisCache.removeSignalOrderBook({ signalId, exchange });
			}
		);

		// make batch requests to delete stale signals from cache
		await Promise.all([...pricePromises, ...orderBookPromises]);
	} catch (error: any) {
		console.error(`Error getting asset real time prices: ${error.message}`);
	} finally {
		// Close redis connection
		redisCache.closeConnection();
	}
};
