import { DEFAULT_PAGE, DEFAULT_ROWS_PER_PAGE } from "../config/constants";
import { SignalStatus } from "../config/enums";
import {
	ISignal,
	ISignalServiceCreateSignalProps,
	ISignalServiceGetSignalsParams,
	ISignalServiceUpdateSignalByIdProps,
} from "../config/interfaces";
import Signal from "../models/Signal";

export class SignalService {
	public async createSignal(props: ISignalServiceCreateSignalProps): Promise<ISignal | null> {
		try {
			// Find existing signals with the same asset ID
			const existingSignals = await Signal.find({
				asset: props.asset, // asset/coin ID
				status: SignalStatus.ACTIVE, // match only Active signals
			});

			if (existingSignals && existingSignals.length > 0) {
				// Update all existing signals' status to INACTIVE
				await Signal.updateMany({ asset: props.asset }, { status: SignalStatus.INACTIVE });
			}

			// Create a new Signal document using the provided props
			const signal = new Signal(props);

			// Save the signal to the database
			await signal.save();

			return signal;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getSignals({
		rowsPerPage = DEFAULT_ROWS_PER_PAGE, // Default to 10 rows per page
		page = DEFAULT_PAGE, // Default to first page
		sortBy = "createdAt", // Default sort by createdAt
		sortOrder = "desc", // Default to descending order
		startAfterDoc, // Document to start after, for pagination
		keyword, // Keyword for filtering by name or other fields
		status,
		populateFields,
	}: ISignalServiceGetSignalsParams): Promise<ISignal[] | null> {
		try {
			const query: any = {};

			// Apply status filter
			if (status) {
				query.status = status;
			}

			// Apply keyword filter (search by multiple fields)
			if (keyword) {
				query.$or = [
					{ "asset.symbol": { $regex: keyword, $options: "i" } },
					{ "asset.name": { $regex: keyword, $options: "i" } },
					{ "baseCurrency.symbol": { $regex: keyword, $options: "i" } },
					{ "baseCurrency.name": { $regex: keyword, $options: "i" } },
					{ "supportedExchanges.name": { $regex: keyword, $options: "i" } },
				];
			}

			// Apply startAfterDoc for pagination
			if (startAfterDoc) {
				const startAfterSignal = await Signal.findOne({ id: startAfterDoc });
				if (startAfterSignal) {
					query.createdAt = { $gt: startAfterSignal.createdAt };
				}
			}

			// Create the query with the initial conditions
			let signalQuery = Signal.find(query);

			// Apply population if specified
			if (populateFields && populateFields.length > 0) {
				populateFields.forEach((field) => {
					signalQuery = signalQuery.populate(field);
				});
			}

			// Apply sorting, skipping, and limiting
			const signals = await signalQuery
				.sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
				.skip((page - 1) * rowsPerPage)
				.limit(rowsPerPage);

			return signals;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getSignalById(id: string): Promise<ISignal | null> {
		try {
			const signal = await Signal.findById(id)
				.populate(["supportedExchanges", "asset", "baseCurrency"])
				.exec();

			if (!signal) {
				return null;
			}
			return signal;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async updateSignalById({
		id,
		status,
	}: ISignalServiceUpdateSignalByIdProps): Promise<ISignal | null> {
		try {
			const updatedSignal = await Signal.findByIdAndUpdate(
				id,
				{ status },
				{
					new: true,
				}
			).exec();

			if (!updatedSignal) {
				return null;
			}
			return updatedSignal;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getSignalCount(): Promise<number> {
		try {
			const totalSignal = await Signal.countDocuments();
			return totalSignal;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
}
