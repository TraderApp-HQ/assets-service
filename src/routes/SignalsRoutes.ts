import { Router } from "express";
import { SIGNAL_ROUTES } from "../config/constants";
import {
	createSignalHandler,
	getActiveSignalsHandler,
	getInActiveSignalsHandler,
	getPendingSignalsHandler,
	getSignalByIdHandler,
	getSignalCurrentPrice,
	getSignalsHandler,
	updateSignalByIdHandler,
} from "../controllers/SignalController";
import {
	validateCreateSignalRequest,
	validateGetAllSignalsRequest,
	validateGetSignalByIdRequest,
	validategetSignalCurrentPriceRequest,
	validateGetSignalsRequest,
	validateUpdateSignalByIdRequest,
} from "../middlewares/SignalsMiddleware";

const router = Router();

router.get(SIGNAL_ROUTES.get, validateGetAllSignalsRequest, getSignalsHandler);
router.get(SIGNAL_ROUTES.getActive, validateGetSignalsRequest, getActiveSignalsHandler);
router.get(SIGNAL_ROUTES.getPending, validateGetSignalsRequest, getPendingSignalsHandler);
router.get(SIGNAL_ROUTES.getHistory, validateGetSignalsRequest, getInActiveSignalsHandler);
router.get(
	SIGNAL_ROUTES.getAssetCurrentPrice,
	validategetSignalCurrentPriceRequest,
	getSignalCurrentPrice
);
router.get(SIGNAL_ROUTES.getSignalById, validateGetSignalByIdRequest, getSignalByIdHandler);
router.post(SIGNAL_ROUTES.post, validateCreateSignalRequest, createSignalHandler);
router.patch(
	SIGNAL_ROUTES.updateSignalById,
	validateUpdateSignalByIdRequest,
	updateSignalByIdHandler
);

export default router;
