import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getExchangeByIdBody = {
	type: "object",
	required: ["Id"],
	properties: {
		Id: {
			type: "integer",
			example: 123,
		},
	},
};

const getExchangeById = {
	tags: [RESPONSE_TAGS.exchange],
	description: "get exchange by ID",
	requestBody: {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/getExchangeByIdBody",
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

export { getExchangeById, getExchangeByIdBody };
