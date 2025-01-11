/* eslint-disable @typescript-eslint/no-base-to-string */
import WebSocket from "ws";

const wsOptions = {
	handshakeTimeout: 30000,
};

const orderBookDepth = 20;

// A function to open websocket connections and monitor orderBook and price for symbol pair
export const openBinanceWebSocketConnection = async (symbol: string) => {
	// order book connection object
	const orderBookWs = new WebSocket(
		`wss://stream.binance.com:9443/ws/${symbol}@depth${orderBookDepth}@1000ms`,
		wsOptions
	);

	// price connection object
	const priceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@ticker`, wsOptions);

	/* ========================== PRICE =============================== */
	// read price stream
	priceWs.on("open", () => {
		console.log(`WebSocket connected to price stream for ${symbol}`);
	});

	priceWs.on("message", (data: WebSocket.Data) => {
		const message = JSON.parse(data.toString());
		const assetPrice = parseFloat(message.c);

		// Save price to redis cache
		console.log(`Price for ${symbol}`, assetPrice);
	});

	priceWs.on("error", (error: Error) => {
		console.error(`WebSocket error for ${symbol} price: ${error}`);
		setTimeout(() => {
			openBinanceWebSocketConnection(symbol);
		}, 5000);
	});

	priceWs.on("close", (code: number, reason: string) => {
		console.log(`WebSocket connection closed for ${symbol} price: ${code} - ${reason}`);
	});

	/* ========================== ORDER BOOK =============================== */
	orderBookWs.on("open", () => {
		console.log(`WebSocket connected to order book stream for ${symbol} (sell side only)`);
	});

	orderBookWs.on("message", (data: WebSocket.Data) => {
		const message = JSON.parse(data.toString());

		// Save order book to redis cache
		console.log(`Order book for ${symbol}`, message);
	});

	orderBookWs.on("error", (error: Error) => {
		console.error(`WebSocket error for ${symbol}: ${error}`);
		setTimeout(() => {
			openBinanceWebSocketConnection(symbol);
		}, 5000);
	});

	orderBookWs.on("close", (code: number, reason: string) => {
		console.log(`WebSocket connection closed for ${symbol}: ${code} - ${reason}`);
	});
};
