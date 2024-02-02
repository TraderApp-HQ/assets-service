import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getCurrenciesForExchangeById = {
	tags: [RESPONSE_TAGS.exchange],
	parameters: [
		{
			in: "path",
			name: "exchangeId",
			required: true,
			schema: {
				type: "integer",
			},
			description: "Get currencies for an exchange by ExchangeID",
			example: 123,
		},
	],
	responses: {
		[RESPONSE_CODES.ok]: DOC_RESPONSE.SUCCESS,
		[RESPONSE_CODES.badRequest]: DOC_RESPONSE.BADREQUEST,
		[RESPONSE_CODES.unauthorized]: DOC_RESPONSE.UNAUTHORIZED,
		[RESPONSE_CODES.serverError]: DOC_RESPONSE.SERVERERROR,
	},
};

export { getCurrenciesForExchangeById };
