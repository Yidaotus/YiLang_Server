import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	IAddDictionarySentenceParams,
	IListSentencesParams,
	IListSentencesResult,
} from '../helpers/api';
import { IDictionarySentence } from '../Document/Dictionary';
import { IPrivilegedRequest } from '../routes';
import * as SentenceService from '../services/sentence.service';

const list = async (
	req: IPrivilegedRequest<IListSentencesParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { filter, sortBy, skip, limit, searchTerm } = req.body;
	const { langId } = req.params;
	try {
		const userId = req.user.id;
		const listing = await SentenceService.listSentences({
			sortBy,
			skip,
			limit,
			lang: langId,
			userId,
			filter,
			searchTerm,
		});

		let response: IApiResponse<IListSentencesResult>;
		if (listing && listing.sentences.length > 0) {
			response = {
				status: ApiStatuses.OK,
				message: 'Sentences found!',
				payload: listing,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No Sentences found!',
				payload: { total: 0, sentences: [] },
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const getSentence = async (
	req: IPrivilegedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { id, langId } = req.params;
		const getResult = await SentenceService.get({
			userId,
			langId,
			id,
		});
		let response: IApiResponse<IDictionarySentence>;
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

const remove = async (
	req: IPrivilegedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { id, langId } = req.params;
		await SentenceService.remove({
			userId,
			langId,
			id,
		});

		let response: IApiResponse<null>;
		response = {
			status: ApiStatuses.OK,
			message: 'Sentence removed!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const update = async (
	req: IPrivilegedRequest<IAddDictionarySentenceParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const sentence = req.body;
		const { id, langId } = req.params;
		await SentenceService.update({
			userId,
			langId,
			id,
			newSentence: sentence,
		});

		let response: IApiResponse<null>;
		response = {
			status: ApiStatuses.OK,
			message: 'Sentence updated!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const add = async (
	req: IPrivilegedRequest<IAddDictionarySentenceParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const sentence = req.body;
		const { langId } = req.params;
		const newSentenceId = await SentenceService.create({
			userId,
			langId,
			sentence,
		});

		let response: IApiResponse<string>;
		response = {
			status: ApiStatuses.OK,
			message: 'Sentence created!',
			payload: newSentenceId,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const getAllForWord = async (
	req: IPrivilegedRequest<{ wordId: string }>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { langId, wordId } = req.params;
		const sentences: Array<IDictionarySentence> = await SentenceService.getAllForWord(
			{
				userId,
				langId,
				wordId,
			}
		);
		let response: IApiResponse<Array<IDictionarySentence>>;
		if (sentences.length > 0) {
			response = {
				status: ApiStatuses.OK,
				message: 'Sentence found!',
				payload: sentences,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No Sentence found!',
				payload: [],
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const getAllByLanguage = async (
	req: IPrivilegedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { langId } = req.params;
		const sentences = await SentenceService.getAllByLanguage({
			langId,
			userId,
		});

		let response: IApiResponse<Array<IDictionarySentence>>;
		if (sentences.length > 0) {
			response = {
				status: ApiStatuses.OK,
				message: 'Sentence found!',
				payload: sentences,
			};
		} else {
			response = {
				status: ApiStatuses.OK,
				message: 'No Sentence found!',
				payload: [],
			};
		}

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

export {
	getAllByLanguage,
	add,
	update,
	remove,
	getAllForWord,
	getSentence,
	list,
};
