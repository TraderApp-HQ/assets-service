import { Router } from "express";
import { ROUTES } from "../config/constants";

import {
	getAllAssetsInExchange,
	getAllExchanges,
	getCurrenciesForExchange,
	getExchangeById,
	getSupportedTradingPlatform,
	updateExchangeInfo,
} from "../controllers/TradingPlatformControllers";

import {
	validateExchangesRequest,
	validateExchangeRequest,
	validateUpdateExchangeInfoRequest,
	validateGetSupportedTradingPlatformRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get(ROUTES.get, validateExchangesRequest, getAllExchanges);
router.get(
	ROUTES.getSupportedTradingPlatform,
	validateGetSupportedTradingPlatformRequest,
	getSupportedTradingPlatform
);
router.get(ROUTES.getExchangeById, validateExchangeRequest, getExchangeById);
router.get(ROUTES.getAllAssets, getAllAssetsInExchange);
router.get(ROUTES.getByCurrencies, getCurrenciesForExchange);
router.patch(ROUTES.patchExchangeById, validateUpdateExchangeInfoRequest, updateExchangeInfo);

export default router;
