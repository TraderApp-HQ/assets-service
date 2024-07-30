import { getBinanceMarkets } from "../fixtures/binance";
import { runScript } from "./config";

runScript({ scriptFunction: getBinanceMarkets });
