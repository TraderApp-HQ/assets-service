import { PrismaClient } from "@prisma/client";
let db:PrismaClient 

export async function prismaClient() {
	return db;
}

function initPrismaClient() {
	try {
		db = new PrismaClient();
	} catch (error) {
		console.log(`Error initializing prismaclient ${JSON.stringify(error)}`);
	}
}

export default initPrismaClient;