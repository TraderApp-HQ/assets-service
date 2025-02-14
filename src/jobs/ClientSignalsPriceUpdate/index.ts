import cronjob from "node-cron";
import { clientSignals } from "./clientSignals";

// cron job that runs every 1 minute
export const ClientSignalsPriceUpdateJob = () =>
	cronjob.schedule("* * * * *", async () => clientSignals());
