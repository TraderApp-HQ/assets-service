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
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get("/", validateExchangesRequest, getAllExchanges);
router.get("/:id", validateExchangeRequest, getExchangeById);
router.patch("/:id", validateUpdateExchangeInfoRequest, updateExchangeInfo);
router.get("/:exchangeId", validateExchangeRequest, getAllAssetsInExchange);
router.get("/:exchangeId", validateExchangeRequest, getCurrenciesForExchange);

export default router;
