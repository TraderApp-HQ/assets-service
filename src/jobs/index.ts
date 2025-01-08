import { signalsRealTimePriceUpdateCronJob } from "./signalsPriceUpdate";

const runAllJobs = () => {
	signalsRealTimePriceUpdateCronJob();
};

export default runAllJobs;
