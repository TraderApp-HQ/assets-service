import Coin, { ICoin } from "../models/Coin";
import {
	ICoinServiceGetAllCoinsParams,
	ICoinServiceGetCoinByIdProps,
} from "../interfaces/controllers";

export class CoinService {
	public async getAllCoins({
		page,
		rowsPerPage,
		orderBy,
	}: ICoinServiceGetAllCoinsParams): Promise<ICoin[] | null> {
		try {
			const offset = (page - 1) * rowsPerPage;

			const exchanges = await Coin.find({})
				.sort({ name: orderBy === "asc" ? 1 : -1 })
				.skip(offset)
				.limit(rowsPerPage)
				.where({ isTradingActive: true, isCoinActive: true })
				.select({
					id: 1,
					name: 1,
					symbol: 1,
					rank: 1,
					logo: 1,
					dateLaunched: 1,
					urls: 1,
				});

			if (!exchanges || exchanges.length === 0) {
				return null;
			}

			return exchanges;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getCoinById({
		id,
		populateFields,
	}: ICoinServiceGetCoinByIdProps): Promise<ICoin | null> {
		try {
			let query = Coin.findOne({ _id: id }).select({
				id: 1,
				name: 1,
				slug: 1,
				symbol: 1,
				logo: 1,
			});

			if (populateFields && populateFields.length > 0) {
				query = query.populate(populateFields);
			}

			const data = await query.exec();

			if (!data) {
				return null;
			}

			return data;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
}
