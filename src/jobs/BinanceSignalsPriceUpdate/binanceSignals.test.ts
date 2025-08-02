import mongoose from "mongoose";
import {
	baseCurrencyData,
	bitcoinCoinData,
	bitcoinSignalData,
	cadanoCoinData,
	cadanoSignalData,
	exchangeData,
} from "../../__tests__/constants";
import { Exchange as ExchangeEnum, SignalStatus } from "../../config/enums";
import { IActiveSignalsData, ISignal } from "../../config/interfaces";
import Coin from "../../models/Coin";
import Currency from "../../models/Currency";
import Exchange from "../../models/Exchange";
import { CacheService, ICache } from "../../services/CacheService";
import { SignalService } from "../../services/SignalService";
import * as BinanceWebSockets from "../../websockets/BinanceWebSockets";
import { binanceSignals } from "./binanceSignals";

// Mock Split IO Client
const mockCheckToggleFlag = jest.fn().mockResolvedValue(false);
jest.mock("../../clients/SplitIOClient", () => {
	return {
		FeatureFlagManager: function () {
			return {
				checkToggleFlag: mockCheckToggleFlag,
			};
		},
	};
});

// Mock openBinanceWebSocketConnection to avoid real network calls
jest.mock("../../websockets/BinanceWebSockets", () => ({
	openBinanceWebSocketConnection: jest.fn(),
}));

// Mock BinanceWebSocketService
const mockBinanceSocketCache = {
	closePriceSocket: (signalId: string) => jest.fn(),
	closeOrderBookSocket: (signalId: string) => jest.fn(),
};
jest.mock("../../services/BinanceWebSocketService", () => ({
	BinanceWebSocketService: {
		getInstance: () => mockBinanceSocketCache,
	},
}));

