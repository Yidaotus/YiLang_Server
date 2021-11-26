import { IApiRequest } from '../routes';
import { NextFunction, Response } from 'express';
import { IApiResponse, ApiStatus, ApiStatuses } from '../helpers/api';
import YiErrors from '../helpers/errors';

const errorHandler = async (
	err: Error,
	req: IApiRequest<unknown>,
	res: Response,
	next: NextFunction
): Promise<Response<unknown>> => {
	let status: ApiStatus = ApiStatuses.ERROR;
	let message = err.message || 'Unkown Error';
	if (err) {
		if (err?.name === YiErrors.VALIDATION_ERROR) {
			status = ApiStatuses.INVALIDARGUMENT;
			message = err?.message || 'Invalid parameters!';
		} else {
			const errName = err.name;
			if (errName && errName.indexOf('invalid_grant') > -1) {
				res.clearCookie('3rdpartyoauth');
				status = ApiStatuses.UNAUTHORIZED;
			}
		}
		const response: IApiResponse<null> = {
			status,
			message,
			payload: null,
		};
		return res.status(400).json(response);
	} else {
		return res
			.status(400)
			.json({ status: ApiStatuses.ERROR, message: 'unknown!' });
	}
};

export { errorHandler };
