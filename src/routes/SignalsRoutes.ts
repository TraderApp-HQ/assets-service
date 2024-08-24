import { Router } from "express";
import { SIGNAL_ROUTES } from "../config/constants";
import {
	createSignalHandler,
	getSignalsHandler,
	getSignalByIdHandler,
	updateSignalByIdHandler,
} from "../controllers/SignalController";
import {
	validateCreateSignalRequest,
	validateGetSignalsRequest,
	validateGetSignalByIdRequest,
	validateUpdateSignalByIdRequest,
} from "../middlewares/SignalsMiddleware";

const router = Router();

router.post(SIGNAL_ROUTES.post, validateCreateSignalRequest, createSignalHandler);

router.get(SIGNAL_ROUTES.get, validateGetSignalsRequest, getSignalsHandler);

router.get(SIGNAL_ROUTES.getSignalById, validateGetSignalByIdRequest, getSignalByIdHandler);

router.patch(
	SIGNAL_ROUTES.updateSignalById,
	validateUpdateSignalByIdRequest,
	updateSignalByIdHandler
);

export default router;
