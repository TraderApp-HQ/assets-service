import { Router } from "express";
import { ROUTES } from "../config/constants";

import {
	getAllAssetsInExchange,
	getAllTradingPlatforms,
	getCurrenciesForExchange,
	getExchangeById,
	getSupportedTradingPlatforms,
	updateExchangeInfo,
} from "../controllers/TradingPlatformControllers";

import {
	validateTradingPlatformsRequest,
	validateExchangeRequest,
	validateUpdateExchangeInfoRequest,
	validateGetSupportedTradingPlatformsRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get(ROUTES.get, validateTradingPlatformsRequest, getAllTradingPlatforms);
router.get(
	ROUTES.getSupportedTradingPlatforms,
	validateGetSupportedTradingPlatformsRequest,
	getSupportedTradingPlatforms
);
router.get(ROUTES.getExchangeById, validateExchangeRequest, getExchangeById);
router.get(ROUTES.getAllAssets, getAllAssetsInExchange);
router.get(ROUTES.getByCurrencies, getCurrenciesForExchange);
router.patch(ROUTES.patchExchangeById, validateUpdateExchangeInfoRequest, updateExchangeInfo);

export default router;
