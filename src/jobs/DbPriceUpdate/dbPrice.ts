import { Exchange } from "../../config/enums";
import { SignalService } from "../../services/SignalService";
import { SignalCacheClient } from "../../services/SignalCacheService";

export const dbPrice = async () => {
	const signalService = new SignalService();
	const signalCacheClient = await SignalCacheClient.getInstance();
	const signalCache = await signalCacheClient.getSignalCache();

	try {
		// Get signals current prices from redis/In-memory cache
		const signalsPrice = await signalCache.getAllSignalsPrices(Exchange.binance);

		// Abort functon if no signal price is returned.
		if (!signalsPrice || signalsPrice.length === 0) {
			return;
		}

		// Send updated price to database
		await signalService.updateSignalsDataInDB(signalsPrice);
	} catch (error: any) {
		console.error(`Error updating prices to db: ${error.message}`);
	}
};
