import { DOC_RESPONSE, RESPONSE_CODES, RESPONSE_TAGS } from "../../config/constants";
import { SignalStatus } from "../../config/enums";

const updateSignalByIdParams = {
	type: "object",
	required: ["id", "status"],
	properties: {
		id: {
			type: "string",
			example: "zxcvunio1234567890sxdrgbn",
		},
	},
};

const updateSignalByIdBody = {
	type: "object",
	required: ["id", "status"],
	properties: {
		status: {
			type: "string",
			example: SignalStatus.ACTIVE,
		},
	},
};

const updateSignalById = {
	tags: [RESPONSE_TAGS.signal],
	description: "Update signal by ID",
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
	requestBody: {
		content: {
			"application/json": {
				schema: {
					$ref: "#/components/schemas/updateSignalByIdBody",
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

export { updateSignalByIdParams, updateSignalById, updateSignalByIdBody };
