import { assetPriceUpdateCronJob } from "./assetPriceUpdate";

const runAllJobs = () => {
	assetPriceUpdateCronJob();
};

export default runAllJobs;
