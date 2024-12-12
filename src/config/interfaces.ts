import { PopulateOptions } from "mongoose";
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
	baseCurrency: number;
	category: Category;
	tradeType: TradeType;
	tradeSide: TradeSide;
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
/*
1. category enum with crypto AND forex
2. Trade Type - category options of spot and futures (CFD for FOREX).
3. IF(FUTURES), choose leverage.
4. Trade side - LONG || SHORT
*/

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
