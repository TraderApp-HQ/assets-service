import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getExchangeBody = {
	type: "object",
	required: [],
	properties: {
		page: {
			type: "number",
			example: 1,
		},
		pageLimit: {
			type: "number",
			example: 10,
		},
	},
};

const getExchange = {
	tags: [RESPONSE_TAGS.exchange],
	description: "get exchange",
	requestBody: {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/getExchangeBody",
				},
			},
		},
		required: false,
	},
	responses: {
		[RESPONSE_CODES.ok]: DOC_RESPONSE.SUCCESS,
		[RESPONSE_CODES.badRequest]: DOC_RESPONSE.BADREQUEST,
		[RESPONSE_CODES.unauthorized]: DOC_RESPONSE.UNAUTHORIZED,
		[RESPONSE_CODES.serverError]: DOC_RESPONSE.SERVERERROR,
	},
};

export { getExchange, getExchangeBody };
