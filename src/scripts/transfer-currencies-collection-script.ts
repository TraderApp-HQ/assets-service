import { transferCurrenciesCollection } from "../fixtures/currenciesTransfer";
import { runScript } from "./doubleConfig";

runScript({ scriptFunction: transferCurrenciesCollection });
