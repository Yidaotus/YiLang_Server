import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { ApiStatuses, IApiResponse, ITokenData } from '../helpers/api';
import { IPriviligedRequest, IApiRequest } from '../routes/';
import User from '../entities/user';

function isRequestPriviliged<T>(req: Request): req is IPriviligedRequest<T> {
	return (
		(req as IPriviligedRequest<T>).user !== undefined &&
		(req as IPriviligedRequest<T>).token !== undefined
	);
}

type PrivilegedRequestCallback<T> = (
	req: IPriviligedRequest<T>,
	res: Response,
	next: NextFunction
) => Promise<void>;

const privilegedRequest = <T>(cb: PrivilegedRequestCallback<T>) => async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	if (isRequestPriviliged<T>(req)) {
		cb(req, res, next);
	} else {
		const response: IApiResponse<null> = {
			status: ApiStatuses.UNAUTHORIZED,
			message: 'Unauthorized',
			payload: null,
		};
		res.status(400).json(response);
	}
};

const jwtGuard = async (
	req: IApiRequest<unknown>,
	res: Response,
	next: NextFunction
): Promise<Response<unknown>> => {
	try {
		const token = (req.headers['x-auth-token'] as string) || '';
		if (!token) {
			throw new Error();
		}

		const jwtsecret = req.app.locals.jwtsecret;
		const payload = (await jwt.verify(token, jwtsecret)) as ITokenData;
		(req as IPriviligedRequest<unknown>).token = payload;

		const user = await User.findActiveById(payload.user.id);

		if (!user) {
			throw new Error();
		}
		(req as IPriviligedRequest<unknown>).user = user.toJSON();
	} catch (err) {
		const response: IApiResponse<null> = {
			status: ApiStatuses.UNAUTHORIZED,
			message: 'Unauthorized',
			payload: null,
		};
		return res.status(400).json(response);
	}
	next();
};

export { jwtGuard, isRequestPriviliged, privilegedRequest };
