import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";

const getCoinById = {
	tags: [RESPONSE_TAGS.coin],
	parameters: [
		{
			in: "path",
			name: "id",
			required: true,
			schema: {
				type: "integer",
			},
			description: "The coin ID",
			example: 123,
		},
	],
	responses: {
		[RESPONSE_CODES.ok]: DOC_RESPONSE.SUCCESS,
		[RESPONSE_CODES.badRequest]: DOC_RESPONSE.BADREQUEST,
		[RESPONSE_CODES.unauthorized]: DOC_RESPONSE.UNAUTHORIZED,
		[RESPONSE_CODES.serverError]: DOC_RESPONSE.SERVERERROR,
	},
};

export { getCoinById };
