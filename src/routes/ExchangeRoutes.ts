import { Router } from "express";
import { ROUTES } from "../config/constants";

import {
	getAllAssetsInExchange,
	getAllExchanges,
	getCurrenciesForExchange,
	getExchangeById,
	getSupportedExchanges,
	updateExchangeInfo,
} from "../controllers/ExchangeControllers";

import {
	validateExchangesRequest,
	validateExchangeRequest,
	validateUpdateExchangeInfoRequest,
	validateGetSupportedExchangesRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get(ROUTES.get, validateExchangesRequest, getAllExchanges);
router.get(ROUTES.getExchangeById, validateExchangeRequest, getExchangeById);
router.patch(ROUTES.patchExchangeById, validateUpdateExchangeInfoRequest, updateExchangeInfo);
router.get(ROUTES.getAllAssets, getAllAssetsInExchange);
router.get(ROUTES.getByCurrencies, getCurrenciesForExchange);
router.get(
	ROUTES.getSupportedExchanges,
	validateGetSupportedExchangesRequest,
	getSupportedExchanges
);
export default router;
