import { PopulateOptions } from "mongoose";
import {
	Candlestick,
	Category,
	TradingPlatform,
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
	_id: number;
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

export interface ITradingPlatform {
	_id: number;
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
	supportedTradingPlatforms: number[];
	baseAsset: number;
	baseAssetName: string;
	quoteCurrency: number;
	quoteCurrencyName: string;
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
	isSignalTriggered?: boolean;
}

export interface ISignalServiceUpdateSignalByIdProps {
	id: string;
	status: SignalStatus;
}

export interface ISignal extends ISignalServiceCreateSignalProps, Document {}

export interface ISignalResponse extends Document {
	id: string;
	baseAsset: ISignalAsset;
	quoteCurrency: ISignalAsset;
	targetProfits: ISignalMilestone[];
	stopLoss: ISignalMilestone;
	entryPrice: number;
	currentPrice?: number;
	currentChange?: number;
	tradeNote: string;
	candlestick: Candlestick;
	risk: SignalRisk;
	isSignalTradable: boolean;
	isSignalTriggered: boolean;
	chartUrl: string;
	status: SignalStatus;
	maxGain: number;
	createdAt: string;
	endedAt?: string;
	supportedTradingPlatforms: ITradingPlatform[];
	leverage: number;
	tradeSide: string;
}

export interface IActiveSignalsData {
	signalId: string;
	stopLoss: ISignalMilestone;
	targetProfits: ISignalMilestone[];
	entryPrice: number;
	isSignalTradable: boolean;
	isSignalTriggered: boolean;
	status: SignalStatus;
	baseAssetName: string;
	quoteCurrencyName: string;
	assetPair: string;
	tradingPlatforms: TradingPlatform[];
	entryPriceUpperBound: number;
	entryPriceLowerBound: number;
	tradeSide: TradeSide;
	maxGain: number;
}

export interface ISignalPrice {
	signalId: string;
	tradingPlatform: TradingPlatform;
	asset: IActiveSignalsData;
	assetPrice: number;
	timestamp?: number;
}

export interface ISignalOrderBook {
	signalId: string;
	tradingPlatform: TradingPlatform;
	totalSellQuantityInRange: number;
	totalBuyQuantityInRange: number;
	timestamp?: number;
}

export interface IRemoveSignal {
	signalId: string;
	tradingPlatform: TradingPlatform;
}

export interface ICalculateLeverageInput {
	entryPrice: number;
	stopLossPrice: number;
	tradeSide: TradeSide;
	maintenanceMarginRate?: number;
}
