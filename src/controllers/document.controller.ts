import { Response, NextFunction } from 'express';
import { IDocumentSerialized } from '../Document/Document';
import {
	IApiResponse,
	ApiStatuses,
	IListDocumentResult,
	IListDocumentsParams,
} from '../helpers/api';
import { IPriviligedRequest } from '../routes';
import * as DocumentService from '../services/document.service';

const createDocument = async (
	req: IPriviligedRequest<Omit<IDocumentSerialized, 'id'>>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const newDocument = req.body;
	const userId = req.user.id;

	try {
		const documentId = await DocumentService.create({
			userId,
			newDocument,
		});

		const response: IApiResponse<string> = {
			status: ApiStatuses.OK,
			message: 'Document saved successful!',
			payload: documentId,
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const updateDocument = async (
	req: IPriviligedRequest<Omit<IDocumentSerialized, 'id'>>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const id = req.params.id;
	const newDocument = req.body;
	const userId = req.user.id;

	try {
		await DocumentService.update({
			userId,
			id,
			newDocument,
		});

		const response: IApiResponse<null> = {
			status: ApiStatuses.OK,
			message: 'Document saved successful!',
			payload: null,
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const listDocuments = async (
	req: IPriviligedRequest<IListDocumentsParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { sortBy, skip, limit, excerptLength, lang } = req.body;
	try {
		const userId = req.user.id;
		const excerptedDocuments = await DocumentService.listDocuments({
			sortBy,
			skip,
			limit,
			excerptLength,
			userId,
			lang,
		});

		let response: IApiResponse<IListDocumentResult>;
		if (excerptedDocuments && excerptedDocuments.excerpts.length > 0) {
			response = {
				status: ApiStatuses.OK,
				message: 'Document found!',
				payload: excerptedDocuments,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No Document found!',
				payload: { total: 0, excerpts: [] },
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const getDocument = async (
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const id = req.params.id;
	const userId = req.user.id;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const document = await DocumentService.get({
			id,
			userId,
		});

		let response: IApiResponse<IDocumentSerialized | null>;
		if (document) {
			response = {
				status: ApiStatuses.OK,
				message: 'Document found!',
				payload: document,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No Document found!',
				payload: null,
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const removeDocument = async (
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const id = req.params.id;
	const userId = req.user.id;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const document = await DocumentService.remove({
			id,
			userId,
		});

		let response: IApiResponse<null>;
		response = {
			status: ApiStatuses.OK,
			message: 'Document removed!',
			payload: null,
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

export {
	getDocument,
	listDocuments,
	removeDocument,
	createDocument,
	updateDocument,
};
