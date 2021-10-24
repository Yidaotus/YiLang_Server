import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	IDictionaryFetchParams,
	IListDictionaryParams,
	IListDictionaryResult,
	ISearchDictionaryParams,
} from '../helpers/api';
import * as DictionaryService from '../services/dictionary.service';
import { IDictionaryEntry } from '../Document/Dictionary';
import { IPriviligedRequest } from '../routes';
import { getUUID, UUID } from '../Document/UUID';

const list = async (
	req: IPriviligedRequest<IListDictionaryParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { filter, sortBy, skip, limit, excerptLength, lang } = req.body;
	try {
		const userId = req.user.id;
		const listing = await DictionaryService.listEntries({
			sortBy,
			skip,
			limit,
			lang,
			excerptLength,
			userId,
			filter,
		});

		let response: IApiResponse<IListDictionaryResult>;
		if (listing && listing.entries.length > 0) {
			response = {
				status: ApiStatuses.OK,
				message: 'Entries found!',
				payload: listing,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No Document found!',
				payload: { total: 0, entries: [] },
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
	const userId = req.user.id;
	const lang = req.params.lang as string;
	try {
		const entries = await DictionaryService.find({
			userId,
			lang,
			searchTerm: '',
		});

		let response: IApiResponse<IDictionaryEntry[]>;
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
				payload: [],
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const searchEntries = async (
	req: IPriviligedRequest<ISearchDictionaryParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { key, lang } = req.body;
	const userId = req.user.id;

	try {
		const entries = await DictionaryService.find({
			userId,
			lang,
			searchTerm: key,
		});

		// @TODO WEIRD HACK FOR IMPORTED DICTIONRY REMOVE!!!
		for (const foundEntry of entries) {
			if (!foundEntry.id) {
				foundEntry.id = getUUID();
				foundEntry.save();
			}
		}

		let response: IApiResponse<Array<IDictionaryEntry>>;
		if (entries && entries.length > 0) {
			response = {
				status: ApiStatuses.OK,
				message: 'Entries found!',
				payload: entries,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No entries found!',
				payload: [],
			};
		}
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const getEntry = async (
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const id = req.params.id;
	const userId = req.user.id;
	try {
		const getResult = await DictionaryService.get({
			userId,
			id,
		});
		let response: IApiResponse<IDictionaryEntry>;
		if (getResult) {
			response = {
				status: ApiStatuses.OK,
				message: 'Entries found!',
				payload: getResult,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No entries found!',
				payload: null,
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const addEntry = async (
	req: IPriviligedRequest<IDictionaryEntry>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const entry = req.body;
	const userId = req.user.id;
	try {
		const entryId = await DictionaryService.create({
			userId,
			entry,
		});

		const response: IApiResponse<number> = {
			status: ApiStatuses.OK,
			message: 'Entry added successful!',
			payload: entryId,
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const deleteEntry = async (
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const key = req.params.key as string;
	const userId = req.user.id;
	try {
		await DictionaryService.remove({ userId, ids: [key] });
		let response: IApiResponse<null>;

		response = {
			status: ApiStatuses.OK,
			message: 'Word changed Successfull!',
			payload: null,
		};
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
	const { sortBy, lang, limit = 0, skip = 0 } = req.body;
	const userId = req.user.id;

	const entries = await DictionaryService.fetch({
		sortBy,
		lang,
		limit,
		skip,
		userId,
	});

	let response: IApiResponse<IDictionaryEntry[]>;
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
			payload: [],
		};
	}

	res.status(200).json(response);
};

/* 
const analyzeDocument = async (
	req: IPriviligedRequest<IEditorDocument>,
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

	let response: IApiResponse<Array<{
		position: number;
		entries: Array<IDictionaryEntry>;
	}>>;
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
*/

export {
	addEntry,
	deleteEntry,
	getEntry,
	searchEntries,
	list,
	getAll,
	fetchEntries,
};
