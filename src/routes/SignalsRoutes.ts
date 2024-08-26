import { Router } from "express";
import { SIGNAL_ROUTES } from "../config/constants";
import {
	createSignalHandler,
	getSignalsHandler,
	getSignalByIdHandler,
	updateSignalByIdHandler,
	getActiveSignalsHandler,
	getInActiveSignalsHandler,
} from "../controllers/SignalController";
import {
	validateCreateSignalRequest,
	validateGetSignalsRequest,
	validateGetSignalByIdRequest,
	validateUpdateSignalByIdRequest,
	validateGetAllSignalsRequest,
} from "../middlewares/SignalsMiddleware";

const router = Router();

router.post(SIGNAL_ROUTES.post, validateCreateSignalRequest, createSignalHandler);

router.get(SIGNAL_ROUTES.get, validateGetAllSignalsRequest, getSignalsHandler);
router.get(SIGNAL_ROUTES.getActive, validateGetSignalsRequest, getActiveSignalsHandler);
router.get(SIGNAL_ROUTES.getHistory, validateGetSignalsRequest, getInActiveSignalsHandler);

router.get(SIGNAL_ROUTES.getSignalById, validateGetSignalByIdRequest, getSignalByIdHandler);

router.patch(
	SIGNAL_ROUTES.updateSignalById,
	validateUpdateSignalByIdRequest,
	updateSignalByIdHandler
);

export default router;
