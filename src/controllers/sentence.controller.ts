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
		const id = req.query.id as string;
		await SentenceService.remove({
			userId,
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
		const id = req.query.id as string;
		await SentenceService.update({
			userId,
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
		const newSentenceId = await SentenceService.create({
			userId,
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
		const { wordId } = req.body;
		//await UserService.register(userDetails, verificationUrl);
		const sentences: Array<IDictionarySentence> = await SentenceService.getAllForWord(
			{
				userId,
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
	const lang = req.params.lang as string;
	const userId = req.user.id;
	try {
		//await UserService.register(userDetails, verificationUrl);
		const sentences = await SentenceService.getAllByLanguage({
			lang,
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
