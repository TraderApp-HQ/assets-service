import mongoose, { Schema, Document } from "mongoose";

export interface IExchangePair extends Document {
	exchangeId: number;
	coinId: number;
	currencyId: number;
}

interface IExchangePairModel extends IExchangePair {}

const ExchangePairSchema = new Schema<IExchangePairModel>(
	{
		exchangeId: { type: Number, ref: "Exchange", required: true },
		coinId: { type: Number, ref: "Coin", required: true },
		currencyId: { type: Number, ref: "Currency", required: true },
	},
	{ versionKey: false, timestamps: false, id: false, _id: false }
);

ExchangePairSchema.index({ exchangeId: 1, coinId: 1, currencyId: 1 }, { unique: true });

export default mongoose.model<IExchangePairModel>("ExchangePair", ExchangePairSchema);
