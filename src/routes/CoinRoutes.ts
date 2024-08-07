/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
// import { coinHandler, coinsHandler } from "../controllers/CoinController";
import { validateCoinRequest, validateCoinsRequest } from "../middlewares/CoinMiddleware";
import { getAllCoins, getCoinById } from "../controllers/CoinControllers";

const router = Router();

// router.get("/", coinsHandler);
// router.get("/:id", validateCoinRequest, coinHandler);

router.get("/", getAllCoins);
router.get("/:id", validateCoinRequest, getCoinById);

export default router;
