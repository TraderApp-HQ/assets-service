import { ISignalResponse } from "../config/interfaces";

export const formatSignalResponse = (signal: ISignalResponse) => {
	return {
		id: signal.id,
		targetProfits: signal.targetProfits.map((profit) => ({
			price: profit.price,
			percent: profit.percent,
			isReached: profit.isReached,
		})),
		stopLoss: signal.stopLoss,
		entryPrice: signal.entryPrice,
		tradeNote: signal.tradeNote,
		candlestick: signal.candlestick,
		risk: signal.risk,
		isSignalTradable: signal.isSignalTradable,
		isSignalTriggered: signal.isSignalTriggered,
		chartUrl: signal.chartUrl,
		status: signal.status,
		createdAt: signal.createdAt,
		endedAt: signal.endedAt,
		maxGain: signal.maxGain,
		currentChange: signal.currentChange,
		currentPrice: signal.currentPrice,
		leverage: signal.leverage,
		tradeSide: signal.tradeSide,
		baseAsset: {
			id: signal.baseAsset._id,
			name: signal.baseAsset.name,
			symbol: signal.baseAsset.symbol,
			logo: signal.baseAsset.logo,
			marketCap: signal.baseAsset.marketCap,
		},
		quoteCurrency: {
			id: signal.quoteCurrency._id,
			name: signal.quoteCurrency.name,
			symbol: signal.quoteCurrency.symbol,
			logo: signal.quoteCurrency.logo,
			marketCap: signal.quoteCurrency.marketCap,
		},
		supportedTradingPlatforms: signal.supportedTradingPlatforms.map((platform) => ({
			id: platform._id,
			name: platform.name,
			logo: platform.logo,
		})),
	};
};

export const getNestedField = (obj: any, path: string) => {
	return path.split(".").reduce((acc, part) => acc?.[part], obj);
};
