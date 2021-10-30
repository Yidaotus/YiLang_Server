import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	ISetActiveLangParams,
} from '../helpers/api';
import { IPriviligedRequest } from '../routes';
import * as ConfigService from '../services/config.service';
import { IConfig } from '../Document/Config';

const get = async (
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const config = await ConfigService.get({
			userId,
		});
		let response: IApiResponse<IConfig>;
		if (config) {
			response = {
				status: ApiStatuses.OK,
				message: 'Config found!',
				payload: config,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No Config found!',
				payload: null,
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const set = async (
	req: IPriviligedRequest<IConfig>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	const newConfig = req.body;
	try {
		await ConfigService.set({
			userId,
			config: newConfig,
		});

		let response: IApiResponse<null> = {
			status: ApiStatuses.OK,
			message: 'Tags found!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const setActiveLanguage = async (
	req: IPriviligedRequest<ISetActiveLangParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	const { languageId } = req.body;
	try {
		await ConfigService.set({
			userId,
			config: { activeLanguage: languageId },
		});

		let response: IApiResponse<null> = {
			status: ApiStatuses.OK,
			message: 'Language Set',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

export { get, set, setActiveLanguage };
