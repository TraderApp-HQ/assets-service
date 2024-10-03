import swaggerJsdoc from "swagger-jsdoc";
import {
	getAllAssetsInExchangeById,
	getCurrenciesForExchangeById,
	getExchangesParams,
	getExchangeById,
	getExchanges,
	updateExchangeInfoBody,
	updateExchangeInfoById,
} from "../documentation/exchange";
import { getCoins, getCoinsParams, getCoinById } from "../documentation/coin";
import {
	createSignalParams,
	getSignalParams,
	getSignalById,
	updateSignalById,
	updateSignalByIdParams,
	updateSignalByIdBody,
	createSignal,
	getSignals,
	getInActiveSignals,
	getActiveSignals,
	getActiveSignalParams,
	getInActiveSignalParams,
} from "../documentation/signal";
import { SIGNAL_ROUTES } from "../config/constants";
import { getCurrencies } from "../documentation/currency";
import {
	getSupportedExchanges,
	getSupportedExchangesParams,
} from "../documentation/exchange/getSupportedExchanges";

const options: swaggerJsdoc.Options = {
	swaggerDefinition: {
		openapi: "3.0.0",
		info: {
			title: "Exchange Service API",
			version: "1.0.0",
			description: "API documentation for Exchange Service Trader App",
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			schemas: {
				getExchangesParams,
				getSupportedExchangesParams,
				updateExchangeInfoBody,
				getCoinsParams,
				getCoins,
				createSignalParams,
				getSignalParams,
				getActiveSignalParams,
				getInActiveSignalParams,
				getSignalById,
				updateSignalById,
				updateSignalByIdParams,
				updateSignalByIdBody,
				getCurrencies,
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		paths: {
			[`/exchanges/`]: { get: getExchanges },
			[`/exchanges/supported/exchanges`]: { get: getSupportedExchanges },
			[`/exchanges/{id}`]: { get: getExchangeById },
			[`/exchanges/update/{exchangeId}`]: { patch: updateExchangeInfoById },
			[`/exchanges/exchange/{exchangeId}`]: { get: getAllAssetsInExchangeById },
			[`/exchanges/currency/{exchangeId}`]: { get: getCurrenciesForExchangeById },

			// coins
			[`/coins/{id}`]: { get: getCoinById },
			[`/coins/`]: { get: getCoins },

			// signals
			[`/signals${SIGNAL_ROUTES.post}`]: { post: createSignal },
			[`/signals${SIGNAL_ROUTES.get}`]: { get: getSignals },
			[`/signals${SIGNAL_ROUTES.getActive}`]: { get: getActiveSignals },
			[`/signals${SIGNAL_ROUTES.getHistory}`]: { get: getInActiveSignals },
			[`/signals/{id}`]: { get: getSignalById },
			[`/signals/update/{id}`]: { patch: updateSignalById },

			// currencies
			[`/currencies/`]: { get: getCurrencies },
		},
	},
	apis: ["./src/routes/*.ts", "./src/models/*.ts"], // Point to your route files
};

const specs = swaggerJsdoc(options);

export default specs;
