import JWT from "jsonwebtoken";
import { config } from "dotenv";

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
