import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getAllAssetsInExchangeBody = {
	type: "object",
	required: ["exchangeId"],
	properties: {
		exchangeId: {
			type: "integer",
			example: 123,
		},
	},
};

const getAllAssetsInExchangeById = {
	tags: [RESPONSE_TAGS.exchange],
	description: "get all assets in an exchange by the ExchangeID",
	requestBody: {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/getAllAssetsInExchangeBody",
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

export { getAllAssetsInExchangeBody, getAllAssetsInExchangeById };
