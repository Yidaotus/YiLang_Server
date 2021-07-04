import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	IGetManyTagsPrams,
	ITagDelta,
} from '../helpers/api';
import { IDictionaryTag } from '../Document/Dictionary';
import { IPriviligedRequest } from '../routes';
import * as TagService from '../services/tags.service';
import { UUID } from '../Document/UUID';

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
			ids: ids as Array<UUID>,
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

const applyDelta = async (
	req: IPriviligedRequest<ITagDelta>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { removedTags, updatedTags, addedTags } = req.body;

	const userId = req.user.id;
	try {
		await TagService.remove({ userId, ids: removedTags });
		await TagService.create({ userId, tags: addedTags });

		for (const updatedTag of updatedTags) {
			await TagService.update({
				userId,
				id: updatedTag.id,
				newTag: updatedTag,
			});
		}

		const response: IApiResponse = {
			status: ApiStatuses.OK,
			message: 'Entrie(s) added successful!',
			payload: null,
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

export { getAll, getMany, applyDelta };
