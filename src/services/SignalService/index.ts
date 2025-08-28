import { DEFAULT_PAGE, DEFAULT_ROWS_PER_PAGE } from "../../config/constants";
import { SignalStatus, TradeSide } from "../../config/enums";
import {
	IActiveSignalsData,
	ITradingPlatform,
	ISignal,
	ISignalPrice,
	ISignalResponse,
	ISignalServiceCreateSignalProps,
	ISignalServiceGetSignalsParams,
	ISignalServiceUpdateSignalByIdProps,
	ICalculateLeverageInput,
	IGetPaginatedSignalInput,
} from "../../config/interfaces";
import { formatSignalResponse, getNestedField } from "../../controllers/helpers";
import Signal from "../../models/Signal";

export class SignalService {
	private calculateLeverage(input: ICalculateLeverageInput): number {
		/**
		 * Calculate leverage for a futures position (LONG or SHORT)
		 *
		 * For LONG:
		 *    L = 1 / ((1 + m) - (Pl / P0))
		 *
		 * For SHORT:
		 *    L = 1 / ((Pl / P0) - (1 - m))
		 *
		 * @param entryPrice - Entry price (P0)
		 * @param stopLossPrice - Liquidation price (Pl)
		 * @param tradeSide - "LONG" or "SHORT"
		 * @param maintenanceMarginRate - Maintenance margin rate (default 0.004 for Binance BTC small positions)
		 * @returns Leverage (number)
		 */
		const { entryPrice, stopLossPrice, tradeSide, maintenanceMarginRate = 0.004 } = input;

		if (entryPrice <= 0 || stopLossPrice <= 0) {
			throw new Error("Entry price and liquidation price must be greater than zero.");
		}

		const ratio = stopLossPrice / entryPrice;
		let denominator: number;

		if (tradeSide === TradeSide.LONG) {
			denominator = 1 + maintenanceMarginRate - ratio;
		} else if (tradeSide === TradeSide.SHORT) {
			denominator = ratio - (1 - maintenanceMarginRate);
		} else {
			throw new Error("Invalid trade side. Must be 'LONG' or 'SHORT'.");
		}

		if (denominator <= 0) {
			throw new Error("Invalid values: denominator is zero or negative. Check inputs.");
		}

		return Math.floor(1 / denominator);
	}

