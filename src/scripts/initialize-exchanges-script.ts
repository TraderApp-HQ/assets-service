import { getExchanges } from "../fixtures/exchanges";
import { runScript } from "./config";

runScript({ scriptFunction: getExchanges });
