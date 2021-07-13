import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	IDictionaryDelta,
	IDictionaryFetchParams,
	IListDictionaryParams,
	IListDictionaryResult,
	IGetManyDictEntriesPrams,
	IDictionaryEntryFetchResponse,
} from '../helpers/api';
import * as DictionaryService from '../services/dictionary.service';
import { IDictionaryEntry } from '../Document/Dictionary';
import { IPriviligedRequest } from '../routes';
import { UUID } from '../Document/UUID';

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

const getMany = async (
	req: IPriviligedRequest<IGetManyDictEntriesPrams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	const { ids } = req.body;
	try {
		const entries = await DictionaryService.get({
			userId,
			ids: ids as Array<UUID>,
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
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const searchTerm = req.params.key as string;
	const lang = req.params.lang as string;
	const userId = req.user.id;

	try {
		const entries = await DictionaryService.find({
			userId,
			lang,
			searchTerm,
		});

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
				payload: null,
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
	const id = req.params.id as UUID;
	const lang = req.params.lang as string;
	const userId = req.user.id;
	try {
		const {
			entry,
			rootEntry,
			subEntries,
			linkExcerpt,
		} = await DictionaryService.getWithExcerpt({
			userId,
			id,
		});

		let response: IApiResponse<IDictionaryEntryFetchResponse>;
		if (entry) {
			response = {
				status: ApiStatuses.OK,
				message: 'Entries found!',
				payload: { entry, linkExcerpt, rootEntry, subEntries },
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

const applyDelta = async (
	req: IPriviligedRequest<IDictionaryDelta>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { removedEntries, updatedEntries, addedEntries } = req.body;

	const userId = req.user.id;
	try {
		await DictionaryService.remove({ userId, ids: removedEntries });
		await DictionaryService.create({ userId, entries: addedEntries });

		for (const updatedEntry of updatedEntries) {
			await DictionaryService.update({
				userId,
				id: updatedEntry.id,
				newEntry: updatedEntry,
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

const addEntries = async (
	req: IPriviligedRequest<Array<IDictionaryEntry>>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const entries = req.body;
	const userId = req.user.id;
	try {
		DictionaryService.create({ userId, entries });

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

const deleteEntry = async (
	req: IPriviligedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const key = req.params.key as string;
	const userId = req.user.id;
	try {
		await DictionaryService.remove({ userId, ids: [key] });
		let response: IApiResponse;

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
	addEntries,
	deleteEntry,
	applyDelta,
	getEntry,
	searchEntries,
	list,
	getAll,
	fetchEntries,
	getMany,
};
