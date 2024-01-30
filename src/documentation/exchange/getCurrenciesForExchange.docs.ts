import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getCurrenciesForExchangeBody = {
	type: "object",
	required: ["exchangeId"],
	properties: {
		exchangeId: {
			type: "integer",
			example: 123,
		},
	},
};

const getCurrenciesForExchangeById = {
	tags: [RESPONSE_TAGS.exchange],
	description: "Get currencies for an exchange by ExchangeID",
	requestBody: {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/getCurrenciesForExchangeBody",
				},
			},
		},
		required: true,
	},
	responses: {
		[RESPONSE_CODES.ok]: DOC_RESPONSE.SUCCESS,
		[RESPONSE_CODES.badRequest]: DOC_RESPONSE.BADREQUEST,
		[RESPONSE_CODES.unauthorized]: DOC_RESPONSE.UNAUTHORIZED,
		[RESPONSE_CODES.serverError]: DOC_RESPONSE.SERVERERROR,
	},
};

export { getCurrenciesForExchangeBody, getCurrenciesForExchangeById };
