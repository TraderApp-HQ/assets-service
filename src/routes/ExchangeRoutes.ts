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
	validateExchangeIdRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get("/", validateExchangesRequest, getAllExchanges);
router.get("/:id", validateExchangeRequest, getExchangeById);
router.patch("/:id", validateUpdateExchangeInfoRequest, updateExchangeInfo);
router.get("/:exchangeId", validateExchangeIdRequest, getAllAssetsInExchange);
router.get("/:exchangeId", validateExchangeIdRequest, getCurrenciesForExchange);

export default router;
