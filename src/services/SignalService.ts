import { DEFAULT_PAGE, DEFAULT_ROWS_PER_PAGE } from "../config/constants";
import { SignalStatus, TradeSide } from "../config/enums";
import {
	IActiveSignalsData,
	IExchange,
	ISignal,
	ISignalPrice,
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

	public async getExchangeActiveSignals(exchange?: string): Promise<IActiveSignalsData[]> {
		try {
			const filterCondition = exchange ? { slug: exchange } : {};

			// TODO: Fetch all signals that are not inactive
			const activeSignals = await Signal.find({ status: { $ne: SignalStatus.INACTIVE } })
				.populate([
					{ path: "supportedExchanges", select: "slug -_id", match: filterCondition },
				])
				.select(
					"assetName baseCurrencyName targetProfits stopLoss entryPrice isSignalTradable supportedExchanges entryPriceUpperBound entryPriceLowerBound tradeSide maxGain status isSignalTriggered"
				)
				.exec();

			// Extracting assets exchange
			const signalAndExchanges = activeSignals
				.filter((signal) => signal.supportedExchanges.length > 0)
				.map((signal: any) => {
					const assetName = `${signal.assetName}${signal.baseCurrencyName}`.toLowerCase();
					const exchanges: string[] = signal.supportedExchanges.map(
						(exchange: any) => exchange.slug
					);
					const { _id, supportedExchanges, ...restSignal } = signal.toObject();

					return {
						...restSignal,
						assetPair: assetName,
						exchanges,
						signalId: _id.toString(),
					};
				});

			return signalAndExchanges;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async updateSignalsDataInDB(signals: ISignalPrice[]) {
		try {
			// Update operation
			const bulkPriceUpdate = signals.map((signal) => {
				const signalId = signal.signalId;
				const currentPrice = signal.assetPrice;
				const entryPrice = signal.asset.entryPrice;
				const tradeSide = signal.asset.tradeSide;
				const targetProfits = signal.asset.targetProfits;
				const stopLoss = signal.asset.stopLoss;
				const maxGain = signal.asset.maxGain;
				const isSignalTradable = signal.asset.isSignalTradable;
				const isSignalTriggered = signal.asset.isSignalTriggered;
				const status = signal.asset.status;

				let priceChange: number;
				if (tradeSide) {
					if (tradeSide === TradeSide.SHORT) {
						priceChange = Number(
							((entryPrice - currentPrice) / entryPrice) * 100
						).toFixed(2) as unknown as number;
					} else {
						priceChange = Number(
							((currentPrice - entryPrice) / entryPrice) * 100
						).toFixed(2) as unknown as number;
					}
				} else {
					// for spot trading
					priceChange = Number(((currentPrice - entryPrice) / entryPrice) * 100).toFixed(
						2
					) as unknown as number;
				}

				/**

				// Update target profits
				const calcTargetProfits = targetProfits.map((target) => {
					let isReached = target.isReached;
					if (tradeSide) {
						if (tradeSide === TradeSide.SHORT) {
							isReached = currentPrice <= target.price;
						} else {
							isReached = currentPrice >= target.price;
						}
					} else {
						isReached = currentPrice >= target.price;
					}
					return {
						...target,
						isReached: target.isReached ? true : isReached,
					};
				});

				// Update stop loss
				const calcStopLoss = {
					...stopLoss,
					isReached: stopLoss.isReached
						? true // Do not update if already true
						: tradeSide === TradeSide.SHORT
						? currentPrice >= stopLoss.price
						: currentPrice <= stopLoss.price,
				};

				// Update max gain
				const calcMaxGain = Math.max(
					Math.round(
						tradeSide === TradeSide.SHORT
							? ((entryPrice - currentPrice) / entryPrice) * 100
							: ((currentPrice - entryPrice) / entryPrice) * 100
					),
					signal.asset.maxGain
				);

				// Calculate isSignalTradable (either True or False based on conditions below)
				// Check if signal status is pending or active
				// Check if signal is already triggered
				// Check if price is in range based on trade direction/side.
				isSignalTradable =
					(status === SignalStatus.PENDING || status === SignalStatus.ACTIVE) &&
					(tradeSide === TradeSide.SHORT
						? currentPrice > entryPriceUpperBound && currentPrice < entryPriceLowerBound
						: currentPrice > entryPriceLowerBound &&
						  currentPrice < entryPriceUpperBound);

				// Calculate isSignalTriggered (once True, always true)
				// Skip if true, else calculate based on isSignalTradable.
				isSignalTriggered = isSignalTriggered || isSignalTradable;

				// Calculate when final TP or SL is reached to change status for INACTIVE
				const finalTakeProfitReached =
					calcTargetProfits[calcTargetProfits.length - 1]?.isReached;
				const stopLossReached = calcStopLoss.isReached;

				// Calculate signal status
				// Status - Pending, Active, Inactive
				// If signal is paused or inactive, leave status
				// else if signal is pending and signal is triggered, change status to active
				// else if signal is active and either tp4 or sl is hit, change to inactive
				if (status === SignalStatus.PENDING && isSignalTriggered) {
					status = SignalStatus.ACTIVE;
				}
				if (status === SignalStatus.ACTIVE && (finalTakeProfitReached || stopLossReached)) {
					status = SignalStatus.INACTIVE;
				}

				**/

				return {
					updateOne: {
						filter: { _id: signalId },
						update: [
							{
								$set: {
									currentPrice,
									isSignalTradable,
									isSignalTriggered,
									targetProfits,
									stopLoss,
									maxGain,
									currentChange: priceChange,
									// The status field is updated using aggregation pipeline conditions
									status: {
										$cond: [
											{ $eq: ["$status", SignalStatus.PAUSED] }, // If current status in DB is PAUSED
											"$status", // then keep the status as PAUSED
											status, // else update to the new status
										],
									},
								},
							},
						],
					},
				};
			});

			// Execute bulk write update operation
			await Signal.bulkWrite(bulkPriceUpdate);
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public computeSignalFlags(
		signal: IActiveSignalsData,
		currentPrice: number
	): IActiveSignalsData {
		const targetProfits = signal.targetProfits;
		const stopLoss = signal.stopLoss;
		const entryPrice = signal.entryPrice;
		const entryPriceUpperBound = signal.entryPriceUpperBound;
		const entryPriceLowerBound = signal.entryPriceLowerBound;
		const tradeSide = signal.tradeSide;
		let status = signal.status;
		let isSignalTradable = signal.isSignalTradable;
		let isSignalTriggered = signal.isSignalTriggered;

		// Update target profits
		const calcTargetProfits = targetProfits.map((target) => {
			let isReached = target.isReached;
			if (tradeSide) {
				if (tradeSide === TradeSide.SHORT) {
					isReached = currentPrice <= target.price;
				} else {
					isReached = currentPrice >= target.price;
				}
			} else {
				isReached = currentPrice >= target.price;
			}
			return {
				...target,
				isReached: target.isReached ? true : isReached,
			};
		});

		// Update stop loss
		const calcStopLoss = {
			...stopLoss,
			isReached: stopLoss.isReached
				? true // Do not update if already true
				: tradeSide === TradeSide.SHORT
				? currentPrice >= stopLoss.price
				: currentPrice <= stopLoss.price,
		};

		// Update max gain
		const calcMaxGain = Math.max(
			Math.round(
				tradeSide === TradeSide.SHORT
					? ((entryPrice - currentPrice) / entryPrice) * 100
					: ((currentPrice - entryPrice) / entryPrice) * 100
			),
			signal.maxGain
		);

		// Calculate isSignalTradable (either True or False based on conditions below)
		// Check if signal status is pending or active
		// Check if signal is already triggered
		// Check if price is in range based on trade direction/side.
		isSignalTradable =
			(status === SignalStatus.PENDING || status === SignalStatus.ACTIVE) &&
			(tradeSide === TradeSide.SHORT
				? currentPrice > entryPriceUpperBound && currentPrice < entryPriceLowerBound
				: currentPrice > entryPriceLowerBound && currentPrice < entryPriceUpperBound);

		// Calculate isSignalTriggered (once True, always true)
		// Skip if true, else calculate based on isSignalTradable.
		isSignalTriggered = isSignalTriggered || isSignalTradable;

		// Calculate when final TP or SL is reached to change status for INACTIVE
		const finalTakeProfitReached = calcTargetProfits[calcTargetProfits.length - 1]?.isReached;
		const stopLossReached = calcStopLoss.isReached;

		// Calculate signal status
		// Status - Pending, Active, Inactive
		// If signal is paused or inactive, leave status
		// else if signal is pending and signal is triggered, change status to active
		// else if signal is active and either tp4 or sl is hit, change to inactive
		if (status === SignalStatus.PENDING && isSignalTriggered) {
			status = SignalStatus.ACTIVE;
		} else if (status === SignalStatus.ACTIVE && (finalTakeProfitReached || stopLossReached)) {
			status = SignalStatus.INACTIVE;
		}

		// Return updated signal with computed flags
		// Note: This does not update the database, it just computes the flags
		const updatedSignal = {
			...signal,
			isSignalTradable,
			isSignalTriggered,
			targetProfits: calcTargetProfits,
			stopLoss: calcStopLoss,
			maxGain: calcMaxGain,
			status,
		};

		return updatedSignal;
	}
}
