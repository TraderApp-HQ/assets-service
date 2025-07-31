import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongodb: MongoMemoryServer;

// Set required environment variables for testing
process.env.NODE_ENV = "test";

beforeAll(async () => {
	// Start in-memory MongoDB instance
	mongodb = await MongoMemoryServer.create();
	const uri = mongodb.getUri();

	// Connect to the in-memory database
	await mongoose.connect(uri);
});

afterAll(async () => {
	// Clear all collections after test
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		const collection = collections[key];
		await collection.deleteMany({});
	}

	// Clean up and close connections
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
	await mongodb.stop();
});
