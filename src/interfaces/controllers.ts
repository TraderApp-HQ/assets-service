import { PopulateOptions } from "mongoose";
import { Category, TradeStatus } from "../config/enums";
import { ITradingPlatform } from "../models/TradingPlatform";

export interface IAsset {
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
	assets: IAsset[];
}

export interface IQueryParameter {
	args: any;
	query: any;
	operations: any;
	model: any;
}

export interface IAssetServiceGetAllAssetParams {
	page: number;
	rowsPerPage: number;
	orderBy: "asc" | "desc";
	sortBy: string;
	category: Category;
}

export interface IAssetServiceGetAssetByIdProps {
	id: number;
	populateFields?: PopulateOptions[];
}

export interface ITradingPlatformServiceGetAllTradingPlatformParams {
	page: number;
	rowsPerPage: number;
	orderBy: "asc" | "desc";
	status?: TradeStatus;
}

export interface ITradingPlatformServiceUpdateTradingPlatformByIdProps {
	tradingPlatformId: number;
	updateData: Partial<ITradingPlatform>;
}

export interface GetManyTradingPlatformByIdProps {
	tradingPlatformId: number;
	populateFields?: PopulateOptions[];
}

export interface IGetAllTradingPlatformQuery {
	status?: TradeStatus;
}

export interface ITradingPlatformServiceGetSupportedTradingPlatformsParams {
	baseAssetId: number;
	quoteCurrencyId: number;
}

export interface ISupportedTradingPlatform {
	_id: string;
	logo: string;
	name: string;
}

export interface ISupportedTradingPlatformData extends Document {
	tradingPlatformId: ISupportedTradingPlatform;
}
