/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import { validateCoinRequest, validateCoinsRequest } from "../middlewares/CoinMiddleware";
import { getAllCoins, getCoinById } from "../controllers/CoinControllers";

const router = Router();

router.get("/", validateCoinsRequest, getAllCoins);
router.get("/:id", validateCoinRequest, getCoinById);

export default router;
