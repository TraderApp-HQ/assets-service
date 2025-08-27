import mongoose from "mongoose";
import Signal from "../../models/Signal";

export async function up() {
	console.log(
		"Running migration: 20250814T215301_drop-old-signals-coins-exchanges-exchangepairs-collections.ts"
	);
	// Your migration logic here
	const collections = mongoose.connection.collections;
	const connections = mongoose.connection;

	await Promise.all([
		// Clear collections -> signals, coins, exchanges, exchangepairs
		Signal.deleteMany(),
		collections["coins"]?.deleteMany({}),
		collections["exchanges"]?.deleteMany({}),
		collections["exchangepairs"]?.deleteMany({}),
		// Drop collections -> coins, exchanges, exchangepairs
		connections.dropCollection("coins"),
		connections.dropCollection("exchanges"),
		connections.dropCollection("exchangepairs"),
	]);

	console.log(
		"Migration completed successfully for: 20250814T215301_drop-old-signals-coins-exchanges-exchangepairs-collections.ts"
	);
}

export async function down() {
	console.log(
		"Rolling back migration: 20250814T215301_drop-old-signals-coins-exchanges-exchangepairs-collections.ts"
	);
	// Your rollback logic here

	console.log(
		"Rollback completed successfully for: 20250814T215301_drop-old-signals-coins-exchanges-exchangepairs-collections.ts"
	);
}
