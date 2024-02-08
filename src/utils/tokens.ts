import JWT from "jsonwebtoken";
import { config } from "dotenv";
import { Request } from "express";
import { UserRoles } from "../config/enums";

config();

export async function verifyAccessToken(accessToken: string) {
	const secret = process.env.ACCESS_TOKEN_SECRET as string;

	return new Promise((resolve, reject) => {
		JWT.verify(accessToken, secret, (err, payload) => {
			if (err) {
				err.name = "Unauthorized";
				err.message = "Invalid Token";
				reject(err);
			}

			// return payload
			resolve(payload);
		});
	});
}

export async function checkAdmin(req: Request) {
	// admin role IDs
	const roles = [UserRoles.ADMIN, UserRoles.SUPER_ADMIN];

	const accessToken = req.headers.authorization?.split(" ")[1];

	if (!accessToken) {
		const error = new Error("Invalid Token");
		error.name = "Unauthorized";
		throw error;
	}

	const { role } = (await verifyAccessToken(accessToken)) as any;

	// check if user role is admin
	if (roles.indexOf(role) === -1) {
		const error = new Error(
			"You don't have the necessary permission to perform this operation."
		);
		error.name = "Forbidden";
		throw error;
	}
}

export async function checkUser(req: Request) {
	const accessToken = req.headers.authorization?.split(" ")[1];

	if (!accessToken) {
		const error = new Error("Invalid Token");
		error.name = "Unauthorized";
		throw error;
	}

	const { role } = (await verifyAccessToken(accessToken)) as any;

	return role;
}
