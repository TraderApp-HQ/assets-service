import { TradingPlatform, SignalStatus } from "../../config/enums";
import { IActiveSignalsData, ISignalOrderBook, ISignalPrice } from "../../config/interfaces";
import { BinanceWebSocketService } from "../../services/BinanceWebSocketService";
import { SignalService } from "../../services/SignalService";
import { openBinanceWebSocketConnection } from "../../websockets/BinanceWebSockets";
import { CacheService } from "../../services/CacheService";

export const binanceSignals = async () => {
	const signalService = new SignalService();
	const binanceSocketCache = BinanceWebSocketService.getInstance();
	const cacheServcie = await CacheService.getInstance();
	const cache = await cacheServcie.getCache();

	try {
		// Initialiase records for active, cached and stale signals
		const activeSignalsTable: Record<string, IActiveSignalsData> = {};
		const cachedSignalsPriceTable: Record<string, ISignalPrice> = {};
		const cachedSignalsOrderBookTable: Record<string, ISignalOrderBook> = {};
		const newSignals: IActiveSignalsData[] = [];
		const staleSignalsPrice: ISignalPrice[] = [];
		const staleSignalsOrderBook: ISignalOrderBook[] = [];

		// Fetch active signals from db together with their supported exchanges
		const activeSignals = await signalService.getTradingPlatformActiveSignals(
			TradingPlatform.binance
		);

		// Fetch all signals prices and order books from redis cache
		const cacheSignalsPrices = await cache.getAllSignalsPrices(TradingPlatform.binance);
		const cacheSignalsOrderBooks = await cache.getAllSignalsOrderBooks(TradingPlatform.binance);

		// Hash active signals in hash table for active signals
		activeSignals.forEach(
			(activeSignal) => (activeSignalsTable[activeSignal.signalId] = activeSignal)
		);

		// Hash cache signals prices in hash table for cached signals prices
		cacheSignalsPrices.forEach(
			(priceCache) => (cachedSignalsPriceTable[priceCache.signalId] = priceCache)
		);

		// Hash cache signals order books in hash table for cached signals order books
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

		// Update cache with updated signal data from db
		const updatedSignalDataPromises = activeSignals.map(async (signal) => {
			const data = cachedSignalsPriceTable[signal.signalId];

			if (!data) return null;

			const { signalId, tradingPlatform, assetPrice, timestamp, asset } = data;

			// Only update cache with data from db if the trade status from DB is "PAUSED"
			if (signal.status === SignalStatus.PAUSED) {
				await cache.addSignalPrice({
					signalId,
					tradingPlatform,
					assetPrice,
					asset: {
						...asset,
						status: signal.status,
					},
					timestamp,
				});
			}
		});

		// Delete stale signals price and order book from redis cache
		const pricePromises = staleSignalsPrice.map(async ({ signalId, tradingPlatform }) => {
			binanceSocketCache.closePriceSocket(signalId); // Binanace web socket connection
			await cache.removeSignalPrice({ signalId, tradingPlatform });
		});

		const orderBookPromises = staleSignalsOrderBook.map(
			async ({ signalId, tradingPlatform }) => {
				binanceSocketCache.closeOrderBookSocket(signalId); // Binanace web socket connection
				await cache.removeSignalOrderBook({ signalId, tradingPlatform });
			}
		);

		// make batch requests to delete stale signals from redis cache
		await Promise.all([...updatedSignalDataPromises, ...pricePromises, ...orderBookPromises]);
	} catch (error: any) {
		console.error(`Error getting asset real time prices: ${error.message}`);
	}
};
