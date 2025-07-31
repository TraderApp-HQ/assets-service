// src/jobs/BinanceSignalsPriceUpdate/binanceSignals.test.ts
import mongoose from "mongoose";
import { LocalCacheClient } from "../../clients/LocalCacheClient";
import {
	Candlestick,
	Category,
	ConnectionType,
	Exchange as ExchangeEnum,
	SignalRisk,
	SignalStatus,
	TradeSide,
	TradeType,
} from "../../config/enums";
import { IActiveSignalsData, ISignal } from "../../config/interfaces";
import Coin, { ICoin } from "../../models/Coin";
import Currency, { ICurrency } from "../../models/Currency";
import Exchange, { IExchange } from "../../models/Exchange";
import { CacheService } from "../../services/CacheService";
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
	let bitcoinCoin: ICoin,
		cadanoCoin: ICoin,
		baseCurrency: ICurrency,
		exchange: IExchange,
		cache: LocalCacheClient,
		newBitcoinSignal: ISignal,
		newCadanoSignal: ISignal,
		activeSignal: IActiveSignalsData[];

	beforeAll(async () => {
		// Create exchange
		exchange = await Exchange.create({
			_id: 270,
			name: "Binance",
			slug: "binance",
			logo: "binance.png",
			description: "Binance exchange",
			status: "ACTIVE",
			urls: "https://binance.com",
			makerFee: 0.1,
			takerFee: 0.1,
			dateLaunched: new Date(),
			category: Category.CRYPTO,
			connectionTypes: [ConnectionType.MANUAL],
			isIpAddressWhitelistRequired: true,
			isSpotTradingSupported: true,
			isFuturesTradingSupported: true,
			isMarginTradingSupported: true,
		});

		// Create base currency (Currency)
		baseCurrency = await Currency.create({
			_id: 825,
			name: "Tether USDT",
			symbol: "USDT",
			isTradingActive: true,
			logo: "usdt.png",
		});

		// Create asset (Coin)
		bitcoinCoin = await Coin.create({
			_id: 1,
			name: "Bitcoin",
			slug: "bitcoin",
			symbol: "BTC",
			logo: "btc.png",
			description: "Bitcoin asset",
			urls: "https://bitcoin.org",
			rank: 1,
			isCoinActive: true,
			isTradingActive: true,
			dateLaunched: new Date(),
			category: Category.CRYPTO,
		});

		cadanoCoin = await Coin.create({
			_id: 2010,
			name: "Cadano",
			slug: "cadano",
			symbol: "ADA",
			logo: "ada.png",
			description: "Cadano asset",
			urls: "https://cadano.org",
			rank: 11,
			isCoinActive: true,
			isTradingActive: true,
			dateLaunched: new Date(),
			category: Category.CRYPTO,
		});

		// Get cache instance
		const cacheService = await CacheService.getInstance();
		cache = (await cacheService.getCache()) as LocalCacheClient;
	});

	beforeEach(async () => {
		mockCheckToggleFlag.mockClear();
		mockCheckToggleFlag.mockResolvedValue(false);

		// Signal Data
		const bitcoinSignalData = {
			targetProfits: [
				{ price: 45000, percent: 0, isReached: false },
				{ price: 50000, percent: 0, isReached: false },
				{ price: 55000, percent: 0, isReached: false },
				{ price: 60000, percent: 0, isReached: false },
			],
			stopLoss: { price: 35000, percent: 0, isReached: false },
			entryPrice: 40000,
			entryPriceLowerBound: 39500,
			entryPriceUpperBound: 40500,
			tradeNote: "Bitcoin Test signal",
			candlestick: Candlestick.oneHour,
			risk: SignalRisk.medium,
			isSignalTradable: false,
			isSignalTriggered: false,
			chartUrl: "https://chart.com",
			status: SignalStatus.PENDING,
			maxGain: 0,
			createdAt: new Date().toISOString(),
			supportedExchanges: [exchange._id],
			asset: bitcoinCoin._id,
			assetName: bitcoinCoin.symbol,
			baseCurrency: baseCurrency._id,
			baseCurrencyName: baseCurrency.symbol,
			category: Category.CRYPTO,
			tradeType: TradeType.FUTURES,
			tradeSide: TradeSide.LONG,
			leverage: 4,
		};
		const cadanoSignalData = {
			targetProfits: [
				{ price: 0.775, percent: 0, isReached: false },
				{ price: 0.765, percent: 0, isReached: false },
				{ price: 0.76, percent: 0, isReached: false },
				{ price: 0.755, percent: 0, isReached: false },
			],
			stopLoss: { price: 0.8, percent: 0, isReached: false },
			entryPrice: 0.785,
			entryPriceLowerBound: 0.79,
			entryPriceUpperBound: 0.78,
			tradeNote: "Cadano Test signal",
			candlestick: Candlestick.oneHour,
			risk: SignalRisk.medium,
			isSignalTradable: false,
			isSignalTriggered: false,
			chartUrl: "https://chart.com",
			status: SignalStatus.PENDING,
			maxGain: 0,
			createdAt: new Date().toISOString(),
			supportedExchanges: [exchange._id],
			asset: cadanoCoin._id,
			assetName: cadanoCoin.symbol,
			baseCurrency: baseCurrency._id,
			baseCurrencyName: baseCurrency.symbol,
			category: Category.CRYPTO,
			tradeType: TradeType.FUTURES,
			tradeSide: TradeSide.SHORT,
			leverage: 2,
		};

		// Create signals
		const signalService = new SignalService();
		newBitcoinSignal = (await signalService.createSignal(bitcoinSignalData)) as ISignal;
		newCadanoSignal = (await signalService.createSignal(cadanoSignalData)) as ISignal;
	});

	afterEach(async () => {
		jest.clearAllMocks();

		// Remove all signals before each test
		await mongoose.connection.collection("signals").deleteMany({});
	});

	afterAll(() => {
		// Clear cache after test
		cache.deleteAllCacheRecord();
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
		const cachedPrices = cache.getAllSignalsPrices(ExchangeEnum.binance);
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
		let cachedPrices = cache.getAllSignalsPrices(ExchangeEnum.binance);
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
		cachedPrices = cache.getAllSignalsPrices(ExchangeEnum.binance);
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
		cachedPrices = cache.getAllSignalsPrices(ExchangeEnum.binance);
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
