/* eslint-disable @typescript-eslint/no-base-to-string */
import WebSocket from "ws";
import { Exchange } from "../../config/enums";
import {
	IActiveSignalsData,
	IExchangeSignalOrderBook,
	ISignalPriceData,
} from "../../config/interfaces";
import { RedisClient } from "../../services/RedisService";

const wsOptions = {
	handshakeTimeout: 30000,
};

const orderBookDepth = 20;

// A function to open websocket connections and monitor orderBook and price for asset pair
export const openBinanceWebSocketConnection = async (signal: IActiveSignalsData) => {
	// Initialise redis
	const redisCache = new RedisClient();

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
			// priceWs,
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
		console.log(
			`WebSocket connected to order book stream for ${signal.assetPair} (sell side only)`
		);
	});

	orderBookWs.on("message", (data: WebSocket.Data) => {
		const message = JSON.parse(data.toString());
		const assetOrderBook = message;

		const signalId = signal.signalId;
		const exchange = Exchange.binance;
		const signalData: IExchangeSignalOrderBook = {
			assetOrderBook,
			// orderBookWs,
			totalSellQuantityInRange: 0,
		};

		redisCache.addSignalOrderBook({ signalId, exchange, signalData });
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
