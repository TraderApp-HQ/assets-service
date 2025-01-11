import cronjob from "node-cron";
import { binanceSignalsPrices } from "./BinanceSignalsPrices";

export const BinanceSignalsPriceUpdateJob = () => {
	// cron job that runs every 1 minute
	cronjob.schedule("* * * * *", async () => binanceSignalsPrices());
};
