import { PopulateOptions } from "mongoose";
import { IExchange } from "../models/Exchange";
import { TradeStatus } from "../config/enums";

export interface ICoin {
	id: number;
	name: string;
	slug: string;
	symbol: string;
	description: string;
	logo: string;
	urls: string;
	dateLaunched: Date;
	isCoinActive: boolean;
	isTradingActive: boolean;
	rank: number;
}
export interface IPagedResultData {
	currentPage: number;
	itemsCount: number;
	pageCount: number;
	rowsPerPage: number;
	sortBy: string;
	orderBy: string;
	coins: ICoin[];
}

export interface IQueryParameter {
	args: any;
	query: any;
	operations: any;
	model: any;
}

export interface ICoinServiceGetAllCoinsParams {
	page: number;
	rowsPerPage: number;
	orderBy: "asc" | "desc";
	sortBy: string;
}

export interface ICoinServiceGetCoinByIdProps {
	id: number;
	populateFields?: PopulateOptions[];
}

export interface IExchangeServiceGetAllExchangesParams {
	page: number;
	rowsPerPage: number;
	orderBy: "asc" | "desc";
	status?: TradeStatus;
}

export interface IExchangeServiceUpdateExchangeByIdProps {
	exchangeId: number;
	updateData: Partial<IExchange>;
}

export interface GetManyExchangeByIdProps {
	exchangeId: number;
	populateFields?: PopulateOptions[];
}

export interface IGetAllExchangesQuery {
	status?: TradeStatus;
}

export interface IExchangeServiceGetSupportedExchangesParams {
	coinId: number;
	currencyId: number;
}

export interface ISupportedExchange {
	_id: string;
	logo: string;
	name: string;
}

export interface ISupportedExchangeData extends Document {
	exchangeId: ISupportedExchange;
}
