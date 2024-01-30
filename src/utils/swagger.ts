import swaggerJsdoc from "swagger-jsdoc";
import { ROUTES } from "../config/constants";
import {
	getAllAssetsInExchangeBody,
	getAllAssetsInExchangeById,
	getCurrenciesForExchangeBody,
	getCurrenciesForExchangeById,
	getExchange,
	getExchangeBody,
	getExchangeById,
	getExchangeByIdBody,
	updateExchangeInfoBody,
	updateExchangeInfoById,
} from "../documentation/exchange";

const options: swaggerJsdoc.Options = {
	swaggerDefinition: {
		openapi: "3.0.0",
		info: {
			title: "Exchange Service API",
			version: "1.0.0",
			description: "API documentation for Exchange Service Trader App",
		},
		components: {
			securitySchemas: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			schemas: {
				getExchangeBody,
				getAllAssetsInExchangeBody,
				getCurrenciesForExchangeBody,
				getExchangeByIdBody,
				updateExchangeInfoBody,
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		paths: {
			[`/exchanges${ROUTES.get}`]: { get: getExchange },
			[`/exchanges${ROUTES.getById}`]: { get: getExchangeById },
			[`/exchanges${ROUTES.patchById}`]: { patch: updateExchangeInfoById },
			[`/exchanges${ROUTES.getAllAssets}`]: { get: getAllAssetsInExchangeById },
			[`/exchanges${ROUTES.getByCurrencies}`]: { get: getCurrenciesForExchangeById },
		},
	},
	apis: ["./src/routes/*.ts", "./src/models/*.ts"], // Point to your route files
};

const specs = swaggerJsdoc(options);

export default specs;
