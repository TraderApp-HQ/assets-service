/* eslint-disable @typescript-eslint/promise-function-async */
import { Exchange } from "../../config/enums";
import { IActiveSignalsData, ISignalOrderBook, ISignalPrice } from "../../config/interfaces";
import { BinanceWebSocket } from "../../services/BinanceWebSocketService";
import { RedisClient } from "../../services/RedisService";
import { SignalService } from "../../services/SignalService";
import { openBinanceWebSocketConnection } from "../../websockets/BinanceWebSockets";

export const binanceSignals = async () => {
	const signalService = new SignalService();
	const redisCache = new RedisClient();
	const binanceSocketCache = BinanceWebSocket.getInstance();

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

		// Update redis cache with updated signal data from db
		const updatedSignalDataPromises = activeSignals.map((signal) => {
			const data = cachedSignalsPriceTable[signal.signalId];

			if (!data) return null;

			const { signalId, exchange, assetPrice } = data;

			return redisCache.addSignalPrice({ signalId, exchange, assetPrice, asset: signal });
		});

		// Delete stale signals price and order book from redis cache
		const pricePromises = staleSignalsPrice.map(({ signalId, exchange }) => {
			// Close stale signal's price web sockets
			binanceSocketCache.closePriceSocket(signalId);

			return redisCache.removeSignalPrice({ signalId, exchange });
		});

		const orderBookPromises = staleSignalsOrderBook.map(({ signalId, exchange }) => {
			// Close stale signal's order book web sockets
			binanceSocketCache.closeOrderBookSocket(signalId);

			return redisCache.removeSignalOrderBook({ signalId, exchange });
		});

		// make batch requests to delete stale signals from redis cache
		await Promise.all([...updatedSignalDataPromises, ...pricePromises, ...orderBookPromises]);
	} catch (error: any) {
		console.error(`Error getting asset real time prices: ${error.message}`);
	} finally {
		// Close redis connection
		redisCache.closeConnection();
	}
};
