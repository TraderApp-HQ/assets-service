import { transferExchangesCollection } from "../fixtures/exchangesTransfer";
import { runScript } from "./doubleConfig";

runScript({ scriptFunction: transferExchangesCollection });
