/* eslint-disable @typescript-eslint/no-base-to-string */
import WebSocket from "ws";
import {
	ICacheAssetOrderBook,
	ICacheAssetPrice,
	IGetExchangeActiveSignalsReturn,
} from "../../config/interfaces";
import { RedisClient } from "../../services/RedisService";
import { Exchange } from "../../config/enums";

const wsOptions = {
	handshakeTimeout: 30000,
};

const orderBookDepth = 20;

// A function to open websocket connections and monitor orderBook and price for asset pair
export const openBinanceWebSocketConnection = async (signal: IGetExchangeActiveSignalsReturn) => {
	// Initialise redis
	const env = process.env.NODE_ENV as string;
	const redisEndpoint = process.env.REDIS_ENDPOINT as string;
	const redisCache = new RedisClient({ redisEndpoint, env });

	// order book connection object
	const orderBookWs = new WebSocket(
		`wss://stream.binance.com:9443/ws/${signal.assetPair}@depth${orderBookDepth}@10000ms`,
		wsOptions
	);

	// price connection object
	const priceWs = new WebSocket(
		`wss://stream.binance.com:9443/ws/${signal.assetPair}@ticker@10000ms`,
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

		const assetId = signal.assetId;
		const exchange = Exchange.binance;
		const assetData: ICacheAssetPrice = {
			asset: signal,
			assetPrice,
			priceWs,
		};

		// Add asset price to redis cache
		redisCache.addSignalPrice({ assetId, exchange, assetData });
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

		const assetId = signal.assetId;
		const exchange = Exchange.binance;
		const assetData: ICacheAssetOrderBook = {
			assetOrderBook,
			orderBookWs,
			totalSellQuantityInRange: 0,
		};

		redisCache.addSignalOrderBook({ assetId, exchange, assetData });
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
