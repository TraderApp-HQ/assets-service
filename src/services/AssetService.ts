import { SortOrder } from "mongoose";
import {
	IAssetServiceGetAllAssetParams,
	IAssetServiceGetAssetByIdProps,
} from "../interfaces/controllers";
import Asset, { IAsset } from "../models/Asset";

export class AssetService {
	public async getAllCoins({
		category,
		page,
		rowsPerPage,
		orderBy,
		sortBy,
	}: IAssetServiceGetAllAssetParams): Promise<IAsset[] | null> {
		try {
			const offset = (page - 1) * rowsPerPage;

			// Construct the dynamic sorting object
			const sortOptions: Record<string, SortOrder> = {};
			sortOptions[sortBy] = orderBy === "asc" ? 1 : -1;

			const exchanges = await Asset.find({})
				.sort(sortOptions)
				.skip(offset)
				.limit(rowsPerPage)
				.where({ isTradingActive: true, isCoinActive: true, category })
				.select({
					id: 1,
					name: 1,
					symbol: 1,
					rank: 1,
					logo: 1,
					dateLaunched: 1,
					urls: 1,
				});

			if (!exchanges) {
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
	}: IAssetServiceGetAssetByIdProps): Promise<IAsset | null> {
		try {
			let query = Asset.findOne({ _id: id }).select({
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
