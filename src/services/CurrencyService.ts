import Currency, { ICurrency } from "../models/Currency";

export class CurrencyService {
	public async getSelectedExchanges(): Promise<ICurrency[] | null> {
		try {
			const currencies = await Currency.find({}).where({ isTradingActive: true }).select({
				id: 1,
				name: 1,
				symbol: 1,
				logo: 1,
			});

			if (!currencies || currencies.length === 0) {
				return null;
			}

			return currencies;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
}
