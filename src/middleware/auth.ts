import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { ApiStatuses, IApiResponse, ITokenData } from '../helpers/api';
import { IPriviligedRequest, IApiRequest } from '../routes/';
import User from '../entities/user';

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
		const response: IApiResponse<void> = {
			status: ApiStatuses.UNAUTHORIZED,
			message: 'Unauthorized',
		};
		return res.status(400).json(response);
	}
	next();
};

export { jwtGuard };
