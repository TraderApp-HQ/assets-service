import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getActiveSignalParams = {
	type: "object",
	properties: {
		page: {
			type: "number",
			example: 3,
		},
		rowsPerPage: {
			type: "number",
			example: 5,
		},
		sortBy: {
			type: "string",
			example: "createdAt",
		},
		sortOrder: {
			type: "string",
			example: "desc",
			enum: ["asc", "desc"],
		},
		assetName: {
			type: "string",
			example: "crypto",
		},
		assetSymbol: {
			type: "string",
			example: "B$",
		},
	},
};

const getActiveSignals = {
	tags: [RESPONSE_TAGS.signal],
	description: "Get signals",
	parameters: [
		{
			in: "query",
			name: "page",
			description: "Page number for pagination",
			required: false,
			schema: {
				$ref: "#/components/schemas/getSignalParams/properties/page",
			},
		},
		{
			in: "query",
			name: "rowsPerPage",
			description: "Number of rows per page",
			required: false,
			schema: {
				$ref: "#/components/schemas/getSignalParams/properties/rowsPerPage",
			},
		},
		{
			in: "query",
			name: "sortBy",
			description: "Field to sort by",
			required: false,
			schema: {
				$ref: "#/components/schemas/getSignalParams/properties/sortBy",
			},
		},
		{
			in: "query",
			name: "sortOrder",
			description: "Sort order (asc | desc)",
			required: false,
			schema: {
				$ref: "#/components/schemas/getSignalParams/properties/sortOrder",
			},
		},
		{
			in: "query",
			name: "assetName",
			description: "Filter signals by asset name",
			required: false,
			schema: {
				$ref: "#/components/schemas/getSignalParams/properties/assetName",
			},
		},
		{
			in: "query",
			name: "assetSymbol",
			description: "Filter signals by asset symbol",
			required: false,
			schema: {
				$ref: "#/components/schemas/getSignalParams/properties/assetSymbol",
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

export { getActiveSignalParams, getActiveSignals };
