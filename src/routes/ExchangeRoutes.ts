import { Router } from "express";
import { exchangesHandler, getExchangeByIdHandler } from "../controllers/ExchangeController";
import {
	validateExchangesRequest,
	validateExchangeRequest,
} from "../middlewares/ExchangeMiddleware";

const router = Router();

router.get("/", validateExchangesRequest, exchangesHandler);
router.get("/:id", validateExchangeRequest, getExchangeByIdHandler);

export default router;
