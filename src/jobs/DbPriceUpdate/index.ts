import cronjob from "node-cron";
import { dbPrice } from "./dbPrice";

// cron job that runs every 1 minute
export const DbPriceUpdateJob = () => cronjob.schedule("* * * * *", async () => dbPrice());
