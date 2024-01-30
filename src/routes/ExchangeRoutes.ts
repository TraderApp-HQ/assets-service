import { Router } from "express";
import { ROUTES } from "../config/constants";
import {
	getAllExchanges,
	getExchangeById,
	getAllAssetsInExchange,
	updateExchangeInfo,
	getCurrenciesForExchange,
} from "../controllers/ExchangeController";
import {
	validateExchangesRequest,
	validateExchangeRequest,
	validateUpdateExchangeInfoRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get(ROUTES.get, validateExchangesRequest, getAllExchanges);
router.get(ROUTES.getById, validateExchangeRequest, getExchangeById);
router.patch(ROUTES.patchById, validateUpdateExchangeInfoRequest, updateExchangeInfo);
router.get(ROUTES.getAllAssets, validateExchangeRequest, getAllAssetsInExchange);
router.get(ROUTES.getByCurrencies, validateExchangeRequest, getCurrenciesForExchange);

export default router;
