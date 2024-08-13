import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getSignalByIdParams = {
	type: "object",
	properties: {
		id: {
			type: "string",
			example: "zxcvunio1234567890sxdrgbn",
		},
	},
};

const getSignalById = {
	tags: [RESPONSE_TAGS.signal],
	description: "Get signal by ID",
	parameters: [
		{
			in: "path",
			name: "id",
			description: "The signal ID",
			required: true,
			schema: {
				type: "string",
			},
			example: "zxcvunio1234567890sxdrgbn",
		},
	],
	responses: {
		[RESPONSE_CODES.ok]: DOC_RESPONSE.SUCCESS,
		[RESPONSE_CODES.badRequest]: DOC_RESPONSE.BADREQUEST,
		[RESPONSE_CODES.unauthorized]: DOC_RESPONSE.UNAUTHORIZED,
		[RESPONSE_CODES.serverError]: DOC_RESPONSE.SERVERERROR,
	},
};

export { getSignalByIdParams, getSignalById };