describe("Binance Signals Cron Job", () => {
	let cache: ICache,
		newBitcoinSignal: ISignal,
		newCadanoSignal: ISignal,
		activeSignal: IActiveSignalsData[];

	beforeAll(async () => {
		await Promise.all([
			Exchange.create(exchangeData), // Create exchange
			Currency.create(baseCurrencyData), // Create base currency (Currency)
			Coin.create(bitcoinCoinData), // Create asset (btc)
			Coin.create(cadanoCoinData), // Create asset (Cadano)
		]);

		// Get cache instance
		const cacheService = await CacheService.getInstance();
		cache = await cacheService.getCache();
	});

	beforeEach(async () => {
		mockCheckToggleFlag.mockClear();
		mockCheckToggleFlag.mockResolvedValue(false);

		// Create signals
		const signalService = new SignalService();
		const [bitcoinSignal, cadanoSignal] = await Promise.all([
			signalService.createSignal(bitcoinSignalData),
			signalService.createSignal(cadanoSignalData),
		]);
		newBitcoinSignal = bitcoinSignal as ISignal;
		newCadanoSignal = cadanoSignal as ISignal;
	});

	afterEach(async () => {
		jest.clearAllMocks();

		// Clear all signals after each test
		await mongoose.connection.collection("signals").deleteMany({});
	});

	afterAll(async () => {
		// Clear cache and DB collections after test
		const collections = mongoose.connection.collections;
		await Promise.all([
			cache.deleteAllCacheRecord(),
			collections["exchange"]?.deleteMany({}),
			collections["coin"]?.deleteMany({}),
			collections["currency"]?.deleteMany({}),
		]);
	});

	it("Signals 'status' be pending, 'isSignalTradable' and 'isSignalTriggered' flag should both be false", () => {
		// Bitcoin
		expect(newBitcoinSignal).not.toBeNull();
		expect(newBitcoinSignal?.["entryPrice"]).toEqual(40000);
		expect(newBitcoinSignal?.["status"]).toBe(SignalStatus.PENDING);
		expect(newBitcoinSignal?.["isSignalTradable"]).toBeFalsy();
		expect(newBitcoinSignal?.["isSignalTriggered"]).toBeFalsy();

		// Cadano
		expect(newCadanoSignal).not.toBeNull();
		expect(newCadanoSignal?.["entryPrice"]).toEqual(0.785);
		expect(newCadanoSignal?.["status"]).toBe(SignalStatus.PENDING);
		expect(newCadanoSignal?.["isSignalTradable"]).toBeFalsy();
		expect(newCadanoSignal?.["isSignalTriggered"]).toBeFalsy();
	});

	it("Call 'binanceSignals' cronJob and open signal websocket with actual number of active signals", async () => {
		const signalService = new SignalService();

		// Run the job
		await binanceSignals();

		// Get active signals from db
		activeSignal = await signalService.getExchangeActiveSignals(ExchangeEnum.binance);

		// Verify state of cache
		const cachedPrices = cache.getAllSignalsPrices(ExchangeEnum.binance);
		const cachedOrderBooks = cache.getAllSignalsOrderBooks(ExchangeEnum.binance);

		expect(cachedPrices).toEqual([]);
		expect(cachedOrderBooks).toEqual([]);

		// Should call openBinanceWebSocketConnection for the new signals
		expect(BinanceWebSockets.openBinanceWebSocketConnection).toHaveBeenCalledTimes(
			activeSignal.length
		);
	});

	it("'isSignalTradable' and 'isSignalTriggered' flags should be true and 'status' flag should be ACTIVE when current price is in range", async () => {
		const signalService = new SignalService();

		// Run the job
		await binanceSignals();

		// Get active signals from db
		activeSignal = await signalService.getExchangeActiveSignals(ExchangeEnum.binance);

		// Should call openBinanceWebSocketConnection for the new signals
		expect(BinanceWebSockets.openBinanceWebSocketConnection).toHaveBeenCalledTimes(
			activeSignal.length
		);

		// Manually compute signal with new price and add to cache
		const btc = activeSignal.find((signal) => signal.assetName === "BTC") as IActiveSignalsData;
		const cadano = activeSignal.find(
			(signal) => signal.assetName === "ADA"
		) as IActiveSignalsData;
		const btcCurrentPrice = 39800;
		const cadanoCurrentPrice = 0.787;

		// Compute
		const computedBtcAsset = signalService.computeSignalFlags(btc, btcCurrentPrice);
		const computedCadanoAsset = signalService.computeSignalFlags(cadano, cadanoCurrentPrice);

		// Update cache with price andd asset
		cache.addSignalPrice({
			signalId: btc.signalId,
			exchange: ExchangeEnum.binance,
			asset: computedBtcAsset,
			assetPrice: btcCurrentPrice,
		});
		cache.addSignalPrice({
			signalId: cadano.signalId,
			exchange: ExchangeEnum.binance,
			asset: computedCadanoAsset,
			assetPrice: cadanoCurrentPrice,
		});

		// Verify state of cache
		const cachedPrices = await cache.getAllSignalsPrices(ExchangeEnum.binance);
		const updatedCachedBtc = cachedPrices.find(
			(signal) => signal.signalId === btc?.signalId
		)?.asset;
		const updatedCachedCadano = cachedPrices.find(
			(signal) => signal.signalId === cadano?.signalId
		)?.asset;

		expect(cachedPrices).not.toBeNull();
		expect(cachedPrices).toHaveLength(2);

		// BTC
		expect(updatedCachedBtc?.["isSignalTradable"]).toBeTruthy();
		expect(updatedCachedBtc?.["isSignalTriggered"]).toBeTruthy();
		expect(updatedCachedBtc?.["status"]).toBe(SignalStatus.ACTIVE);

		// CADANO
		expect(updatedCachedCadano?.["isSignalTradable"]).toBeTruthy();
		expect(updatedCachedCadano?.["isSignalTriggered"]).toBeTruthy();
		expect(updatedCachedCadano?.["status"]).toBe(SignalStatus.ACTIVE);
	});

	// Simulate status change from Pending -> Active -> Paused -> Inactive
	// Check isSignalTradable & isSignalTriggered
	it("Signals 'status': Pending -> Active -> Paused -> Inactive, when INACTIVE -> 'isSignalTradable: false', 'isSignalTriggered: true' ", async () => {
		const signalService = new SignalService();

		// Run the job
		await binanceSignals();

		// Get active signals from db
		activeSignal = await signalService.getExchangeActiveSignals(ExchangeEnum.binance);

		// Should call openBinanceWebSocketConnection for the new signals
		expect(BinanceWebSockets.openBinanceWebSocketConnection).toHaveBeenCalledTimes(
			activeSignal.length
		);

		const btc = activeSignal.find((signal) => signal.assetName === "BTC") as IActiveSignalsData;
		let cadano = activeSignal.find(
			(signal) => signal.assetName === "ADA"
		) as IActiveSignalsData;

		// ------------------------ 'status' -> 'ACTIVE' ----------------------------
		let btcCurrentPrice = 39800;
		const cadanoCurrentPrice = 0.787;

		// Compute
		let computedBtcAsset = signalService.computeSignalFlags(btc, btcCurrentPrice);
		const computedCadanoAsset = signalService.computeSignalFlags(cadano, cadanoCurrentPrice);

		// Update cache with price and asset
		cache.addSignalPrice({
			signalId: btc.signalId,
			exchange: ExchangeEnum.binance,
			asset: computedBtcAsset,
			assetPrice: btcCurrentPrice,
		});
		cache.addSignalPrice({
			signalId: cadano.signalId,
			exchange: ExchangeEnum.binance,
			asset: computedCadanoAsset,
			assetPrice: cadanoCurrentPrice,
		});

		// Verify state of cache
		let cachedPrices = await cache.getAllSignalsPrices(ExchangeEnum.binance);
		let updatedCachedBtc = cachedPrices.find((signal) => signal.signalId === btc?.signalId)
			?.asset as IActiveSignalsData;
		let updatedCachedCadano = cachedPrices.find(
			(signal) => signal.signalId === cadano?.signalId
		)?.asset;

		// Assert
		expect(updatedCachedBtc?.["status"]).toBe(SignalStatus.ACTIVE); // BTC
		expect(updatedCachedCadano?.["status"]).toBe(SignalStatus.ACTIVE); // CADANO
		// Assert

		// ----------------------- 'status' -> 'INACTIVE' (BTC) ----------------------------
		// Update price to hit sl for BTC
		btcCurrentPrice = 30000;

		// Compute
		computedBtcAsset = signalService.computeSignalFlags(updatedCachedBtc, btcCurrentPrice);

		// Update cache with price and asset
		cache.addSignalPrice({
			signalId: btc?.signalId,
			exchange: ExchangeEnum.binance,
			asset: computedBtcAsset,
			assetPrice: btcCurrentPrice,
		});

		// Verify state of cache
		cachedPrices = await cache.getAllSignalsPrices(ExchangeEnum.binance);
		updatedCachedBtc = cachedPrices.find((signal) => signal.signalId === btc?.signalId)
			?.asset as IActiveSignalsData;
		updatedCachedCadano = cachedPrices.find(
			(signal) => signal.signalId === cadano?.signalId
		)?.asset;

		// Assert
		expect(updatedCachedCadano?.["status"]).toBe(SignalStatus.ACTIVE); // CADANO

		expect(updatedCachedBtc?.["status"]).toBe(SignalStatus.INACTIVE); // BTC
		expect(updatedCachedBtc?.["isSignalTradable"]).toBeFalsy(); // BTC
		expect(updatedCachedBtc?.["isSignalTriggered"]).toBeTruthy(); // BTC
		expect(updatedCachedBtc?.targetProfits[0].isReached).toBeFalsy(); // BTC
		expect(updatedCachedBtc?.stopLoss.isReached).toBeTruthy(); // BTC
		// Assert

		// -------------------- 'status' -> 'PAUSED' (CADANO) ---------------------------
		// Update CADANO status to PAUSED in DB
		newCadanoSignal = (await signalService.updateSignalById({
			id: cadano.signalId,
			status: SignalStatus.PAUSED,
		})) as ISignal;

		// Run the job another time to fetch update active signals
		await binanceSignals();

		// Get active signals from db after UPDATE
		activeSignal = await signalService.getExchangeActiveSignals(ExchangeEnum.binance);
		cadano = activeSignal.find((signal) => signal.assetName === "ADA") as IActiveSignalsData;

		// Verify state of cache
		cachedPrices = await cache.getAllSignalsPrices(ExchangeEnum.binance);
		updatedCachedCadano = cachedPrices.find(
			(signal) => signal.signalId === cadano?.signalId
		)?.asset;

		// Assert
		// Verify if status is updated in MONGODB
		expect(cadano?.status).toBe(SignalStatus.PAUSED); // CADANO

		// Verify if status is updated in cache
		expect(updatedCachedCadano?.["status"]).toBe(SignalStatus.PAUSED); // CADANO
		// Assert
	});
});
