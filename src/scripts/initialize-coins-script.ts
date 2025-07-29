import { initCoins as getCoins } from "../fixtures/coins";
import { runScript } from "./config";

runScript({ scriptFunction: getCoins });
