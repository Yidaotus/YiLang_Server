import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatus,
	IDictionaryEntryParams,
	IDictionaryEntryData,
	IDictionaryFetchParams,
	IDocumentParam,
	IFragementData,
	ApiStatuses,
} from '../helpers/api';
import { IPriviligedRequest } from '../routes';
import DictionaryEntry, { IDictionaryEntry } from '../entities/dictionaryEntry';
import * as DictionaryService from '../services/dictionary.service';

const getEntry = async (
	req: IPriviligedRequest<void>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const key = req.params.key as string;
	const lang = req.params.lang as string;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const entry: IDictionaryEntry[] = await DictionaryEntry.find({
			word: new RegExp(`^${key}`, 'g'),
			lang,
		}).exec();

		let response: IApiResponse<IDictionaryEntryData[]>;
		if (entry.length > 0) {
			response = {
				status: ApiStatuses.OK,
				message: 'Entries found!',
				payload: entry,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No entries found!',
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const addEntries = async (
	req: IPriviligedRequest<IDictionaryEntryParams[]>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const newEntries = req.body;
	try {
		const entries = newEntries.map((entry) => ({
			...entry,
			userId: req.user.id,
		}));

		await DictionaryEntry.create(entries);

		const response: IApiResponse<void> = {
			status: ApiStatuses.OK,
			message: 'Word added Successfull!',
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const modifyEntry = async (
	req: IPriviligedRequest<IDictionaryEntryParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const oldEntry = req.body;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const entry = await DictionaryEntry.findOne({
			word: oldEntry.word,
		}).exec();

		let response: IApiResponse<void>;

		if (entry) {
			entry.translation = oldEntry.translation;
			await entry.save();
			response = {
				status: ApiStatuses.OK,
				message: 'Word changed Successfull!',
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'Word not found!',
			};
		}
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const deleteEntry = async (
	req: IPriviligedRequest<void>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const key = req.params.key as string;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const entry = await DictionaryEntry.findOne({
			word: key,
		}).exec();

		let response: IApiResponse<void>;

		if (entry) {
			await entry.remove();
			response = {
				status: ApiStatuses.OK,
				message: 'Word changed Successfull!',
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'Word not found!',
			};
		}
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const fetchEntries = async (
	req: IPriviligedRequest<IDictionaryFetchParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { sortBy, lang, limit = 10, skip = 0 } = req.body;
	const userId = req.user.id;

	const entries = await DictionaryService.fetch({
		sortBy,
		lang,
		limit,
		skip,
		userId,
	});

	let response: IApiResponse<IDictionaryEntryData[]>;
	if (entries.length > 0) {
		response = {
			status: ApiStatuses.OK,
			message: 'Entries found!',
			payload: entries,
		};
	} else {
		response = {
			status: ApiStatuses.OK,
			message: 'No entries found!',
		};
	}

	res.status(200).json(response);
};

const analyzeDocument = async (
	req: IPriviligedRequest<IDocumentParam>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const {document, lang} = req.body;
	const userId = req.user.id;

	const entries = await DictionaryService.findOccurances({lang, document, userId});

	let response: IApiResponse<IFragementData[]>;
	if (entries.length > 0) {
		response = {
			status: ApiStatuses.OK,
			message: 'Entries found!',
			payload: entries,
		};
	} else {
		response = {
			status: ApiStatuses.OK,
			message: 'No entries found!',
		};
	}

	res.status(200).json(response);
};

export {
	addEntries,
	modifyEntry,
	deleteEntry,
	getEntry,
	fetchEntries,
	analyzeDocument,
};
