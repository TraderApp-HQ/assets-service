// import { ISignal } from "./SignalControllers/config";

export const capitalizeFirstLetter = (str: string) => {
	if (str.length > 0) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	} else {
		return str;
	}
};

// export const formatSignalResponse = (signal: ISignal): ISignal => {
// 	return {
// 		...signal,
// 		asset: {
// 			...signal.asset,
// 			name: capitalizeFirstLetter(signal.asset.name),
// 			symbol: signal.asset.symbol.toUpperCase(),
// 		},
// 	};
// };
