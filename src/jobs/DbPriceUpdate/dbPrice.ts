import { Exchange } from "../../config/enums";
import { SignalService } from "../../services/SignalService";
import { CacheService } from "../../services/CacheService";

export const dbPrice = async () => {
	const signalService = new SignalService();
	const cacheService = await CacheService.getInstance();
	const cache = await cacheService.getCache();

	try {
		// Get signals current prices from redis/In-memory cache
		const signalsPrice = await cache.getAllSignalsPrices(Exchange.binance);

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
