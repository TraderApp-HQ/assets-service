import mongoose from "mongoose";
import { CacheService, ICache } from "../../services/CacheService";
import Exchange from "../../models/Exchange";
import Currency from "../../models/Currency";
import Coin from "../../models/Coin";
import {
	baseCurrencyData,
	bitcoinCoinData,
	bitcoinSignalData,
	cadanoCoinData,
	cadanoSignalData,
	exchangeData,
} from "../../__tests__/constants";
import { SignalService } from "../../services/SignalService";
import { IActiveSignalsData, ISignal } from "../../config/interfaces";
import { Exchange as ExchangeEnum, SignalStatus } from "../../config/enums";
import { dbPrice } from "./dbPrice";

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

describe("DB Price Update Job", () => {
	let cache: ICache,
		newBitcoinSignal: ISignal,
		newCadanoSignal: ISignal,
		activeSignals: IActiveSignalsData[];

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

		// Create signals
		const signalService = new SignalService();
		const [bitcoinSignal, cadanoSignal] = await Promise.all([
			signalService.createSignal(bitcoinSignalData),
			signalService.createSignal(cadanoSignalData),
		]);
		newBitcoinSignal = bitcoinSignal as ISignal;
		newCadanoSignal = cadanoSignal as ISignal;
	});

	beforeEach(async () => {
		mockCheckToggleFlag.mockClear();
		mockCheckToggleFlag.mockResolvedValue(false);
	});

	afterEach(async () => {
		jest.clearAllMocks();
	});

	afterAll(async () => {
		// Clear cache and database collection after test
		const collections = mongoose.connection.collections;
		await Promise.all([
			cache.deleteAllCacheRecord(),
			collections["signals"]?.deleteMany({}),
			collections["exchange"]?.deleteMany({}),
			collections["coin"]?.deleteMany({}),
			collections["currency"]?.deleteMany({}),
		]);
	});

	it("Signals 'status' be pending, 'isSignalTradable' and 'isSignalTriggered' flag should both be false", () => {
		// Bitcoin
		expect(newBitcoinSignal).not.toBeNull();
		expect(newBitcoinSignal?.["status"]).toBe(SignalStatus.PENDING);
		expect(newBitcoinSignal?.["isSignalTradable"]).toBeFalsy();
		expect(newBitcoinSignal?.["isSignalTriggered"]).toBeFalsy();

		// Cadano
		expect(newCadanoSignal).not.toBeNull();
		expect(newCadanoSignal?.["status"]).toBe(SignalStatus.PENDING);
		expect(newCadanoSignal?.["isSignalTradable"]).toBeFalsy();
		expect(newCadanoSignal?.["isSignalTriggered"]).toBeFalsy();
	});

	it("Signal 'status' -> ACTIVE for btc & cadano in cache & DB", async () => {
		const signalService = new SignalService();
		// Get active signals from db
		activeSignals = await signalService.getExchangeActiveSignals(ExchangeEnum.binance);

		// Assert active signals is available
		expect(activeSignals).not.toBeNull();

		// Manually Compute signals

		// Get individual active signals
		const btc = activeSignals.find(
			(signal) => signal.assetName === "BTC"
		) as IActiveSignalsData;
		const cadano = activeSignals.find(
			(signal) => signal.assetName === "ADA"
		) as IActiveSignalsData;

		// --------- Trigger STATUS -> ACTIVE for BTC and ADA ---------
		// Signals current price
		let btcCurrentPrice = 40200;
		let cadanoCurrentPrice = 0.782;

		// Compute
		let computedBtcAsset = signalService.computeSignalFlags(btc, btcCurrentPrice);
		let computedCadanoAsset = signalService.computeSignalFlags(cadano, cadanoCurrentPrice);

		// Update cache with price andd asset
		await Promise.all([
			cache.addSignalPrice({
				signalId: btc.signalId,
				exchange: ExchangeEnum.binance,
				asset: computedBtcAsset,
				assetPrice: btcCurrentPrice,
			}),
			cache.addSignalPrice({
				signalId: cadano.signalId,
				exchange: ExchangeEnum.binance,
				asset: computedCadanoAsset,
				assetPrice: cadanoCurrentPrice,
			}),
		]);

		//  ------ Trigger TP 2 for BTC and ADA ------
		// Update Signals current price
		btcCurrentPrice = 52000;
		cadanoCurrentPrice = 0.762;

		// Re-Compute signals
		computedBtcAsset = signalService.computeSignalFlags(computedBtcAsset, btcCurrentPrice);
		computedCadanoAsset = signalService.computeSignalFlags(
			computedCadanoAsset,
			cadanoCurrentPrice
		);

		// Update cache with updated price and asset
		await Promise.all([
			cache.addSignalPrice({
				signalId: btc.signalId,
				exchange: ExchangeEnum.binance,
				asset: computedBtcAsset,
				assetPrice: btcCurrentPrice,
			}),
			cache.addSignalPrice({
				signalId: cadano.signalId,
				exchange: ExchangeEnum.binance,
				asset: computedCadanoAsset,
				assetPrice: cadanoCurrentPrice,
			}),
		]);

		// Call update DB cronJob
		await dbPrice();

		// Get signals from cache and DB, then compare...
		const [cachedPrices, dbSignals] = await Promise.all([
			cache.getAllSignalsPrices(ExchangeEnum.binance),
			signalService.getExchangeActiveSignals(ExchangeEnum.binance),
		]);
		const dbBtc = dbSignals.find((signal) => signal.assetName === "BTC") as IActiveSignalsData;
		const dbCadano = dbSignals.find(
			(signal) => signal.assetName === "ADA"
		) as IActiveSignalsData;

		const cacheBtc = cachedPrices.find((price) => price.signalId === dbBtc.signalId)?.asset;
		const cacheCadano = cachedPrices.find(
			(price) => price.signalId === dbCadano.signalId
		)?.asset;

		// Assert -> status -> isSignalTradable -> isSignalTriggered -> TP -> SL
		// BTC
		expect(dbBtc.status).toBe(SignalStatus.ACTIVE);
		expect(dbBtc.status).toEqual(cacheBtc?.status);
		expect(dbBtc.isSignalTradable).toBeFalsy();
		expect(dbBtc.isSignalTradable).toEqual(cacheBtc?.isSignalTradable);
		expect(dbBtc.isSignalTriggered).toBeTruthy();
		expect(dbBtc.isSignalTriggered).toEqual(cacheBtc?.isSignalTriggered);
		expect(dbBtc.targetProfits[1].isReached).toBeTruthy();
		expect(dbBtc.targetProfits[1].isReached).toEqual(cacheBtc?.targetProfits[1].isReached);
		expect(dbBtc.stopLoss.isReached).toBeFalsy();
		expect(dbBtc.stopLoss.isReached).toEqual(cacheBtc?.stopLoss.isReached);

		// CADANO
		expect(dbCadano.status).toBe(SignalStatus.ACTIVE);
		expect(dbCadano.status).toEqual(cacheCadano?.status);
		expect(dbCadano.isSignalTradable).toBeFalsy();
		expect(dbCadano.isSignalTradable).toEqual(cacheCadano?.isSignalTradable);
		expect(dbCadano.isSignalTriggered).toBeTruthy();
		expect(dbCadano.isSignalTriggered).toEqual(cacheCadano?.isSignalTriggered);
		expect(dbCadano.targetProfits[1].isReached).toBeTruthy();
		expect(dbCadano.targetProfits[1].isReached).toEqual(
			cacheCadano?.targetProfits[1].isReached
		);
		expect(dbCadano.stopLoss.isReached).toBeFalsy();
		expect(dbCadano.stopLoss.isReached).toEqual(cacheCadano?.stopLoss.isReached);
	});

	// Signals to INACTIVE with one hitting all TP and the other hitting SL
	it("Signal 'status' -> INACTIVE for btc & cadano in cache & DB, BTC -> TP4 AND ADA -> SL", async () => {
		const signalService = new SignalService();
		// Get active signals from db
		activeSignals = await signalService.getExchangeActiveSignals(ExchangeEnum.binance);

		// Assert active signals is available
		expect(activeSignals).not.toBeNull();

		// Manually Compute signals

		// Get individual active signals
		const btc = activeSignals.find(
			(signal) => signal.assetName === "BTC"
		) as IActiveSignalsData;
		const cadano = activeSignals.find(
			(signal) => signal.assetName === "ADA"
		) as IActiveSignalsData;

		// --------- Trigger STATUS -> INACTIVE for BTC and ADA ---------
		// Signals current price
		const btcCurrentPrice = 61000; // BTC hits TP4
		const cadanoCurrentPrice = 0.9; // CADANO hits SL

		// Compute
		const computedBtcAsset = signalService.computeSignalFlags(btc, btcCurrentPrice);
		const computedCadanoAsset = signalService.computeSignalFlags(cadano, cadanoCurrentPrice);

		// Update cache with price andd asset
		await Promise.all([
			cache.addSignalPrice({
				signalId: btc.signalId,
				exchange: ExchangeEnum.binance,
				asset: computedBtcAsset,
				assetPrice: btcCurrentPrice,
			}),
			cache.addSignalPrice({
				signalId: cadano.signalId,
				exchange: ExchangeEnum.binance,
				asset: computedCadanoAsset,
				assetPrice: cadanoCurrentPrice,
			}),
		]);

		// Call update DB cronJob
		await dbPrice();

		// Get signals from cache and DB, then compare...
		const [cachedPrices, dbSignals] = await Promise.all([
			cache.getAllSignalsPrices(ExchangeEnum.binance),
			signalService.getExchangeActiveSignals(ExchangeEnum.binance),
		]);

		const cacheBtc = cachedPrices.find((price) => price.signalId === btc.signalId)
			?.asset as IActiveSignalsData;
		const cacheCadano = cachedPrices.find((price) => price.signalId === cadano.signalId)
			?.asset as IActiveSignalsData;

		// Assert -> status -> TP -> SL
		// BTC
		expect(cacheBtc.status).toBe(SignalStatus.INACTIVE);
		expect(cacheBtc.targetProfits.every((tp) => tp.isReached)).toBeTruthy();
		expect(cacheBtc.stopLoss.isReached).toBeFalsy();

		// CADANO
		expect(cacheCadano.status).toBe(SignalStatus.INACTIVE);
		expect(cacheCadano.targetProfits.every((tp) => tp.isReached)).toBeFalsy();
		expect(cacheCadano.stopLoss.isReached).toBeTruthy();

		// Assert no current ACTIVE signals in DB
		expect(dbSignals.length).toBe(0);
	});
});
