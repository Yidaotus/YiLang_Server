import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	IGetManyTagsPrams,
	IAddDictionaryTagParams,
} from '../helpers/api';
import { IDictionaryTag } from '../Document/Dictionary';
import { IPriviligedRequest } from '../routes';
import * as TagService from '../services/tags.service';

const remove = async (
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { langId, id } = req.params;
		const newTagId = await TagService.remove({
			userId,
			langId,
			id,
		});

		let response: IApiResponse<null>;
		response = {
			status: ApiStatuses.OK,
			message: 'Tag created!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const update = async (
	req: IPriviligedRequest<IAddDictionaryTagParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const tag = req.body;
		const { langId, id } = req.params;
		const newTagId = await TagService.update({
			userId,
			id,
			langId,
			newTag: tag,
		});

		let response: IApiResponse<null>;
		response = {
			status: ApiStatuses.OK,
			message: 'Tag created!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const add = async (
	req: IPriviligedRequest<IAddDictionaryTagParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const tag = req.body;
		const { langId } = req.params;
		const newTagId = await TagService.create({
			userId,
			langId,
			tag,
		});

		let response: IApiResponse<string>;
		response = {
			status: ApiStatuses.OK,
			message: 'Tag created!',
			payload: newTagId,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const getAll = async (
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const lang = req.params.langId as string;
		const entries = await TagService.getAllByLanguage({
			lang,
			userId,
		});

		let response: IApiResponse<IDictionaryTag[]>;
		if (entries.length > 0) {
			response = {
				status: ApiStatuses.OK,
				message: 'Tags found!',
				payload: entries,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No tags found!',
				payload: [],
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

export { getAll, add, update, remove };
