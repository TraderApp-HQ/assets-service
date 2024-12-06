import cronjob from "node-cron";
import { SignalService } from "./../services/SignalService";
import { getCoinsLatestPrice } from "../utils/assetPrice";

export const assetPriceUpdateCronJob = () => {
	const signalService = new SignalService();

	// cron job that runs every 1 minute
	cronjob.schedule("*/5 * * * *", async () => {
		try {
			const activeSignals = await signalService.getActiveSignalsAssetName();

			// Function runs only if there are active signals
			if (activeSignals && activeSignals.length > 0) {
				const activeSignalsString = activeSignals.join(",");

				// Calls api for assets prices
				const assetPrices = await getCoinsLatestPrice(activeSignalsString);

				if (assetPrices) {
					const assetsNewPrices = activeSignals.map((signal) => {
						const assetPrice = parseFloat(
							(
								Math.ceil(assetPrices[signal]?.quote?.["USDT"]?.price * 100) / 100
							).toFixed(2)
						);

						return { asset: signal, price: assetPrice };
					});

					// Updates DB if assets prices are available
					if (assetsNewPrices && assetsNewPrices.length > 0) {
						await signalService.updateActiveSignalsPrices(assetsNewPrices);
					}
				}
			}
		} catch (error: any) {
			throw new Error(`Error getting asset prices: ${error.message}`);
		}
	});
};
