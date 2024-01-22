import { Router } from "express";
import {
	getAllExchanges,
	getExchangeByIdHandler,
	getExchangeByAssetName,
	updateExchangeInfo,
	currenciesByExchangeHandler,
} from "../controllers/ExchangeController";
import {
	validateExchangesRequest,
	validateExchangeRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get("/", getAllExchanges);
router.get("/:id", getExchangeByIdHandler);
router.patch("/:id", updateExchangeInfo);
router.get(":id/currencies", currenciesByExchangeHandler);
router.get("/exchangesByAsset/:assetName", getExchangeByAssetName);
// router.get("/:assetName", getExchangeByAssetName);

export default router;
