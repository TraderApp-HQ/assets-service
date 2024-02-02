import swaggerJsdoc from "swagger-jsdoc";
import { ROUTES } from "../config/constants";
import {
	getAllAssetsInExchangeById,
	getCurrenciesForExchangeById,
	getExchangesParams,
	getExchangeById,
	getExchanges,
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
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
		paths: {
			[`/exchanges${ROUTES.get}`]: { get: getExchanges },
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
