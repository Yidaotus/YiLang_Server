import { Request, Response, NextFunction } from 'express';
import { IDocument } from '../Document/Document';
import {
	IApiResponse,
	ApiStatuses,
	IDocumentExcerpt,
	IListDocumentResult,
	IListDocumentsParams,
} from '../helpers/api';
import DocumentModel, { IDocumentDB } from '../entities/Document';
import { IPriviligedRequest } from '../routes';
import * as DocumentService from '../services/document.service';

const saveDocument = async (
	req: IPriviligedRequest<IDocument>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const newDocument = req.body;
	try {
		const newDocumentForUser = {
			...newDocument,
			userId: req.user.id,
		};

		await DocumentModel.create(newDocumentForUser);

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
		if (excerptedDocuments && excerptedDocuments.length > 0) {
			response = {
				status: ApiStatuses.OK,
				message: 'Document found!',
				payload: excerptedDocuments,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No Document found!',
				payload: [],
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
	const id = req.params.id as string;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const document = await DocumentModel.findOne({
			_id: id,
			userId: req.user.id,
		}).exec();

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

export { saveDocument, getDocument, listDocuments };
