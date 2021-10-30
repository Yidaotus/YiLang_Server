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
		const id = req.query.id as string;
		const newTagId = await TagService.remove({
			userId,
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
		const id = req.query.id as string;
		const newTagId = await TagService.update({
			userId,
			id,
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
		const newTagId = await TagService.create({
			userId,
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

const getMany = async (
	req: IPriviligedRequest<IGetManyTagsPrams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { lang, ids } = req.body;
		//await UserService.register(userDetails, verificationUrl);
		const entries: IDictionaryTag[] = await TagService.get({
			userId,
			ids: ids as Array<string>,
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

const getAll = async (
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const lang = req.params.lang as string;
	const userId = req.user.id;
	try {
		//await UserService.register(userDetails, verificationUrl);
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

export { getAll, getMany, add, update, remove };
