import fs from "fs";
import path from "path";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

function createMigrationFile(name: string) {
	const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
	const migrationFileName = `${timestamp}_${name}.ts`;
	const migrationFilePath = path.join(MIGRATIONS_DIR, migrationFileName);

	const migrationTemplate = `

	export async function up() {
		console.log("Running migration: ${migrationFileName}");
		// Your migration logic here

		console.log("Migration completed successfully for: ${migrationFileName}");
	}

	export async function down() {
		console.log("Rolling back migration: ${migrationFileName}");
		// Your rollback logic here

		console.log("Rollback completed successfully for: ${migrationFileName}");
	}
	`;

	fs.writeFileSync(migrationFilePath, migrationTemplate);
	console.log(`Migration file created: ${migrationFileName}`);
}

const migrationName = process.argv[2];
if (!migrationName) {
	console.error("Please provide a migration name.");
	process.exit(1);
}

createMigrationFile(migrationName);
