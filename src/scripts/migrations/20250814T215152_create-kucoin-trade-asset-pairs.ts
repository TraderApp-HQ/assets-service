import { getKucoinMarkets } from "../../fixtures/kucoin";
import TradingPlatformPair from "../../models/TradingPlatformPair";

export async function up() {
	console.log("Running migration: 20250814T215152_create-kucoin-trade-asset-pairs.ts");
	// Your migration logic here

	await getKucoinMarkets();

	console.log(
		"Migration completed successfully for: 20250814T215152_create-kucoin-trade-asset-pairs.ts"
	);
}

export async function down() {
	console.log("Rolling back migration: 20250814T215152_create-kucoin-trade-asset-pairs.ts");
	// Your rollback logic here

	// kucoin cmc id
	const platformId = 311;

	await TradingPlatformPair.deleteMany({ platformId });

	console.log(
		"Rollback completed successfully for: 20250814T215152_create-kucoin-trade-asset-pairs.ts"
	);
}
