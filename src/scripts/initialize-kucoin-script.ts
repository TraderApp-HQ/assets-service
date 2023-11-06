import { getKucoinMarkets } from "../fixtures/kucoin";

async function initKucoin() {
	await getKucoinMarkets();
}

void initKucoin();
