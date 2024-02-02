import { Router } from "express";
import { ROUTES } from "../config/constants";
import {
	getAllExchanges,
	getExchangeById,
	getAllAssetsInExchange,
	updateExchangeInfo,
	getCurrenciesForExchange,
} from "../controllers/ExchangeController";
// import {
// 	validateExchangesRequest,
// 	validateExchangeRequest,
// 	validateUpdateExchangeInfoRequest,
// } from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get(ROUTES.get, getAllExchanges);
router.get(ROUTES.getById, getExchangeById);
router.patch(ROUTES.patchById, updateExchangeInfo);
router.get(ROUTES.getAllAssets, getAllAssetsInExchange);
router.get(ROUTES.getByCurrencies, getCurrenciesForExchange);

export default router;
