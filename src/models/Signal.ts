import mongoose, { Schema } from "mongoose";
import {
	Candlestick,
	Category,
	SignalRisk,
	SignalStatus,
	TradeSide,
	TradeType,
} from "../config/enums";
import { ISignal } from "../config/interfaces";

const SignalSchema = new Schema<ISignal>(
	{
		targetProfits: [
			{
				price: { type: Number, required: true },
				percent: { type: Number, required: true },
				isReached: { type: Boolean, required: true },
			},
		],
		stopLoss: {
			price: { type: Number, required: true },
			percent: { type: Number, required: true },
			isReached: { type: Boolean, required: true },
		},
		entryPrice: { type: Number, required: true },
		entryPriceLowerBound: { type: Number, required: true },
		entryPriceUpperBound: { type: Number, required: true },
		currentPrice: { type: Number },
		currentChange: { type: Number },
		tradeNote: { type: String, required: true },
		candlestick: { type: String, enum: Object.values(Candlestick), required: true },
		risk: { type: String, enum: Object.values(SignalRisk), required: true },
		isSignalTradable: { type: Boolean, default: false },
		isSignalTriggered: { type: Boolean, default: false },
		chartUrl: { type: String, required: true },
		status: {
			type: String,
			enum: Object.values(SignalStatus),
			required: true,
			default: SignalStatus.PENDING,
		},
		maxGain: { type: Number },
		createdAt: { type: String, required: true },
		endedAt: { type: String },
		supportedTradingPlatforms: [{ type: Number, ref: "trading-platform", required: true }],
		baseAsset: { type: Number, ref: "asset", required: true },
		baseAssetName: { type: String, required: true },
		quoteCurrency: { type: Number, ref: "asset", required: true },
		quoteCurrencyName: { type: String, required: true },
		category: { type: String, required: true, enum: Object.values(Category) },
		tradeType: { type: String, enum: Object.values(TradeType) },
		tradeSide: { type: String, enum: Object.values(TradeSide) },
		leverage: { type: Number },
	},
	{
		versionKey: false,
		timestamps: true,
		toJSON: {
			virtuals: true,
			transform: (doc, ret) => {
				ret.id = ret._id; // Optionally include _id as id
				delete ret._id; // Remove _id from output
				return ret;
			},
		},
	}
);

export default mongoose.model<ISignal>("Signal", SignalSchema);
