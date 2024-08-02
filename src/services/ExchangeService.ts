import { Model, Document, PopulateOptions } from "mongoose";
import ExchangeModel, { IExchange } from "../models/Exchange";

export class ExchangeService {
	public async getAllExchanges({
		page,
		rowsPerPage,
		orderBy,
	}: {
		page: number;
		rowsPerPage: number;
		orderBy: "asc" | "desc";
	}): Promise<IExchange[] | null> {
		try {
			const offset = (page - 1) * rowsPerPage;

			const exchanges = await ExchangeModel.find({})
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

	public async updateExchangeById(
		id: number,
		updateData: Partial<IExchange>
	): Promise<IExchange | null> {
		try {
			const updatedExchange = await ExchangeModel.findByIdAndUpdate(id, updateData, {
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

	public async getManyExchangeById<T extends Document>(
		model: Model<T>,
		exchangeId: number,
		populateFields?: PopulateOptions[]
	): Promise<T[] | null> {
		try {
			let query = model.find({ exchangeId });

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
