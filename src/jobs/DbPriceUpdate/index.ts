import cronjob from "node-cron";
import { dbPrice } from "./dbPrice";

// cron job that runs every 2 minute
export const DbPriceUpdateJob = () => cronjob.schedule("*/2 * * * *", async () => dbPrice());
