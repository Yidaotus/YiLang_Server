import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	IAddDictionarySentenceParams,
	ILinkSentenceWordParams,
} from '../helpers/api';
import { IPriviligedRequest } from '../routes';
import * as SentenceWordService from '../services/sentenceword.service';

const unlink = async (
	req: IPriviligedRequest<ILinkSentenceWordParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { wordId, sentenceId } = req.body;
		await SentenceWordService.unlink({
			userId,
			sentenceId,
			wordId,
		});

		let response: IApiResponse<null>;
		response = {
			status: ApiStatuses.OK,
			message: 'Sentence-Word unlinked!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const link = async (
	req: IPriviligedRequest<ILinkSentenceWordParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { wordId, sentenceId } = req.body;
		await SentenceWordService.link({
			userId,
			sentenceId,
			wordId,
		});

		let response: IApiResponse<null>;
		response = {
			status: ApiStatuses.OK,
			message: 'Sentence-Word linked!',
			payload: null,
		};

		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

export { link, unlink };
