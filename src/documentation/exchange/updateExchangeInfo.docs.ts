import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";
import { TradeStatus } from "../../config/enums";

const updateExchangeInfoBody = {
	type: "object",
	required: ["description", "status", "makerFee", "takerFee"],
	properties: {
		description: {
			type: "string",
			example: "New exchange description",
		},
		status: {
			type: "string",
			example: TradeStatus.active,
		},
		makerFee: {
			type: "number",
			example: 0.001,
		},
		takerFee: {
			type: "number",
			example: 0.002,
		},
	},
};

const updateExchangeInfoById = {
	tags: [RESPONSE_TAGS.exchange],
	parameters: [
		{
			in: "path",
			name: "exchangeId",
			required: true,
			schema: {
				type: "number",
			},
			description: "The ID of the exchange to be updated.",
		},
	],
	requestBody: {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/updateExchangeInfoBody",
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

export { updateExchangeInfoBody, updateExchangeInfoById };
