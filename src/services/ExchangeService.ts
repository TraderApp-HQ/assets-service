import ExchangeModel, { IExchange } from "../models/Exchange";
import {
	GetManyExchangeByIdProps,
	IExchangeServiceGetAllExchangesParams,
	IExchangeServiceUpdateExchangeByIdProps,
} from "../interfaces/controllers";
import ExchangePair, { IExchangePair } from "../models/ExchangePair";

export class ExchangeService {
	public async getAllExchanges({
		page,
		rowsPerPage,
		orderBy,
		isTradingActive,
	}: IExchangeServiceGetAllExchangesParams): Promise<IExchange[] | null> {
		try {
			const offset = (page - 1) * rowsPerPage;

			// Create the query object
			const query: any = {};
			if (isTradingActive) {
				query.isTradingActive = isTradingActive;
			}

			// Fetch the exchanges based on the query
			const exchanges = await ExchangeModel.find(query)
				.sort({ name: orderBy === "asc" ? 1 : -1 })
				.skip(offset)
				.limit(rowsPerPage);

			if (!exchanges || exchanges.length === 0) {
				return null;
			}

			return exchanges;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getExchangeById(id: string): Promise<IExchange | null> {
		const exchange = await ExchangeModel.findById(id).exec();
		return exchange;
	}

	public async updateExchangeById({
		exchangeId,
		updateData,
	}: IExchangeServiceUpdateExchangeByIdProps): Promise<IExchange | null> {
		try {
			const updatedExchange = await ExchangeModel.findByIdAndUpdate(exchangeId, updateData, {
				new: true,
			}).exec();

			if (!updatedExchange) {
				return null;
			}
			return updatedExchange;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getManyExchangeById({
		exchangeId,
		populateFields,
	}: GetManyExchangeByIdProps): Promise<IExchangePair[] | null> {
		try {
			let query = ExchangePair.find({ exchangeId });

			if (populateFields && populateFields.length > 0) {
				query = query.populate(populateFields);
			}

			const data = await query.exec();

			if (!data || data.length === 0) {
				return null;
			}

			return data;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
}
