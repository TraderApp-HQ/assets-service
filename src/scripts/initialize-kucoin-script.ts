import { getKucoinMarkets } from "../fixtures/kucoin";
import { runScript } from "./config";

runScript({ scriptFunction: getKucoinMarkets });
