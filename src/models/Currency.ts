import mongoose, { Schema, Document } from "mongoose";

export interface ICurrency extends Document {
	_id: number;
	name: string;
	symbol: string;
	isTradingActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

interface ICurrencyModel extends ICurrency {}

export const CurrencySchema = new Schema<ICurrencyModel>(
	{
		_id: { type: Number, required: true },
		name: { type: String, required: true },
		symbol: { type: String, required: true },
		isTradingActive: { type: Boolean, default: true },
		// coin: { type: mongoose.Types.ObjectId, ref: "Coin", required: true },
		// exchangePairs: [{ type: mongoose.Types.ObjectId, ref: "ExchangePair" }],
	},
	{ versionKey: false, timestamps: true }
);

CurrencySchema.set("toJSON", {
	virtuals: true,
});

export default mongoose.model<ICurrencyModel>("Currency", CurrencySchema);
