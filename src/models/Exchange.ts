import mongoose, { Schema, Document } from "mongoose";
import { Category, ConnectionType, TradeStatus } from "../config/enums";

export interface IExchange extends Document {
	_id: number;
	name: string;
	slug: string;
	logo: string;
	description?: string;
	status: TradeStatus;
	urls: string;
	makerFee: number;
	takerFee: number;
	dateLaunched: Date;
	category: Category;
	connectionTypes: ConnectionType[];
	isIpAddressWhitelistRequired: boolean;
	isSpotTradingSupported: Boolean;
	isFuturesTradingSupported: Boolean;
	IsMarginTradingSupported: Boolean;
}

interface IExchangeModel extends IExchange {}

export const ExchangeSchema = new Schema<IExchangeModel>(
	{
		_id: { type: Number, required: true },
		name: { type: String, required: true },
		slug: { type: String, required: true },
		logo: { type: String, required: true },
		description: { type: String },
		status: { type: String, enum: Object.values(TradeStatus), required: true },
		urls: { type: String, required: true },
		makerFee: { type: Number, required: true },
		takerFee: { type: Number, required: true },
		dateLaunched: { type: Date, default: Date.now },
		category: { type: String, enum: Category, required: true },
		connectionTypes: [{ type: String, enum: Object.values(ConnectionType) }],
		isIpAddressWhitelistRequired: { type: Boolean, required: true },
		isSpotTradingSupported: { type: Boolean, required: true },
		isFuturesTradingSupported: { type: Boolean, required: true },
		IsMarginTradingSupported: { type: Boolean, required: true },
		// exchangePairs: [{ type: mongoose.Types.ObjectId, ref: "ExchangePair" }],
		// coinsUnknown: [{ type: mongoose.Types.ObjectId, ref: "CoinsUnknown" }],
	},
	{ versionKey: false, timestamps: false }
);

export default mongoose.model<IExchangeModel>("Exchange", ExchangeSchema);
