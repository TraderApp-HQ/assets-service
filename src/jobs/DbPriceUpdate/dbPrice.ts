import { Exchange } from "../../config/enums";
import { ISignalPrice } from "../../config/interfaces";
import { RedisClient } from "../../services/RedisService";
import { SignalService } from "../../services/SignalService";

export const dbPrice = async () => {
	const redisCache = new RedisClient();
	const signalService = new SignalService();

	try {
		// Get signals current prices from redis
		const signalsPrice = (await redisCache.getAllSignalsPrices(
			Exchange.binance
		)) as unknown as ISignalPrice[];

		// Abort functon if no signal price is returned.
		if (!signalsPrice || signalsPrice.length === 0) {
			return;
		}

		// Send updated price to database
		await signalService.updateSignalsDataInDB(signalsPrice);
	} catch (error: any) {
		console.error(`Error updating prices to db: ${error.message}`);
	} finally {
		redisCache.closeConnection();
	}
};
