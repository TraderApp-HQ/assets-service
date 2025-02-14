import { Router } from "express";
import { WSChannel } from "../config/enums";
import { signalsStreamHandler } from "../websockets/SignalStreamWebSockets";

// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
const patch = require("express-ws/lib/add-ws-method");
patch.default(Router);

const router = Router();

// Second cron job to update the db with price and calculate tp

router.ws(`/${WSChannel.assetsUpdateWs}`, signalsStreamHandler);

export default router;
