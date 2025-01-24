import { PopulateOptions } from "mongoose";
// import WebSocket from "ws";
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
	assetName: string;
	baseCurrencyName: string;
	assetPair: string;
	exchanges: Exchange[];
}

export interface ISignalOrderBookData {
	lastUpdatedId: number;
	bids: Array<[string, string]>;
	asks: Array<[string, string]>;
}

export interface ISignalPriceData {
	asset: IActiveSignalsData;
	assetPrice: number;
	// priceWs: WebSocket;
}

// IExchangeAssetOrderBook
// Store price lower bound and upper bound here
// Take out order Book from cache
//
export interface IExchangeSignalOrderBook {
	assetOrderBook: ISignalOrderBookData;
	totalSellQuantityInRange: number;
	// orderBookWs: WebSocket;
}

export interface ISignalPrice {
	signalId: string;
	exchange: Exchange;
	signalData: ISignalPriceData;
}

export interface ISignalOrderBook {
	signalId: string;
	exchange: Exchange;
	signalData: IExchangeSignalOrderBook;
}

export interface IRemoveSignal {
	signalId: string;
	exchange: Exchange;
}
