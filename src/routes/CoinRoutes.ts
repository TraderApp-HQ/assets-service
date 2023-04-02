import { Router } from "express";
import { coinHandler, coinsHandler } from "../controllers/CoinController";
import { validateCoinRequest, validateCoinsRequest } from "../middlewares/CoinMiddleware";

const router = Router();

router.get("/", validateCoinsRequest, coinsHandler);
router.get("/:id", validateCoinRequest, coinHandler);

export default router;
