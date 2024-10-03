import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getCoinsParams = {
	type: "object",
	properties: {
		page: {
			type: "integer",
			description: "Page number for pagination",
			example: 1,
		},
		rowsPerPage: {
			type: "integer",
			description: "Number of rows per page",
			example: 10,
		},
		orderBy: {
			type: "string",
			enum: ["asc", "desc"],
		},
		sortBy: {
			type: "string",
			example: "rank",
		},
	},
};

const getCoins = {
	tags: [RESPONSE_TAGS.coin],
	description: "Get coins",
	parameters: [
		{
			in: "query",
			name: "page",
			description: "Page number for pagination",
			required: false,
			schema: {
				$ref: "#/components/schemas/getCoinsParams/properties/page",
			},
		},
		{
			in: "query",
			name: "rowsPerPage",
			description: "Number of rows per page",
			required: false,
			schema: {
				$ref: "#/components/schemas/getCoinsParams/properties/rowsPerPage",
			},
		},
		{
			in: "query",
			name: "orderBy",
			required: false,
			schema: {
				$ref: "#/components/schemas/getCoinsParams/properties/orderBy",
			},
		},
		{
			in: "query",
			name: "sortBy",
			required: false,
			schema: {
				$ref: "#/components/schemas/getCoinsParams/properties/sortBy",
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

export { getCoinsParams, getCoins };
