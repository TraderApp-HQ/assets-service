import mongoose, { Schema, Document } from "mongoose";

export interface IExchange extends Document {
	_id: number;
	name: string;
	slug: string;
	logo: string;
	description?: string;
	isTradingActive: boolean;
	urls: string;
	makerFee: number;
	takerFee: number;
	dateLaunched: Date;
}

interface IExchangeModel extends IExchange {}

const ExchangeSchema = new Schema<IExchangeModel>(
	{
		_id: { type: Number, required: true },
		name: { type: String, required: true },
		slug: { type: String, required: true },
		logo: { type: String, required: true },
		description: { type: String },
		isTradingActive: { type: Boolean, default: false },
		urls: { type: String, required: true },
		makerFee: { type: Number, required: true },
		takerFee: { type: Number, required: true },
		dateLaunched: { type: Date, default: Date.now },
		// exchangePairs: [{ type: mongoose.Types.ObjectId, ref: "ExchangePair" }],
		// coinsUnknown: [{ type: mongoose.Types.ObjectId, ref: "CoinsUnknown" }],
	},
	{ versionKey: false, timestamps: false }
);

export default mongoose.model<IExchangeModel>("Exchange", ExchangeSchema);
