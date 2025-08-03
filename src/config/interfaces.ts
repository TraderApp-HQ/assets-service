import { PopulateOptions } from "mongoose";
import {
	Candlestick,
	Category,
	Exchange,
	SignalRisk,
	SignalStatus,
	TradeSide,
	TradeType,
	UserRoles,
} from "./enums";

export interface IAccessToken {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	isPhoneVerified: boolean;
	isEmailVerified: boolean;
	isIdVerified: boolean;
	role: UserRoles[];
}

export interface ISignalAsset {
	id: string;
	name: string;
	symbol: string;
	logo: string;
	marketCap?: number;
}

export interface ISignalMilestone {
	price: number;
	percent: number;
	isReached: boolean;
}

export interface IExchange {
	id: string;
	name: string;
	logo: string;
}

export interface ISignalServiceCreateSignalProps {
	targetProfits: ISignalMilestone[];
	stopLoss: ISignalMilestone;
	entryPrice: number;
	entryPriceLowerBound: number;
	entryPriceUpperBound: number;
	currentPrice?: number;
	currentChange?: number;
	tradeNote: string;
	candlestick: Candlestick;
	risk: SignalRisk;
	isSignalTradable: boolean; // This controls when a trade is entered (If price is within entry range)
	isSignalTriggered?: boolean; //
	chartUrl: string;
	status: SignalStatus;
	maxGain: number;
	createdAt: string;
	endedAt?: string;
	supportedExchanges: number[];
	asset: number;
	assetName: string;
	baseCurrency: number;
	baseCurrencyName: string;
	category: Category;
	tradeType?: TradeType;
	tradeSide?: TradeSide;
	leverage?: number;
}

export interface ISignalServiceGetSignalsParams {
	rowsPerPage?: number;
	page?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	startAfterDoc?: string;
	keyword?: string;
	status?: SignalStatus[];
	populateFields?: PopulateOptions[];
}

export interface ISignalServiceUpdateSignalByIdProps {
	id: string;
	status: SignalStatus;
}

export interface ISignal extends ISignalServiceCreateSignalProps, Document {}

export interface ISignalResponse extends Document {
	id: string;
	asset: ISignalAsset;
	baseCurrency: ISignalAsset;
	targetProfits: ISignalMilestone[];
	stopLoss: ISignalMilestone;
	entryPrice: number;
	currentPrice?: number;
	currentChange?: number;
	tradeNote: string;
	candlestick: Candlestick;
	risk: SignalRisk;
	isSignalTradable: boolean;
	chartUrl: string;
	status: SignalStatus;
	maxGain: number;
	createdAt: string;
	endedAt?: string;
	supportedExchanges: IExchange[];
}

export interface IActiveSignalsData {
	signalId: string;
	stopLoss: ISignalMilestone;
	targetProfits: ISignalMilestone[];
	entryPrice: number;
	isSignalTradable: boolean;
	isSignalTriggered: boolean;
	status: SignalStatus;
	assetName: string;
	baseCurrencyName: string;
	assetPair: string;
	exchanges: Exchange[];
	entryPriceUpperBound: number;
	entryPriceLowerBound: number;
	tradeSide: TradeSide;
	maxGain: number;
}

export interface ISignalPrice {
	signalId: string;
	exchange: Exchange;
	asset: IActiveSignalsData;
	assetPrice: number;
	timestamp?: number;
}

export interface ISignalOrderBook {
	signalId: string;
	exchange: Exchange;
	totalSellQuantityInRange: number;
	totalBuyQuantityInRange: number;
	timestamp?: number;
}

export interface IRemoveSignal {
	signalId: string;
	exchange: Exchange;
}
