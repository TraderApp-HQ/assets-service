import cronjob from "node-cron";
import { binanceSignals } from "./binanceSignals";

export const BinanceSignalsPriceUpdateJob = () => {
	// cron job that runs every 1 minute
	cronjob.schedule("* * * * *", async () => binanceSignals());
};
