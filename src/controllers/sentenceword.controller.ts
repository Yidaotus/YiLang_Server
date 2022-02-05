import { Response, NextFunction } from 'express';
import {
	IApiResponse,
	ApiStatuses,
	IAddDictionarySentenceParams,
	ILinkSentenceWordParams,
} from '../helpers/api';
import { IPrivilegedRequest } from '../routes';
import * as SentenceWordService from '../services/sentenceword.service';

const unlink = async (
	req: IPrivilegedRequest<ILinkSentenceWordParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { langId } = req.params;
		const { wordId, sentenceId } = req.body;
		await SentenceWordService.unlink({
			userId,
			sentenceId,
			langId,
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
	req: IPrivilegedRequest<ILinkSentenceWordParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userId = req.user.id;
	try {
		const { langId } = req.params;
		const { wordId, sentenceId } = req.body;
		await SentenceWordService.link({
			userId,
			sentenceId,
			langId,
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
