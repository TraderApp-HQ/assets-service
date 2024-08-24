import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const createSignalParams = {
	type: "object",
	properties: {
		asset: {
			type: "object",
			example: { id: 76, name: "crypto", symbol: "B$", logo: "string" },
		},
		entry: {
			type: "string",
			example: "400",
		},
		stopLoss: {
			type: "object",
			example: { price: 200, percent: 5, isReached: false },
		},
		targetProfits: {
			type: ["objects"],
			example: [
				{ price: 5000, percent: 3, isReached: true },
				{ price: 2000, percent: 13, isReached: false },
			],
		},
		tradeNote: {
			type: "string",
			example: "happy trading Chikki",
		},
		risk: {
			type: "string",
			example: "Low",
		},
		candlestick: {
			type: "string",
			example: "8hrs",
		},
		isSignalTradable: {
			type: "boolean",
			example: true,
		},
		chart: {
			type: "Base64 string",
			example: "base64 string of the image",
		},
	},
};

const createSignal = {
	tags: [RESPONSE_TAGS.signal],
	description: "Create signal",
	requestBody: {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/createSignalParams",
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

export { createSignalParams, createSignal };
