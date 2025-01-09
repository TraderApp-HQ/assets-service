import { PopulateOptions } from "mongoose";
import * as WebSocketType from "ws";
import {
	Candlestick,
	Category,
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

export interface IRedisClient {
	redisEndpoint: string;
	env: string;
}

export interface IAddClient {
	userId: string;
	channel: string;
	ws: WebSocketType;
}

export interface IGetClientsReturn {
	userId: string;
	ws: WebSocketType;
}

export interface IClient {
	userId: string;
	channel: string;
}

export interface IGetExchangeActiveSignalsReturn {
	stopLoss: ISignalMilestone;
	targetProfits: ISignalMilestone[];
	entryPrice: number;
	isSignalTradable: boolean;
	assetName: string;
	baseCurrencyName: string;
	asset: string;
	exchanges: string[];
	id: string;
}

export interface ICacheAsset {
	assetName: string;
	assetPrice: any;
	assetOrderBook: any;
}

export interface ICacheSignl {
	assetId: string;
	exchange: string;
	assetData: ICacheAsset;
}

export interface IRemoveCacheSignal {
	assetId: string;
	exchange: string;
}
