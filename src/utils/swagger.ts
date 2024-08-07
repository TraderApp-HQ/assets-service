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
				updateExchangeInfoBody,
				getCoinsParams,
				getCoins,
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		paths: {
			[`/exchanges/`]: { get: getExchanges },
			[`/exchanges/{id}`]: { get: getExchangeById },
			[`/exchanges/update/{exchangeId}`]: { patch: updateExchangeInfoById },
			[`/exchanges/exchange/{exchangeId}`]: { get: getAllAssetsInExchangeById },
			[`/exchanges/currency/{exchangeId}`]: { get: getCurrenciesForExchangeById },

			// coins
			[`/coins/{id}`]: { get: getCoinById },
			[`/coins/`]: { get: getCoins },
		},
	},
	apis: ["./src/routes/*.ts", "./src/models/*.ts"], // Point to your route files
};

const specs = swaggerJsdoc(options);

export default specs;
