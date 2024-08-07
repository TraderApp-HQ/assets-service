import { apiDocumentationResponseObject } from "@traderapp/shared-resources";

export const ENVIRONMENTS: Record<string, string> = Object.freeze({
	development: "dev",
	staging: "staging",
	production: "prod",
});

export const RESPONSE_CODES = {
	ok: "200",
	created: "201",
	badRequest: "400",
	unauthorized: "401",
	serverError: "500",
	notFound: "404",
	forbidden: "403",
	request_timeout: "408",
	conflict: "409",
};

export const ResponseType = {
	SUCCESS: "success",
	ERROR: "error",
};

export const RESPONSE_TAGS = {
	exchange: "Exchange",
	coin: "Coin",
};

export const ResponseMessage = {
	GET_EXCHANGES: "Exchanges Fetched Successfully",
	GET_EXCHANGE: "Exchange Fetched Successfully",
	GET_ASSETS: "All Assets in an Exchange Fetched Successfully ",
	UPDATE_EXCHANGE: "Exchange Updated Successfully",
	GET_CURRENCIES: "All Currency Fetched Successfully",
	EXCHANGE_NOT_FOUND: "Exchange not found.",

	GET_COINS: "Coins Fetched Successfully",
	GET_COIN: "Coin Fetched Successfully",
};

export const DEFAULT_ROWS_PER_PAGE = 10;

export const DEFAULT_PAGE = 1;

export const ROUTES = {
	get: "/",
	getExchangeById: "/:id",
	patchExchangeById: "/update/:exchangeId",
	getAllAssets: "/exchange/:exchangeId",
	getByCurrencies: "/currency/:exchangeId",
};

export const DOC_RESPONSE = {
	SERVERERROR: apiDocumentationResponseObject("Internal Server Error"),
	UNAUTHORIZED: apiDocumentationResponseObject("Error: Unauthorized"),
	BADREQUEST: apiDocumentationResponseObject("Error: Bad Request"),
	SUCCESS: apiDocumentationResponseObject("Success"),
};
