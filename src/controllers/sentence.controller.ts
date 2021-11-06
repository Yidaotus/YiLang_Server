import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	IAddDictionarySentenceParams,
} from '../helpers/api';
import { IDictionarySentence } from '../Document/Dictionary';
import { IPriviligedRequest } from '../routes';
import * as SentenceService from '../services/sentence.service';

const remove = async (
	req: IPriviligedRequest,
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
	req: IPriviligedRequest<IAddDictionarySentenceParams>,
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
	req: IPriviligedRequest<IAddDictionarySentenceParams>,
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
	req: IPriviligedRequest<{ wordId: string }>,
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
	req: IPriviligedRequest,
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

export { getAllByLanguage, add, update, remove, getAllForWord };
