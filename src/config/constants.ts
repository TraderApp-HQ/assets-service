import { apiDocumentationResponseObject } from "@traderapp/shared-resources";

export const ENVIRONMENTS: Record<string, string> = Object.freeze({
	development: "dev",
	staging: "staging",
	production: "prod",
});

export const DOC_RESPONSE = {
	SERVERERROR: apiDocumentationResponseObject("Internal Server Error"),
	UNAUTHORIZED: apiDocumentationResponseObject("Error: Unauthorized"),
	BADREQUEST: apiDocumentationResponseObject("Error: Bad Request"),
	SUCCESS: apiDocumentationResponseObject("Success"),
};

export const RESPONSE_CODES = {
	ok: "200",
	created: "201",
	badRequest: "400",
	unauthorized: "401",
	serverError: "500",
	notFound: "404",
	forbidden: "403",
	request_timeout: "408",
	conflict: "409",
};

export const ResponseType = {
	SUCCESS: "success",
	ERROR: "error",
};

export const ResponseMessage = {
	UPDATE_EXCHANGE: "Exchange Updated successfully",
};
