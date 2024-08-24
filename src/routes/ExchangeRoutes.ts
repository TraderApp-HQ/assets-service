import { Router } from "express";
import { ROUTES } from "../config/constants";
// import {
// 	getAllExchanges,
// 	getExchangeById,
// 	getAllAssetsInExchange,
// 	updateExchangeInfo,
// 	getCurrenciesForExchange,
// } from "../controllers/ExchangeController";

import {
	getAllAssetsInExchange,
	getAllExchanges,
	getCurrenciesForExchange,
	getExchangeById,
	updateExchangeInfo,
} from "../controllers/ExchangeControllers";

import {
	validateExchangesRequest,
	validateExchangeRequest,
	validateUpdateExchangeInfoRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

// router.get(ROUTES.get, validateExchangesRequest, getAllExchanges);
// router.get(ROUTES.getExchangeById, validateExchangeRequest, getExchangeById);
// router.patch(ROUTES.patchExchangeById, validateUpdateExchangeInfoRequest, updateExchangeInfo);
// router.get(ROUTES.getAllAssets, getAllAssetsInExchange);
// router.get(ROUTES.getByCurrencies, getCurrenciesForExchange);

router.get(ROUTES.get, validateExchangesRequest, getAllExchanges);
router.get(ROUTES.getExchangeById, validateExchangeRequest, getExchangeById);
router.patch(ROUTES.patchExchangeById, validateUpdateExchangeInfoRequest, updateExchangeInfo);
router.get(ROUTES.getAllAssets, getAllAssetsInExchange);
router.get(ROUTES.getByCurrencies, getCurrenciesForExchange);

export default router;
