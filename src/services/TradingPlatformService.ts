import { TradeStatus } from "../config/enums";
import {
	GetManyTradingPlatformByIdProps,
	IGetAllTradingPlatformQuery,
	ISupportedTradingPlatform,
	ITradingPlatformServiceGetAllTradingPlatformParams,
	ITradingPlatformServiceGetSupportedTradingPlatformsParams,
	ITradingPlatformServiceUpdateTradingPlatformByIdProps,
} from "../interfaces/controllers";
import TradingPlatform, { ITradingPlatform } from "../models/TradingPlatform";
import TradingPlatformPair, { ITradingPlatformPair } from "../models/TradingPlatformPair";

export class TradingPlatformService {
	public async getAllTradingPlatforms({
		page,
		rowsPerPage,
		orderBy,
		status,
	}: ITradingPlatformServiceGetAllTradingPlatformParams): Promise<ITradingPlatform[] | null> {
		try {
			const offset = (page - 1) * rowsPerPage;

			// Create the query object
			const query: IGetAllTradingPlatformQuery = {};
			if (status) {
				query.status = status;
			}

			// Fetch the trading platforms based on the query
			const tardingPlatforms = await TradingPlatform.find(query)
				.sort({ name: orderBy === "asc" ? 1 : -1 })
				.skip(offset)
				.limit(rowsPerPage);

			if (!tardingPlatforms || tardingPlatforms.length === 0) {
				return null;
			}

			return tardingPlatforms;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getTradingPlatformById(id: string): Promise<ITradingPlatform | null> {
		const exchange = await TradingPlatform.findById(id).exec();
		return exchange;
	}

	public async updateTradingPlatformById({
		tradingPlatformId,
		updateData,
	}: ITradingPlatformServiceUpdateTradingPlatformByIdProps): Promise<ITradingPlatform | null> {
		try {
			const updatedExchange = await TradingPlatform.findByIdAndUpdate(
				tradingPlatformId,
				updateData,
				{
					new: true,
				}
			).exec();

			if (!updatedExchange) {
				return null;
			}
			return updatedExchange;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getManyTradingPlatformById({
		tradingPlatformId,
		populateFields,
	}: GetManyTradingPlatformByIdProps): Promise<ITradingPlatformPair[] | null> {
		try {
			let query = TradingPlatformPair.find({ tradingPlatformId });

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

	public async getSupportedTradingPlatforms({
		baseAssetId,
		quoteCurrencyId,
	}: ITradingPlatformServiceGetSupportedTradingPlatformsParams): Promise<
		ISupportedTradingPlatform[] | null
	> {
		try {
			// find and return trading platforms where assetId and currencyId match
			const platforms = await TradingPlatformPair.find({
				assetId: baseAssetId,
				currencyId: quoteCurrencyId,
			})
				.populate({
					path: "platformId", // Populate the exchange details using exchangeId
					match: { status: TradeStatus.active },
					select: "id name logo",
				})
				.sort({ name: 1 });

			// Filter out exchange pairs where exchangeId is null (i.e., inactive exchanges)
			const activePlatforms = platforms.filter((platform) => platform.platformId !== null);

			if (!activePlatforms || activePlatforms.length === 0) {
				return null;
			}

			const formattedPlatforms: ISupportedTradingPlatform[] = activePlatforms.map(
				(platform: any) => ({
					_id: platform.platformId._id,
					logo: platform.platformId.logo,
					name: platform.platformId.name,
				})
			);

			return formattedPlatforms;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
}
