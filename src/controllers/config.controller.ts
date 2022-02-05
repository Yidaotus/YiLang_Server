import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	ISetActiveLangParams,
} from '../helpers/api';
import { IPrivilegedRequest } from '../routes';
import * as ConfigService from '../services/config.service';
import { IConfig, IEditorConfig, ILanguageConfig } from '../Document/Config';

const removeLanguage = async (
	req: IPrivilegedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const languageId = req.params.id;
		await ConfigService.removeLanguage({
			userId,
			languageId,
		});
		let response: IApiResponse<void>;
		response = {
			status: ApiStatuses.OK,
			message: 'Config found!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const updateEditorConfig = async (
	req: IPrivilegedRequest<Partial<IEditorConfig>>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const editorConfig = req.body;
		await ConfigService.updateEditorConfig({
			userId,
			editorConfig,
		});
		let response: IApiResponse<void>;
		response = {
			status: ApiStatuses.OK,
			message: 'Config updated!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const updateLanguage = async (
	req: IPrivilegedRequest<Omit<ILanguageConfig, 'id'>>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const languageId = req.params.id;
		const languageConf = req.body;
		await ConfigService.updateLanguage({
			userId,
			languageId,
			languageConf,
		});
		let response: IApiResponse<void>;
		response = {
			status: ApiStatuses.OK,
			message: 'Config found!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const addLanguage = async (
	req: IPrivilegedRequest<Omit<ILanguageConfig, 'id'>>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const languageConf = req.body;
		const configId = await ConfigService.addLanguage({
			userId,
			languageConf,
		});
		let response: IApiResponse<string>;
		if (configId) {
			response = {
				status: ApiStatuses.OK,
				message: 'Config found!',
				payload: configId,
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

const getLanguage = async (
	req: IPrivilegedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	const languageId = req.params.id;
	try {
		const config = await ConfigService.getLanguage({
			userId,
			languageId,
		});
		let response: IApiResponse<ILanguageConfig>;
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

const get = async (
	req: IPrivilegedRequest,
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

const remove = async (
	req: IPrivilegedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	const { id } = req.params;
	try {
		await ConfigService.remove({
			userId,
			id,
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

const create = async (
	req: IPrivilegedRequest<Omit<IConfig, 'id'>>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	const newConfig = req.body;
	try {
		const createdId = await ConfigService.create({
			userId,
			config: newConfig,
		});

		let response: IApiResponse<string> = {
			status: ApiStatuses.OK,
			message: 'Tags found!',
			payload: createdId,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const update = async (
	req: IPrivilegedRequest<Omit<IConfig, 'id'>>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	const newConfig = req.body;
	const { id } = req.params;
	try {
		await ConfigService.update({
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
	req: IPrivilegedRequest<ISetActiveLangParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	const { languageId } = req.body;
	try {
		await ConfigService.update({
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

export {
	get,
	update,
	create,
	remove,
	setActiveLanguage,
	getLanguage,
	updateLanguage,
	removeLanguage,
	addLanguage,
	updateEditorConfig,
};
