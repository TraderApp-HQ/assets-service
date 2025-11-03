import { getBybitMarkets } from "../../fixtures/bybit";
import TradingPlatform from "../../models/TradingPlatform";
import TradingPlatformPair from "../../models/TradingPlatformPair";

export async function up() {
	console.log("Running migration: 20251101T034928_create_bybit_trade_asset_pairs.ts");
	// Your migration logic here

	await getBybitMarkets();

	console.log(
		"Migration completed successfully for: 20251101T034928_create_bybit_trade_asset_pairs.ts"
	);
}

export async function down() {
	console.log("Rolling back migration: 20251101T034928_create_bybit_trade_asset_pairs.ts");
	// Your rollback logic here

	const bybitPlatform = await TradingPlatform.findOne({ slug: "bybit" });

	if (bybitPlatform) {
		await TradingPlatformPair.deleteMany({ platformId: bybitPlatform._id });
	}

	console.log(
		"Rollback completed successfully for: 20251101T034928_create_bybit_trade_asset_pairs.ts"
	);
}
