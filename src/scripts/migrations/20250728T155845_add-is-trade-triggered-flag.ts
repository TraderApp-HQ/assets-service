import Signal from "../../models/Signal";

export async function up() {
	console.log("Running migration: 20250728T155845_add-is-trade-triggered-flag.ts");
	// Your migration logic here
	await Signal.updateMany({}, { $set: { isSignalTriggered: false } });

	console.log(
		"Migration completed successfully for: 20250728T155845_add-is-trade-triggered-flag.ts"
	);
}

export async function down() {
	console.log("Rolling back migration: 20250728T155845_add-is-trade-triggered-flag.ts");
	// Your rollback logic here

	await Signal.updateMany({}, { $unset: { isSignalTriggered: "" } });

	console.log(
		"Rollback completed successfully for: 20250728T155845_add-is-trade-triggered-flag.ts"
	);
}
