import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getSupportedExchangesParams = {
	type: "object",
	properties: {
		coinId: {
			type: "integer",
			description: "coin or asset id",
			example: 2,
		},
		currencyId: {
			type: "integer",
			description: "currency id",
			example: 825,
		},
	},
};

const getSupportedExchanges = {
	tags: [RESPONSE_TAGS.exchange],
	description: "Get supported exchanges",
	parameters: [
		{
			in: "query",
			name: "coinId",
			description: "coin or asset id",
			required: true,
			schema: {
				$ref: "#/components/schemas/getSupportedExchangesParams/properties/coinId",
			},
		},
		{
			in: "query",
			name: "currencyId",
			description: "currency id",
			required: true,
			schema: {
				$ref: "#/components/schemas/getSupportedExchangesParams/properties/currencyId",
			},
		},
	],
	responses: {
		[RESPONSE_CODES.ok]: DOC_RESPONSE.SUCCESS,
		[RESPONSE_CODES.badRequest]: DOC_RESPONSE.BADREQUEST,
		[RESPONSE_CODES.unauthorized]: DOC_RESPONSE.UNAUTHORIZED,
		[RESPONSE_CODES.serverError]: DOC_RESPONSE.SERVERERROR,
	},
};

export { getSupportedExchangesParams, getSupportedExchanges };
