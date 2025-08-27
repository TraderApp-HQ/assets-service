import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export enum SecretLocation {
	commonSecrets = "common-secrets",
	assetsServiceSecrets = "assets-service-secrets",
}

export interface IAssetsServiceSecrets {
	ASSETS_SERVICE_DB_URL: string;
}

export interface ICommonSecrets {
	CMC_API_KEY: string;
}

const client = new SecretsManagerClient({
	region: process.env.AWS_REGION ?? "eu-west-1",
});

export const getSecrets = async <T>(secretName: string): Promise<T> => {
	console.log(`getting ${secretName} secrets`);
	const command = new GetSecretValueCommand({ SecretId: secretName });
	const response = await client.send(command);

	return JSON.parse(response.SecretString ?? "{}") as T;
};
