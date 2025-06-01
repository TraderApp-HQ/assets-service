import cronjob from "node-cron";
import { BinanceWebSocketService } from "../../services/BinanceWebSocketService";
import { RedisClient } from "../../services/RedisService";
import WebSocket from "ws";
import { openBinanceWebSocketConnection } from "../../websockets/BinanceWebSockets";
import { Exchange, AssetData } from "../../config/enums";
import { MessageActivityService } from "../../services/MessageActivityService";

// Check Binance WebSockets
export const BinanceWebSocketsHealthCheckJob = () =>
	cronjob.schedule("*/10 * * * *", async () => {
		console.log("=== Running Binance Websockets Health Check ===");
		const binanceSocketCache = BinanceWebSocketService.getInstance();
		const messageActivity = MessageActivityService.getInstance();
		const socketMap = (binanceSocketCache as any).binanceSocketMap as Map<string, WebSocket>;

		let allSocketsHealthy = true;

		for (const [key, ws] of socketMap.entries()) {
			const signalId = key.split("_").pop() ?? "";
			const TWO_MINUTES = 2 * 60 * 1000; // 2 minutes for more responsive checks
			const type = key.includes(AssetData.price) ? AssetData.price : AssetData.orderBook;

			// Check if messages are stale
			const messagesStale = messageActivity.isMessageStale(signalId, type, TWO_MINUTES);
			if (ws.readyState !== WebSocket.OPEN || messagesStale) {
				allSocketsHealthy = false;
				console.error(
					`[HealthCheck] WebSocket for ${key} is not open! State: ${ws.readyState}`
				);
			}
		}
		if (allSocketsHealthy) {
			console.log("[HealthCheck] All Binance WebSockets are healthy.");
		}
	});

// Check Redis
export const RedisConnectionHealthCheckJob = () =>
	cronjob.schedule("*/10 * * * *", async () => {
		console.log("=== Running Redis Connection Health Check ===");
		const redis = RedisClient.getInstance();
		try {
			const pong = await (redis as any).client.ping();
			if (pong === "PONG") {
				console.log("[HealthCheck] Redis is healthy.");
			} else {
				console.error("[HealthCheck] Redis ping failed:", pong);
			}
		} catch (err) {
			console.error("[HealthCheck] Redis error:", err);
		}
	});

export const BinanceAssetWebSocketHealthCheckJob = () =>
	cronjob.schedule("* * * * *", async () => {
		const binanceSocketCache = BinanceWebSocketService.getInstance();
		const redisCache = RedisClient.getInstance();
		const messageActivity = MessageActivityService.getInstance();
		const socketMap = (binanceSocketCache as any).binanceSocketMap as Map<string, WebSocket>;

		// Get all cached assets from Redis
		const allPrices = await redisCache.getAllSignalsPrices(Exchange.binance);
		const assetMap = new Map(allPrices.map((p) => [p.signalId, p.asset]));

		const TWO_MINUTES = 2 * 60 * 1000; // 2 minutes for more responsive checks

		const socketsToReopen = [];
		for (const [key, ws] of socketMap.entries()) {
			const signalId = key.split("_").pop() ?? "";
			const asset = assetMap.get(signalId);
			const type = key.includes(AssetData.price) ? AssetData.price : AssetData.orderBook;

			// Check if messages are stale
			const messagesStale = messageActivity.isMessageStale(signalId, type, TWO_MINUTES);
			if (ws.readyState !== WebSocket.OPEN || messagesStale) {
				if (asset) {
					socketsToReopen.push({ asset, ws });
				} else {
					console.warn(`[HealthCheck] No asset found in Redis for signalId: ${signalId}`);
				}
			}
		}

		for (const item of socketsToReopen) {
			console.log(
				`[HealthCheck] Reopening WebSocket for asset: ${item.asset.assetPair} (reason: ${
					item.ws.readyState !== WebSocket.OPEN ? "closed" : "no messages received"
				})`
			);
			try {
				await binanceSocketCache.closePriceSocket(item.asset.signalId);
				await binanceSocketCache.closeOrderBookSocket(item.asset.signalId);
				openBinanceWebSocketConnection(item.asset);
			} catch (err) {
				console.error(
					`[HealthCheck] Error reopening WebSocket for ${item.asset.assetPair}:`,
					err
				);
			}
		}
	});
