import WebSocket from "ws";
import "dotenv/config";
import { AssetData, WSChannel } from "../config/enums";

export class BinanceWebSocketService {
	private static instance: BinanceWebSocketService;
	private readonly env: string;
	private readonly binanceSocketMap: Map<string, WebSocket>;

	private constructor() {
		this.env = process.env.NODE_ENV as string;
		this.binanceSocketMap = new Map();
	}

	public static getInstance(): BinanceWebSocketService {
		if (!BinanceWebSocketService.instance) {
			BinanceWebSocketService.instance = new BinanceWebSocketService();
		}

		return BinanceWebSocketService.instance;
	}

	/*
    ----------------------
    ACTIVE SIGNALS SOCKETS
    ----------------------
    */
	addPriceSocket({ signalId, ws }: { signalId: string; ws: WebSocket }): void {
		const wsKey = `${this.env}_${WSChannel.binanceWs}_${AssetData.price}_${signalId}`;
		const client = this.binanceSocketMap.get(wsKey);
		if (client) this.binanceSocketMap.delete(wsKey);
		this.binanceSocketMap.set(wsKey, ws);
	}

	addOrderBookSocket({ signalId, ws }: { signalId: string; ws: WebSocket }): void {
		const wsKey = `${this.env}_${WSChannel.binanceWs}_${AssetData.orderBook}_${signalId}`;
		this.binanceSocketMap.set(wsKey, ws);
	}

	closePriceSocket(signalId: string) {
		const wsKey = `${this.env}_${WSChannel.binanceWs}_${AssetData.price}_${signalId}`;
		const client = this.binanceSocketMap.get(wsKey) as WebSocket;
		// Close socket connection
		if (client instanceof WebSocket && client.readyState === WebSocket.OPEN) {
			client.close();
		}

		// Delete socket from in-memory
		this.binanceSocketMap.delete(wsKey);
	}

	closeOrderBookSocket(signalId: string) {
		const wsKey = `${this.env}_${WSChannel.binanceWs}_${AssetData.orderBook}_${signalId}`;
		const client = this.binanceSocketMap.get(wsKey) as WebSocket;
		// Close socket connection
		if (client instanceof WebSocket && client.readyState === WebSocket.OPEN) {
			client.close();
		}

		// Delete socket from in-memory
		this.binanceSocketMap.delete(wsKey);
	}

	async closeAllSockects() {
		const keys = Array.from(this.binanceSocketMap.keys());

		await Promise.all(
			keys.map(async (key) => {
				// Close socket
				(this.binanceSocketMap.get(key) as WebSocket).close();

				// Delete socket
				this.binanceSocketMap.delete(key);
			})
		);
	}
}
