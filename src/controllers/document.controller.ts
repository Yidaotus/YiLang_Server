import { Request, Response, NextFunction } from 'express';
import { IDocument } from '../Document/Document';
import {
	IApiResponse,
	ApiStatuses,
	IListDocumentResult,
	IListDocumentsParams,
} from '../helpers/api';
import { IPriviligedRequest } from '../routes';
import * as DocumentService from '../services/document.service';
import { UUID } from '../Document/UUID';

const saveOrUpdateDocument = async (
	req: IPriviligedRequest<IDocument>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const newDocument = req.body;
	const userId = req.user.id;

	try {
		await DocumentService.saveOrUpdate({
			userId,
			id: newDocument.id,
			newDocument,
		});

		const response: IApiResponse = {
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
	const { sortBy, skip, limit, excerptLength } = req.body;
	try {
		const userId = req.user.id;
		const excerptedDocuments = await DocumentService.listDocuments({
			sortBy,
			skip,
			limit,
			excerptLength,
			userId,
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
	const id = req.params.id as UUID;
	const userId = req.user.id;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const document = await DocumentService.get({
			id,
			userId,
		});

		let response: IApiResponse<IDocument | null>;
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

export { saveOrUpdateDocument as saveDocument, getDocument, listDocuments };
