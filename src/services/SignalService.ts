import { DEFAULT_PAGE, DEFAULT_ROWS_PER_PAGE } from "../config/constants";
import { SignalStatus } from "../config/enums";
import {
	IExchange,
	ISignal,
	ISignalResponse,
	ISignalServiceCreateSignalProps,
	ISignalServiceGetSignalsParams,
	ISignalServiceUpdateSignalByIdProps,
} from "../config/interfaces";
import { formatSignalResponse, getNestedField } from "../controllers/helpers";
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
				await Signal.updateMany(
					{ asset: props.asset },
					{ status: SignalStatus.INACTIVE, endedAt: new Date().toISOString() }
				);
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
	}: ISignalServiceGetSignalsParams): Promise<ISignalResponse[] | null> {
		try {
			const query: any = {};

			// Apply status filter
			if (status?.length) {
				query.status = { $in: status };
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

			// Populate related fields
			signalQuery = signalQuery.populate([
				{ path: "supportedExchanges" },
				{ path: "asset" },
				{ path: "baseCurrency" },
			]);

			// Apply sorting, skipping, and limiting
			let signals = await signalQuery.exec();

			if (keyword) {
				signals = signals.filter((signal: any) => {
					return (
						signal.asset?.symbol?.match(new RegExp(keyword, "i")) ||
						signal.asset?.name?.match(new RegExp(keyword, "i")) ||
						signal.baseCurrency?.symbol?.match(new RegExp(keyword, "i")) ||
						signal.baseCurrency?.name?.match(new RegExp(keyword, "i")) ||
						signal.supportedExchanges.some((exchange: IExchange) =>
							exchange.name.match(new RegExp(keyword, "i"))
						)
					);
				});
			}

			// Apply sorting
			signals.sort((a, b) => {
				const fieldA = getNestedField(a, sortBy);
				const fieldB = getNestedField(b, sortBy);
				if (typeof fieldA === "string" && typeof fieldB === "string") {
					return sortOrder === "asc"
						? fieldA.localeCompare(fieldB)
						: fieldB.localeCompare(fieldA);
				}
				return sortOrder === "asc"
					? Number(fieldA) - Number(fieldB)
					: Number(fieldB) - Number(fieldA);
			});

			// Apply pagination
			const paginatedSignals = signals.slice((page - 1) * rowsPerPage, page * rowsPerPage);

			return paginatedSignals as unknown as ISignalResponse[];
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getPaginatedSignals(
		query: Record<string, string | string[]>,
		status: SignalStatus[]
	) {
		const rowsPerPage = query.rowsPerPage
			? Number.parseInt(query.rowsPerPage as string, 10)
			: DEFAULT_ROWS_PER_PAGE;
		const page = query.page ? Number.parseInt(query.page as string, 10) : DEFAULT_PAGE;
		const sortBy = query.sortBy as string;
		const sortOrder = (query.sortOrder as "asc") ?? "desc";
		const startAfterDoc = query.startAfterDoc as string;
		const keyword = query.keyword as string;

		// Fetch signals using the service method
		const signals = await this.getSignals({
			rowsPerPage,
			page,
			sortBy,
			sortOrder,
			keyword,
			startAfterDoc,
			status,
		});

		if (!signals) {
			return {
				success: false,
				response: signals,
			};
		}

		// Calculate total pages
		const totalRecords: number = await this.getSignalCount();
		const totalPages = Math.ceil(totalRecords / rowsPerPage);

		// Format the response
		const signalsObj = signals.map((signals) => formatSignalResponse(signals));
		const response = {
			signals: signalsObj,
			rowsPerPage,
			page,
			totalPages,
			totalRecords,
			startAfterDoc: signals.length > 0 ? signals[signals.length - 1].id : null,
		};

		return {
			success: true,
			response,
		};
	}

	public async getSignalById(id: string): Promise<ISignalResponse | null> {
		try {
			const signal = await Signal.findById(id)
				.populate(["supportedExchanges", "asset", "baseCurrency"])
				.exec();

			if (!signal) {
				return null;
			}
			return signal as unknown as ISignalResponse;
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
				{ status, endedAt: new Date().toISOString() },
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
