import cronjob from "node-cron";
import { binanceSignals } from "./binanceSignals";

// cron job that runs every 1 minute
export const BinanceSignalsPriceUpdateJob = () =>
	cronjob.schedule("* * * * *", async () => binanceSignals());
