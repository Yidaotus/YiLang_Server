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

const list = async (
	req: IPriviligedRequest<IListDictionaryParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { filter, sortBy, skip, limit, excerptLength } = req.body;
	const { langId } = req.params;
	try {
		const userId = req.user.id;
		const listing = await DictionaryService.listEntries({
			sortBy,
			skip,
			limit,
			lang: langId,
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

const searchEntries = async (
	req: IPriviligedRequest<ISearchDictionaryParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { key } = req.body;
	const userId = req.user.id;

	try {
		const { langId } = req.params;
		const entries = await DictionaryService.find({
			userId,
			lang: langId,
			searchTerm: key,
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
	const userId = req.user.id;
	try {
		const { id, langId } = req.params;
		const getResult = await DictionaryService.get({
			userId,
			langId,
			id,
		});
		let response: IApiResponse<IDictionaryEntry>;
		if (getResult) {
			response = {
				status: ApiStatuses.OK,
				message: 'Entries found!',
				payload: getResult,
			};
			res.status(200).json(response);
		} else {
			response = {
				status: ApiStatuses.NOTFOUND,
				message: 'No entries found!',
				payload: null,
			};
			res.status(401).json(response);
		}
	} catch (err) {
		next(err);
	}
};
const updateEntry = async (
	req: IPriviligedRequest<IDictionaryEntry>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const entry = req.body;
	const { id, langId } = req.params;
	const userId = req.user.id;
	try {
		await DictionaryService.update({
			userId,
			id,
			langId,
			newEntry: entry,
		});

		const response: IApiResponse<null> = {
			status: ApiStatuses.OK,
			message: 'Entry added successful!',
			payload: null,
		};
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
	const langId = req.params.langId;
	try {
		const entryId = await DictionaryService.create({
			userId,
			langId,
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
	const id = req.params.id;
	const userId = req.user.id;
	try {
		await DictionaryService.remove({ userId, id });
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
	fetchEntries,
	updateEntry,
};
