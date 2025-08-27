import { getBinanceMarkets } from "../../fixtures/binance";
import TradingPlatformPair from "../../models/TradingPlatformPair";

export async function up() {
	console.log("Running migration: 20250814T215137_create-binance-trade-asset-pairs.ts");
	// Your migration logic here

	await getBinanceMarkets();

	console.log(
		"Migration completed successfully for: 20250814T215137_create-binance-trade-asset-pairs.ts"
	);
}

export async function down() {
	console.log("Rolling back migration: 20250814T215137_create-binance-trade-asset-pairs.ts");
	// Your rollback logic here

	// binance cmc id
	const platformId = 270;

	await TradingPlatformPair.deleteMany({ platformId });

	console.log(
		"Rollback completed successfully for: 20250814T215137_create-binance-trade-asset-pairs.ts"
	);
}
