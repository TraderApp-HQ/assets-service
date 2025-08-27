import mongoose from "mongoose";
import {
	bitcoinCoinData,
	cadanoCoinData,
	exchangeData,
	quoteCurrencyData,
	bitcoinSignalData,
	cadanoSignalData,
} from "../__tests__/constants";
import { SignalStatus, TradeSide } from "../config/enums";
import { SignalService } from "../services/SignalService";
import Asset from "../models/Asset";
import Currency from "../models/Currency";
import TradingPlatform from "../models/TradingPlatform";
import Signal from "../models/Signal";

describe("Signal Service", () => {
	beforeAll(async () => {
		await Promise.all([
			TradingPlatform.create(exchangeData),
			Currency.create(quoteCurrencyData),
			Asset.create(bitcoinCoinData),
			Asset.create(cadanoCoinData),
		]);
	});

	afterEach(async () => {
		// Clear signals between tests
		await mongoose.connection.collection("signals").deleteMany({});
	});

	afterAll(async () => {
		// Clear all created collections
		const collections = mongoose.connection.collections;
		await Promise.all([
			collections["trading-platform"]?.deleteMany({}),
			collections["asset"]?.deleteMany({}),
			collections["currency"]?.deleteMany({}),
		]);
	});

	describe("createSignal", () => {
		it("creates a signal with computed leverage and inactivates existing signals for the same baseAsset", async () => {
			const service = new SignalService();

			// 1) Create initial BTC signal
			const first = await service.createSignal(bitcoinSignalData);
			expect(first).toBeTruthy();

			// Expected leverage for LONG with entry=40000, stop=35000, m=0.004 → floor(1 / (1.004 - 0.875)) = 7
			expect(first?.["leverage"]).toBe(7);
			expect(first?.["status"]).toBe(SignalStatus.PENDING);

			// 2) Create another BTC signal; previous BTC signals should become INACTIVE
			const secondInput = {
				...bitcoinSignalData,
				tradeNote: "Second BTC signal",
				// tweak prices so leverage changes
				entryPrice: 41000,
				stopLoss: { ...bitcoinSignalData.stopLoss, price: 36000 },
			};
			const second = await service.createSignal(secondInput);
			expect(second).toBeTruthy();
			expect(second?.["status"]).toBe(SignalStatus.PENDING);
			expect(second?.["baseAsset"]).toBe(bitcoinSignalData.baseAsset);

			// Verify leverage recalculates (LONG: floor(1 / (1.004 - 36000/41000)))
			const ratio = 36000 / 41000;
			const denom = 1.004 - ratio;
			const expectedLev = Math.floor(1 / denom);
			expect(second?.["leverage"]).toBe(expectedLev);

			// Verify the previous BTC signal is set to INACTIVE and has endedAt
			const btcSignals = await Signal.find({ baseAsset: bitcoinSignalData.baseAsset }).lean();
			const inactive = btcSignals.filter((s) => s.status === SignalStatus.INACTIVE);
			expect(inactive.length).toBe(1);
			expect(inactive[0].endedAt).toBeTruthy();

			// Create a SHORT signal (ADA) and verify leverage uses SHORT formula
			const ada = await service.createSignal(cadanoSignalData);
			expect(ada).toBeTruthy();
			// SHORT leverage: floor(1 / ((stop/entry) - (1 - 0.004)))
			const shortRatio = cadanoSignalData.stopLoss.price / cadanoSignalData.entryPrice;
			const shortDenom = shortRatio - (1 - 0.004);
			const expectedShortLev = Math.floor(1 / shortDenom);
			expect(ada?.["tradeSide"]).toBe(TradeSide.SHORT);
			expect(ada?.["leverage"]).toBe(expectedShortLev);
		});
	});

	describe("getPaginatedSignals", () => {
		it("returns paginated, formatted signals with correct counts and startAfterDoc", async () => {
			const service = new SignalService();

			// Create 12 signals alternating BTC and ADA to populate data
			const createInputs = Array.from({ length: 12 }).map((_, idx) => {
				// alternate between BTC and ADA; changing createdAt for deterministic ordering
				const isBtc = idx % 2 === 0;
				const base = isBtc ? bitcoinSignalData : cadanoSignalData;
				return {
					...base,
					tradeNote: `${isBtc ? "BTC" : "ADA"} signal ${idx + 1}`,
					createdAt: new Date(Date.now() + idx * 1000).toISOString(),
					// Slightly vary entry/stop to avoid identical leverage if needed
					entryPrice: base.entryPrice,
					stopLoss: { ...base.stopLoss },
				};
			});

			await Promise.all(createInputs.map(async (input) => await service.createSignal(input)));

			// Query page 2 with rowsPerPage 5; include both PENDING and INACTIVE (since each new create inactivates previous)
			const res = await service.getPaginatedSignals({
				query: { rowsPerPage: "5", page: "2", sortBy: "createdAt", sortOrder: "desc" },
				status: [SignalStatus.PENDING, SignalStatus.INACTIVE],
			});

			expect(res.success).toBe(true);
			const { signals, rowsPerPage, page, totalPages, totalRecords, startAfterDoc } =
				res.response as any;

			expect(rowsPerPage).toBe(5);
			expect(page).toBe(2);
			expect(totalRecords).toBe(12);
			expect(totalPages).toBe(Math.ceil(12 / 5));
			expect(signals.length).toBe(5);

			// Response items are formatted via formatSignalResponse
			const s = signals[0];
			expect(s).toHaveProperty("id");
			expect(s).toHaveProperty("baseAsset.id");
			expect(s).toHaveProperty("baseAsset.name");
			expect(s).toHaveProperty("quoteCurrency.id");
			expect(Array.isArray(s.supportedTradingPlatforms)).toBe(true);

			// startAfterDoc should equal the last id on this page
			const lastOnPageId = signals[signals.length - 1].id;
			expect(startAfterDoc).toBe(lastOnPageId);
		});
	});
});
