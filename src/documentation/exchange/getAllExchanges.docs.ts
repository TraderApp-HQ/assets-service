import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getExchangesParams = {
	type: "object",
	properties: {
		page: {
			type: "integer",
			description: "Page number for pagination",
			example: 1,
		},
		rowPerPage: {
			type: "integer",
			description: "Number of rows per page",
			example: 10,
		},
		orderBy: {
			type: "string",
			description: "Field is to be ordered by (asc | desc)",
			enum: ["asc", "desc"],
			default: "asc",
		},
	},
};

const getExchanges = {
	tags: [RESPONSE_TAGS.exchange],
	description: "Get exchanges",
	parameters: [
		{
			in: "query",
			name: "page",
			description: "Page number for pagination",
			required: false,
			schema: {
				$ref: "#/components/schemas/getExchangesParams/properties/page",
			},
		},
		{
			in: "query",
			name: "rowPerPage",
			description: "Number of rows per page",
			required: false,
			schema: {
				$ref: "#/components/schemas/getExchangesParams/properties/rowPerPage",
			},
		},
		{
			in: "query",
			name: "orderBy",
			description: "Field is to be ordered by (asc | desc)",
			required: false,
			schema: {
				$ref: "#/components/schemas/getExchangesParams/properties/orderBy",
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

export { getExchangesParams, getExchanges };