/* eslint-disable @typescript-eslint/no-base-to-string */
import WebSocket from "ws";
import { AssetData, Exchange } from "../../config/enums";
import { IActiveSignalsData } from "../../config/interfaces";
import { BinanceWebSocketService } from "../../services/BinanceWebSocketService";
import { MessageActivityService } from "../../services/MessageActivityService";
import { CacheService } from "../../services/CacheService";
import { SignalService } from "../../services/SignalService";

const wsOptions = {
	handshakeTimeout: 30000,
};

const orderBookDepth = 20;

// Map: signalId -> { asset, assetPrice, exchange }
const priceBuffer: Map<
	string,
	{ asset: IActiveSignalsData; assetPrice: number; exchange: Exchange }
> = new Map();

// Map: signalId -> { exchange, totalSellQuantityInRange, totalBuyQuantityInRange }
const orderBookBuffer: Map<
	string,
	{ exchange: Exchange; totalSellQuantityInRange: number; totalBuyQuantityInRange: number }
> = new Map();

// Flush prices to cache every 20 seconds
setInterval(async () => {
	const cache = await (await CacheService.getInstance()).getCache();
	const cacheAsset = await cache.getAllSignalsPrices(Exchange.binance);

	for (const [signalId, { asset, assetPrice, exchange }] of priceBuffer.entries()) {
		// Get asset from cache
		const signalAsset =
			cacheAsset.find((assetFromCache) => assetFromCache.signalId === signalId)?.asset ??
			asset;

		// Update the asset data based on the current price
		const signalService = new SignalService();
		const updatedAsset = signalService.computeSignalFlags(signalAsset, assetPrice);

		// Add the updated asset data and price to the cache
		await cache.addSignalPrice({
			signalId,
			exchange,
			asset: updatedAsset,
			assetPrice,
		});
	}

	priceBuffer.clear();
}, 20 * 1000);

// Flush order books to cache every 20 seconds
setInterval(async () => {
	const cache = await (await CacheService.getInstance()).getCache();
	for (const [
		signalId,
		{ exchange, totalSellQuantityInRange, totalBuyQuantityInRange },
	] of orderBookBuffer.entries()) {
		await cache.addSignalOrderBook({
			signalId,
			exchange,
			totalSellQuantityInRange,
			totalBuyQuantityInRange,
		});
	}
	orderBookBuffer.clear();
}, 20 * 1000);

// A function to open websocket connections and monitor orderBook and price for asset pair
export const openBinanceWebSocketConnection = async (signal: IActiveSignalsData) => {
	console.log("Creating Binance socket Instance for: ", signal.assetPair);
	const binanceSocketCache = BinanceWebSocketService.getInstance();

	try {
		// order book connection object
		const orderBookWs = new WebSocket(
			`wss://stream.binance.com:9443/ws/${signal.assetPair}@depth${orderBookDepth}@1000ms`,
			wsOptions
		);
		// price connection object
		const priceWs = new WebSocket(
			`wss://stream.binance.com:9443/ws/${signal.assetPair}@ticker`,
			wsOptions
		);

		/* ========================== PRICE =============================== */
		// Add socket connection to in-memory cahce
		binanceSocketCache.addPriceSocket({ signalId: signal.signalId, ws: priceWs });
		// read price stream
		priceWs.on("open", async () => {
			console.log(`WebSocket connected to price stream for ${signal.assetPair}`);
		});

		priceWs.on("message", (data: WebSocket.Data) => {
			const message = JSON.parse(data.toString()); // TODO: add typescript type for this
			const assetPrice = parseFloat(message.c);

			// Update message activity timestamp
			MessageActivityService.getInstance().updateLastMessageTimestamp(
				signal.signalId,
				AssetData.price
			);

			priceBuffer.set(signal.signalId, {
				asset: signal,
				assetPrice,
				exchange: Exchange.binance,
			});
		});

		priceWs.on("error", (error: Error) => {
			console.error(`WebSocket error for ${signal.assetPair} price: ${error}`);
		});

		priceWs.on("close", (code: number, reason: string) => {
			console.log(
				`WebSocket connection closed for ${signal.assetPair} price: ${code} - ${reason}`
			);
		});

		/* ========================== ORDER BOOK =============================== */
		// Add socket connection to in-memory cahce
		binanceSocketCache.addOrderBookSocket({ signalId: signal.signalId, ws: orderBookWs });
		orderBookWs.on("open", () => {
			console.log(`WebSocket connected to order book stream for ${signal.assetPair}`);
		});

		orderBookWs.on("message", (data: WebSocket.Data) => {
			const message = JSON.parse(data.toString());

			// Update message activity timestamp
			MessageActivityService.getInstance().updateLastMessageTimestamp(
				signal.signalId,
				AssetData.orderBook
			);

			// Calculate the total quantity of sell orders within a price range
			let totalSellQuantityInRange = 0;
			for (const update of message.asks) {
				const price = parseFloat(update[0]);
				const quantity = parseFloat(update[1]);

				if (price <= signal.entryPriceLowerBound && price >= signal.entryPriceUpperBound) {
					totalSellQuantityInRange += price * quantity;
				}
			}

			// Calculate the total quantity of buy orders within a price range
			let totalBuyQuantityInRange = 0;
			for (const update of message.bids) {
				const price = parseFloat(update[0]);
				const quantity = parseFloat(update[1]);

				if (price >= signal.entryPriceLowerBound && price <= signal.entryPriceUpperBound) {
					totalBuyQuantityInRange += price * quantity;
				}
			}

			const signalId = signal.signalId;
			const exchange = Exchange.binance;

			orderBookBuffer.set(signalId, {
				exchange,
				totalSellQuantityInRange,
				totalBuyQuantityInRange,
			});
		});

		orderBookWs.on("error", (error: Error) => {
			console.error(`WebSocket error for ${signal.assetPair} order book: ${error}`);
		});

		orderBookWs.on("close", (code: number, reason: string) => {
			console.log(`WebSocket connection closed for ${signal.assetPair}: ${code} - ${reason}`);
		});

		// Send a ping frame every 3 minutes to keep the WebSocket connection alive
		setInterval(() => {
			orderBookWs.ping();
			priceWs.ping();
		}, 3 * 60 * 1000);
	} catch (error) {
		console.error(`Catch block WebSocket error for ${signal.assetPair}: ${error}`);
	}
};
