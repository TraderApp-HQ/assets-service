import { exchangePairAndUnknownCoinTransfer } from "../fixtures/exchangePairAndUnknownCoinTransfer";
import { runScript } from "./doubleConfig";

runScript({ scriptFunction: exchangePairAndUnknownCoinTransfer });
