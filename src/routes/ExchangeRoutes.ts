import { Router } from "express";
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
	validateGetAllAssetsRequest,
	validateGetCurrenciesRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get("/", validateExchangesRequest, getAllExchanges);
router.get("/:id", validateExchangeRequest, getExchangeById);
router.patch("/:id", validateUpdateExchangeInfoRequest, updateExchangeInfo);
router.get("/:exchangeId", validateGetAllAssetsRequest, getAllAssetsInExchange);
router.get("/:exchangeId/:currencyId", validateGetCurrenciesRequest, getCurrenciesForExchange);

export default router;
