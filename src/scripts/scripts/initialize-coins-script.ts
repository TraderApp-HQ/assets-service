import { initCoins as getCoins } from "../../fixtures/asset";
import { runScript } from "../config";

runScript({ scriptFunction: getCoins });
