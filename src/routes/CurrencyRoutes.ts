import { Router } from "express";
import { getAllCurrencies } from "../controllers/CurrencyController";
import { validateCurrenciesRequest } from "../middlewares/CurrencyMiddleware";

const router = Router();

router.get("/", validateCurrenciesRequest, getAllCurrencies);

export default router;
