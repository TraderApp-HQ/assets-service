import JWT from "jsonwebtoken";
import { config } from "dotenv";
import { Request } from "express";

config();

export function verifyAccessToken(accessToken: string) {
	const secret = process.env.ACCESS_TOKEN_SECRET as string;

	return new Promise((resolve, reject) => {
		JWT.verify(accessToken, secret, (err, payload) => {
			if (err) {
				err.name = "Unauthorized";
				err.message = "Invalid Token";
				reject(err);
			}

			//return payload
			resolve(payload);
		});
	});
}

// A function to get accessToken from headers, verify it and check if user is admin
export async function checkUser(req: Request) {
	//admin role IDs
	const roles = [3, 4];

	//get accessToken from req headers
	const accessToken = req.headers.authorization?.split(" ")[1];

	//check if access token was supplied and throw error if not
	if (!accessToken) {
		const error = new Error("Invalid Token");
		error.name = "Unauthorized";
		throw error;
	}

	//verify accessToken
	const { role } = (await verifyAccessToken(accessToken)) as any;

	//check if user role is admin and throw error if not
	if (roles.indexOf(role) === -1) {
		const error = new Error(
			"You don't have the necessary permission to perform this operation."
		);
		error.name = "Forbidden";
		throw error;
	}
}
