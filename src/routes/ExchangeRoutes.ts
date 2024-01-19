import { Router } from "express";
import { getAllExchanges, getExchangeByIdHandler } from "../controllers/ExchangeController";
import {
	validateExchangesRequest,
	validateExchangeRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get("/", validateExchangesRequest, getAllExchanges);
router.get("/:id", validateExchangeRequest, getExchangeByIdHandler);

export default router;
