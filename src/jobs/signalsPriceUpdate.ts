import cronjob from "node-cron";
import { SignalService } from "./../services/SignalService";

export const signalsRealTimePriceUpdateCronJob = () => {
	const signalService = new SignalService();

	// cron job that runs every 1 minute
	cronjob.schedule("* * * * *", async () => {
		try {
			// Fetch active signals from db together with their supported exchanges
			const activeSignals = await signalService.getActiveSignalsAssetNameAndExchange();

			// Stops function execution if no active signal is found
			if (!activeSignals || activeSignals.length === 0) return;

			console.log("from signalsPriceUpdate cronjob", activeSignals);

			// Open web sockets to get price update and save to redis
			activeSignals.forEach((signal) => {
				if (signal.exchanges.includes("binance")) {
					// Open binance web socket for the signal prices and save to redis
				}
				if (signal.exchanges.includes("kucoin")) {
					// Open kucoin web socket for the signal prices and save to redis
				}
			});
		} catch (error: any) {
			throw new Error(`Error getting asset real time prices: ${error.message}`);
		}
	});
};
