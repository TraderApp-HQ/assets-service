import { initCoins as getCoins } from "../fixtures/coins";

async function initCoins() {
	await getCoins();
}

initCoins();
