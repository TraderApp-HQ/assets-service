import mongoose, { Schema } from "mongoose";
import { Candlestick, SignalRisk, SignalStatus } from "../config/enums";
import { ISignal } from "../config/interfaces";

const SignalSchema = new Schema<ISignal>(
	{
		id: { type: String, unique: true },
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
		currentPrice: { type: Number },
		currentChange: { type: Number },
		tradeNote: { type: String, required: true },
		candlestick: { type: String, enum: Object.values(Candlestick), required: true },
		risk: { type: String, enum: Object.values(SignalRisk), required: true },
		isSignalTradable: { type: Boolean, required: true },
		chartUrl: { type: String, required: true },
		status: { type: String, enum: Object.values(SignalStatus), required: true },
		maxGain: { type: Number, required: true },
		createdAt: { type: String, required: true },
		endedAt: { type: String },
		supportedExchanges: [{ type: Number, ref: "Exchange", required: true }],
		asset: { type: Number, ref: "Coin", required: true },
		baseCurrency: { type: Number, ref: "Coin", required: true },
	},
	{ versionKey: false, timestamps: false }
);

export default mongoose.model<ISignal>("Signal", SignalSchema);