	public async createSignal(props: ISignalServiceCreateSignalProps): Promise<ISignal | null> {
		try {
			// Find existing signals with the same asset ID
			const existingSignals = await Signal.find({
				baseAsset: props.baseAsset, // asset/coin ID
				status: { $ne: SignalStatus.INACTIVE }, // match any signals not INACTIVE
			});

			if (existingSignals && existingSignals.length > 0) {
				// Update all existing signals' status to INACTIVE
				await Signal.updateMany(
					{ baseAsset: props.baseAsset },
					{ status: SignalStatus.INACTIVE, endedAt: new Date().toISOString() }
				);
			}

			// Calcualte signal leverage
			const leverage = this.calculateLeverage({
				entryPrice: props.entryPrice,
				stopLossPrice: props.stopLoss.price,
				tradeSide: props.tradeSide as TradeSide,
			});

			const newSignalData = {
				...props,
				leverage,
			};

			// Create a new Signal document using the provided props
			// const signal = new Signal(props);
			const signal = new Signal(newSignalData);

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
		isSignalTriggered,
	}: ISignalServiceGetSignalsParams): Promise<ISignalResponse[] | null> {
		try {
			const query: any = {};

			// Apply status filter
			if (status?.length) {
				query.status = { $in: status };

				// To filter for ACTIVE/PENDING signals using isSignalTriggered flag (including PAUSED)
				if (
					typeof isSignalTriggered === "boolean" &&
					(status.includes(SignalStatus.ACTIVE) || status.includes(SignalStatus.PENDING))
				) {
					query.isSignalTriggered = isSignalTriggered;
				}
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
				{ path: "supportedTradingPlatforms" },
				{ path: "baseAsset" },
				{ path: "quoteCurrency" },
			]);

			// Apply sorting, skipping, and limiting
			let signals = await signalQuery.exec();

			if (keyword) {
				signals = signals.filter((signal: any) => {
					return (
						signal.baseAsset?.symbol?.match(new RegExp(keyword, "i")) ||
						signal.baseAsset?.name?.match(new RegExp(keyword, "i")) ||
						signal.quoteCurrency?.symbol?.match(new RegExp(keyword, "i")) ||
						signal.quoteCurrency?.name?.match(new RegExp(keyword, "i")) ||
						signal.supportedTradingPlatforms.some((platform: ITradingPlatform) =>
							platform.name.match(new RegExp(keyword, "i"))
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
			const paginatedSignals = signals
				.slice((page - 1) * rowsPerPage, Math.min(page * rowsPerPage, signals.length))
				.map((signal) => {
					const { _id, ...rest } = signal.toObject();

					return {
						id: _id.toString(),
						...rest,
					};
				});

			return paginatedSignals as unknown as ISignalResponse[];
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getPaginatedSignals({
		query,
		status,
		isSignalTriggered,
	}: IGetPaginatedSignalInput) {
		const rowsPerPage = query.rowsPerPage
			? Number.parseInt(query.rowsPerPage as string, 10)
			: DEFAULT_ROWS_PER_PAGE;
		const page = query.page ? Number.parseInt(query.page as string, 10) : DEFAULT_PAGE;
		const sortBy = query.sortBy as string;
		const sortOrder = (query.sortOrder as "asc") ?? "desc";
		const startAfterDoc = query.startAfterDoc as string;
		const keyword = query.keyword as string;

		// Fetch signals using the service method
		const [signals, totalRecords] = await Promise.all([
			this.getSignals({
				rowsPerPage,
				page,
				sortBy,
				sortOrder,
				keyword,
				startAfterDoc,
				status,
				isSignalTriggered,
			}),
			this.getSignalCount({
				status: { $in: status },
				...(typeof isSignalTriggered === "boolean" && {
					isSignalTriggered,
				}),
			}),
		]);

		if (!signals) {
			return {
				success: false,
				response: signals,
			};
		}

		// Calculate total pages
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
				.populate(["supportedTradingPlatforms", "baseAsset", "quoteCurrency"])
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

	public async getSignalCount(filter?: Record<string, any>): Promise<number> {
		try {
			const totalSignal = await Signal.countDocuments(filter);
			return totalSignal;
		} catch (error: any) {
			throw new Error(error.message);
		}
	}

	public async getTradingPlatformActiveSignals(
		tradingPlatform?: string
	): Promise<IActiveSignalsData[]> {
		try {
			const filterCondition = tradingPlatform ? { slug: tradingPlatform } : {};

			// TODO: Fetch all signals that are not inactive
			const activeSignals = await Signal.find({ status: { $ne: SignalStatus.INACTIVE } })
				.populate([
					{
						path: "supportedTradingPlatforms",
						select: "slug -_id",
						match: filterCondition,
					},
				])
				.select(
					"baseAssetName quoteCurrencyName targetProfits stopLoss entryPrice isSignalTradable supportedTradingPlatforms entryPriceUpperBound entryPriceLowerBound tradeSide maxGain status isSignalTriggered"
				)
				.exec();

			// Extracting assets exchange
			const signalAndExchanges = activeSignals
				.filter((signal) => signal.supportedTradingPlatforms.length > 0)
				.map((signal) => {
					const assetName =
						`${signal.baseAssetName}${signal.quoteCurrencyName}`.toLowerCase();
					const tradingPlatforms: string[] = signal.supportedTradingPlatforms.map(
						(platform: any) => platform.slug
					);
					const { _id, supportedTradingPlatforms, ...restSignal } = signal.toObject();

					return {
						...restSignal,
						assetPair: assetName,
						tradingPlatforms,
						signalId: _id.toString(),
					};
				}) as IActiveSignalsData[];

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

				let priceChange: number = 0;
				// Calcute priceChange only after signal is triggered
				if (
					status === SignalStatus.ACTIVE ||
					(status === SignalStatus.PAUSED && isSignalTriggered)
				) {
					if (tradeSide) {
						if (tradeSide === TradeSide.SHORT) {
							priceChange = Number(
								(((entryPrice - currentPrice) / entryPrice) * 100).toFixed(2)
							);
						} else {
							priceChange = Number(
								(((currentPrice - entryPrice) / entryPrice) * 100).toFixed(2)
							);
						}
					} else {
						// for spot trading
						priceChange = Number(
							(((currentPrice - entryPrice) / entryPrice) * 100).toFixed(2)
						);
					}
				}

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
									// Conditionally set endedAt only when status becomes INACTIVE
									...(status === SignalStatus.INACTIVE && {
										endedAt: new Date().toISOString(),
									}),
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
		const entryPrice = signal.entryPrice;
		const entryPriceUpperBound = signal.entryPriceUpperBound;
		const entryPriceLowerBound = signal.entryPriceLowerBound;
		const tradeSide = signal.tradeSide;
		let targetProfits = signal.targetProfits;
		let stopLoss = signal.stopLoss;
		let status = signal.status; // If signal status is paused or inactive, leave status
		let isSignalTradable = signal.isSignalTradable;
		let isSignalTriggered = signal.isSignalTriggered;
		let maxGain = signal.maxGain;

		// Calculate isSignalTradable (either True or False based on conditions below)
		// Check if signal status is pending or active
		// Check if price is in range based on trade direction/side.
		// Note: Once status moves beyond PENDING, isSignalTradable can be false but status won't revert
		isSignalTradable =
			(status === SignalStatus.PENDING || status === SignalStatus.ACTIVE) &&
			(tradeSide === TradeSide.SHORT
				? currentPrice > entryPriceUpperBound && currentPrice < entryPriceLowerBound
				: currentPrice > entryPriceLowerBound && currentPrice < entryPriceUpperBound);

		// Calculate isSignalTriggered (once True, always true)
		// Skip if true, else calculate based on isSignalTradable.
		isSignalTriggered = isSignalTriggered || isSignalTradable;

		// Calculate signal Status - Pending -> Active
		// If signal is pending and signal is triggered, change status to active
		// Once status moves beyond PENDING, it can never go back
		if (status === SignalStatus.PENDING && isSignalTriggered) {
			status = SignalStatus.ACTIVE;
		}

		// Calcute targetProfit, stopLoss, maxGain only after signal is triggered
		if (
			status === SignalStatus.ACTIVE ||
			(status === SignalStatus.PAUSED && isSignalTriggered)
		) {
			// Update target profits
			targetProfits = targetProfits.map((target) => {
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
			stopLoss = {
				...stopLoss,
				isReached: stopLoss.isReached
					? true // Do not update if already true
					: tradeSide === TradeSide.SHORT
					? currentPrice >= stopLoss.price
					: currentPrice <= stopLoss.price,
			};

			// Update max gain
			maxGain = Math.max(
				Math.round(
					tradeSide === TradeSide.SHORT
						? ((entryPrice - currentPrice) / entryPrice) * 100
						: ((currentPrice - entryPrice) / entryPrice) * 100
				),
				signal.maxGain
			);

			// Calculate when all TP or SL is reached to change status for INACTIVE
			const allTargetProfitsReached = targetProfits.every((tp) => tp.isReached);
			const stopLossReached = stopLoss.isReached;

			// Calculate signal Status - Active -> Inactive
			// If signal is active and either all tp or sl is hit, change to inactive
			if (status === SignalStatus.ACTIVE && (allTargetProfitsReached || stopLossReached)) {
				status = SignalStatus.INACTIVE;
			}
		}

		// Final safeguard: Ensure status never moves backwards
		// Once a signal moves beyond PENDING, it can never return to PENDING
		if (signal.status !== SignalStatus.PENDING && status === SignalStatus.PENDING) {
			status = signal.status; // Keep the original status
		}

		// Return updated signal with computed flags
		return {
			...signal,
			isSignalTradable,
			isSignalTriggered,
			targetProfits,
			stopLoss,
			maxGain,
			status,
		};
	}
}
