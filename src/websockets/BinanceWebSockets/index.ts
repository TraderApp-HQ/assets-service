/* eslint-disable @typescript-eslint/no-base-to-string */
import WebSocket from "ws";
import { Exchange } from "../../config/enums";
import { IActiveSignalsData, ISignalPriceData } from "../../config/interfaces";
import { RedisClient } from "../../services/RedisService";
import { BinanceWebSocket } from "../../services/BinanceWebSocketService";

const wsOptions = {
	handshakeTimeout: 30000,
};

const orderBookDepth = 20;

// A function to open websocket connections and monitor orderBook and price for asset pair
export const openBinanceWebSocketConnection = async (signal: IActiveSignalsData) => {
	// Initialise redis
	const redisCache = new RedisClient();
	const binanceSocketCache = BinanceWebSocket.getInstance();

	// order book connection object
	const orderBookWs = new WebSocket(
		`wss://stream.binance.com:9443/ws/${signal.assetPair}@depth${orderBookDepth}@1000ms`,
		wsOptions
	);

	// price connection object
	const priceWs = new WebSocket(
		`wss://stream.binance.com:9443/ws/${signal.assetPair}@ticker@1000ms`,
		wsOptions
	);

	/* ========================== PRICE =============================== */
	// read price stream
	priceWs.on("open", () => {
		// Add socket connection to in-memory cahce
		binanceSocketCache.addPriceSocket({ signalId: signal.signalId, ws: priceWs });

		console.log(`WebSocket connected to price stream for ${signal.assetPair}`);
	});

	priceWs.on("message", (data: WebSocket.Data) => {
		const message = JSON.parse(data.toString());
		const assetPrice = parseFloat(message.c);

		const signalId = signal.signalId;
		const exchange = Exchange.binance;
		const signalData: ISignalPriceData = {
			asset: signal,
			assetPrice,
		};

		// Add asset price to redis cache
		redisCache.addSignalPrice({ signalId, exchange, signalData });
	});

	priceWs.on("error", (error: Error) => {
		console.error(`WebSocket error for ${signal.assetPair} price: ${error}`);
		setTimeout(() => {
			openBinanceWebSocketConnection(signal);
		}, 5000);
	});

	priceWs.on("close", (code: number, reason: string) => {
		console.log(
			`WebSocket connection closed for ${signal.assetPair} price: ${code} - ${reason}`
		);
	});

	/* ========================== ORDER BOOK =============================== */
	orderBookWs.on("open", () => {
		// Add socket connection to in-memory cahce
		binanceSocketCache.addOrderBookSocket({ signalId: signal.signalId, ws: orderBookWs });

		console.log(
			`WebSocket connected to order book stream for ${signal.assetPair} (sell side only)`
		);
	});

	orderBookWs.on("message", (data: WebSocket.Data) => {
		const message = JSON.parse(data.toString());

		// Calculate the total quantity of sell orders within a price range
		let totalSellQuantityInRange = 0;
		for (const update of message.asks) {
			const price = parseFloat(update[0]);
			const quantity = parseFloat(update[1]);

			if (price >= signal.lowerBound && price <= signal.upperBound) {
				totalSellQuantityInRange += price * quantity;
			}
		}

		const signalId = signal.signalId;
		const exchange = Exchange.binance;

		redisCache.addSignalOrderBook({ signalId, exchange, totalSellQuantityInRange });
	});

	orderBookWs.on("error", (error: Error) => {
		console.error(`WebSocket error for ${signal.assetPair}: ${error}`);
		setTimeout(() => {
			openBinanceWebSocketConnection(signal);
		}, 5000);
	});

	orderBookWs.on("close", (code: number, reason: string) => {
		console.log(`WebSocket connection closed for ${signal.assetPair}: ${code} - ${reason}`);
	});

	// Send a ping frame every 3 minutes to keep the WebSocket connection alive
	setInterval(() => {
		orderBookWs.ping();
		priceWs.ping();
	}, 3 * 60 * 1000);
};
