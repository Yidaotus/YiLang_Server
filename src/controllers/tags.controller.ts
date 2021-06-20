import { Request, Response, NextFunction } from 'express';
import { IApiResponse, ApiStatuses } from '../helpers/api';
import DictionaryTag from '../entities/Tag';
import { IDictionaryTag } from '../Document/Dictionary';
import { isRequestPriviliged } from '../middleware/auth';

const getAll = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	if (isRequestPriviliged(req)) {
		const lang = req.params.lang as string;
		try {
			//await UserService.register(userDetails, verificationUrl);
			const entries: IDictionaryTag[] = await DictionaryTag.find({
				lang,
				userId: req.user.id,
			}).exec();

			let response: IApiResponse<IDictionaryTag[]>;
			if (entries.length > 0) {
				response = {
					status: ApiStatuses.OK,
					message: 'Tags found!',
					payload: entries,
				};
			} else {
				response = {
					status: ApiStatuses.OK,
					message: 'No tags found!',
					payload: [],
				};
			}

			res.status(200).json(response);
		} catch (err) {
			next(err);
		}
	}
};

export { getAll };
