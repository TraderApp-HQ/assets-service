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
		chartUrl: signal.chartUrl,
		status: signal.status,
		asset: {
			id: signal.asset.id,
			name: signal.asset.name,
			symbol: signal.asset.symbol,
			logo: signal.asset.logo,
			marketCap: signal.asset.marketCap,
		},
		baseCurrency: {
			id: signal.baseCurrency.id,
			name: signal.baseCurrency.name,
			symbol: signal.baseCurrency.symbol,
			logo: signal.baseCurrency.logo,
			marketCap: signal.baseCurrency.marketCap,
		},
		supportedExchanges: signal.supportedExchanges.map((exchange) => ({
			id: exchange.id,
			name: exchange.name,
			logo: exchange.logo,
		})),
	};
};

export const getNestedField = (obj: any, path: string) => {
	return path.split(".").reduce((acc, part) => acc?.[part], obj);
};
