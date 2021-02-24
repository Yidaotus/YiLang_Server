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
	IDictionaryDelta,
} from '../helpers/api';
import { IPriviligedRequest } from '../routes';
import DictionaryEntry, {
	IDictionaryEntry,
	IDictionaryEntryModel,
} from '../entities/dictionaryEntry';
import * as DictionaryService from '../services/dictionary.service';

const getAll = async (
	req: IPriviligedRequest<void>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const lang = req.params.lang as string;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const entries: IDictionaryEntry[] = await DictionaryEntry.find({
			lang,
		}).exec();

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
	} catch (err) {
		next(err);
	}
};

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

const applyDelta = async (
	req: IPriviligedRequest<IDictionaryDelta>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { removedEntries, updatedEntries, addedEntries } = req.body;
	try {
		const removedUserEntries = {
			entryId: { $in: removedEntries },
			userId: req.user.id,
		};
		await DictionaryEntry.deleteMany(removedUserEntries);

		const addedUserEntries = addedEntries.map((entry) => {
			const entryId = Object.keys(entry)[0];
			const obEntry = Object.values(entry)[0];
			return {
				entryId,
				...obEntry,
				userId: req.user.id,
			};
		});
		await DictionaryEntry.create(addedUserEntries);

		await updatedEntries.map(async (entry) => {
			const entryId = Object.keys(entry)[0];
			const obEntry = Object.values(entry)[0];
			await DictionaryEntry.updateOne(
				{ entryId, userId: req.user.id },
				{ ...obEntry }
			);
		});

		const response: IApiResponse<void> = {
			status: ApiStatuses.OK,
			message: 'Entrie(s) added successful!',
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const addEntries = async (
	req: IPriviligedRequest<IDictionaryEntryData[]>,
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
			message: 'Entrie(s) added successful!',
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const modifyEntry = async (
	req: IPriviligedRequest<IDictionaryEntryData>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const oldEntry = req.body;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const entry = await DictionaryEntry.findOne({
			key: oldEntry.key,
		}).exec();

		let response: IApiResponse<void>;

		if (entry) {
			entry.translations = oldEntry.translations;
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
	const { document, lang } = req.body;
	const userId = req.user.id;

	const entries = await DictionaryService.findOccurances({
		lang,
		document,
		userId,
	});

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
	applyDelta,
	getEntry,
	getAll,
	fetchEntries,
	analyzeDocument,
};
