import { getExchanges } from "../fixtures/exchanges";

async function initExchanges() {
	await getExchanges();
}

void initExchanges();