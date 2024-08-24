import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { deleteFile, uploadFile } from "../utils/s3FileService";
import {
	DEFAULT_PAGE,
	DEFAULT_ROWS_PER_PAGE,
	ResponseMessage,
	ResponseType,
} from "../config/constants";
import { apiResponseHandler } from "@traderapp/shared-resources";
import { ISignal, ISignalServiceCreateSignalProps } from "../config/interfaces";
import { formatSignalResponse } from "./helpers";
import { SignalService } from "../services/SignalService";
import { HttpStatus } from "../utils/httpStatus";
import { SignalStatus } from "../config/enums";

export async function createSignalHandler(req: Request, res: Response, next: NextFunction) {
	const signalService: SignalService = new SignalService();
	const {
		asset,
		entryPrice,
		targetProfits,
		stopLoss,
		isSignalTradable,
		tradeNote,
		candlestick,
		risk,
		baseCurrency,
		supportedExchanges,
	} = req.body as ISignal;

	// generate id for signal
	const id = uuidv4();

	// get file from base64 string. NB: file is image of signals chart
	const file = Buffer.from(req.body.chart, "base64");
	let chartUrl: string | boolean = false;

	try {
		// upload call chart image to storage
		chartUrl = await uploadFile(file, id);
		if (!chartUrl) throw Error("Chart image failed to upload");

		// Data to be set in the document
		const newSignal: ISignalServiceCreateSignalProps = {
			asset,
			baseCurrency,
			entryPrice,
			targetProfits,
			stopLoss,
			risk,
			candlestick,
			isSignalTradable,
			chartUrl,
			maxGain: 0,
			tradeNote,
			status: SignalStatus.ACTIVE,
			supportedExchanges,
			createdAt: new Date().toISOString(),
		};

		const signal = await signalService.createSignal(newSignal);

		const returnObj = signal as ISignal;
		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				message: ResponseMessage.CREATE_SIGNAL,
				object: returnObj,
			})
		);
	} catch (err: any) {
		// delete uploaded call chart image if it was uploaded
		if (chartUrl) {
			await deleteFile(id);
		}

		next(err);
	}
}

export async function getSignalsHandler(req: Request, res: Response, next: NextFunction) {
	const signalService: SignalService = new SignalService();
	try {
		const rowsPerPage = req.query?.rowsPerPage
			? Number.parseInt(req.query.rowsPerPage as string, 10)
			: DEFAULT_ROWS_PER_PAGE;
		const page = req.query?.page ? Number.parseInt(req.query.page as string, 10) : DEFAULT_PAGE;
		const sortBy = req.query.sortBy as string;
		const sortOrder = (req.query.sortOrder as "asc") ?? "desc";
		const startAfterDoc = req.query.startAfterDoc as string;
		const keyword = req.query?.keyword as string;
		const status = req.query.status as SignalStatus;

		// Fetch signals using the service method
		const signals = await signalService.getSignals({
			rowsPerPage,
			page,
			sortBy,
			sortOrder,
			keyword,
			startAfterDoc,
			status,
		});

		if (!signals) {
			res.status(HttpStatus.NOT_FOUND).json(
				apiResponseHandler({
					type: ResponseType.SUCCESS,
					message: ResponseMessage.NO_SIGNAL,
					object: signals,
				})
			);
			return;
		}

		// Calculate total pages
		const totalRecords: number = await signalService.getSignalCount();
		const totalPages = Math.ceil(totalRecords / rowsPerPage);

		// Format the response
		const signalsObj = signals.map((signals) => formatSignalResponse(signals));
		const response = {
			signals: signalsObj,
			rowsPerPage,
			page,
			totalPages,
			totalRecords,
			startAfterDoc: signals.length > 0 ? signals[signals.length - 1].id : null,
		};

		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				message: ResponseMessage.GET_SIGNALS,
				object: response,
			})
		);
	} catch (err) {
		console.log(err);
		next(err);
	}
}

export async function getSignalByIdHandler(req: Request, res: Response, next: NextFunction) {
	const signalService: SignalService = new SignalService();
	try {
		const { id } = req.params;

		// Fetch signals using the service method
		const signal = await signalService.getSignalById(id);

		if (!signal) {
			res.status(HttpStatus.NOT_FOUND).json(
				apiResponseHandler({
					type: ResponseType.ERROR,
					message: ResponseMessage.NO_SIGNAL,
					object: signal,
				})
			);
			return;
		}

		const signalsObj = formatSignalResponse(signal);
		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				message: ResponseMessage.GET_SIGNAL,
				object: signalsObj,
			})
		);
	} catch (err) {
		console.log(err);
		next(err);
	}
}

export async function updateSignalByIdHandler(req: Request, res: Response, next: NextFunction) {
	const signalService: SignalService = new SignalService();
	try {
		const { id } = req.params;
		const { status } = req.body;

		// update signals using the service method
		const signal = await signalService.updateSignalById({ id, status });

		res.status(HttpStatus.OK).json(
			apiResponseHandler({
				type: ResponseType.SUCCESS,
				message: ResponseMessage.UPDATE_SIGNAL,
				object: signal,
			})
		);
	} catch (err) {
		console.log(err);
		next(err);
	}
}
