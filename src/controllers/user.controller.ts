import * as UserService from '../services/user.service';
import { Request, Response, NextFunction } from 'express';
import {
	IApiResponse,
	IRegisterParams,
	ILoginResponseData,
	IUserResponseData,
	ILoginParams,
	IVerifyEmailParams,
	ApiStatuses,
} from '../helpers/api';
import { IApiRequest, IPrivilegedRequest } from '../routes/';
import { config } from '../helpers/config';

const register = async (
	req: IApiRequest<IRegisterParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const userDetails = req.body;
	const verificationUrl = `${config.frontendUrl}/verify`;

	try {
		await UserService.register(userDetails, verificationUrl);
		const response: IApiResponse<null> = {
			status: ApiStatuses.OK,
			message: 'Registration Successfull!',
			payload: null,
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const verify = async (
	req: IApiRequest<IVerifyEmailParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { token } = req.body;

	try {
		await UserService.verify(token);

		const response: IApiResponse<null> = {
			status: ApiStatuses.OK,
			message: 'Account verified!',
			payload: null,
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const login = async (
	req: IApiRequest<ILoginParams>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { email, password } = req.body;
	try {
		const user = await UserService.login({
			email,
			password,
			jwtsecret: req.app.locals.jwtsecret,
		});
		const response: IApiResponse<ILoginResponseData> = {
			status: ApiStatuses.OK,
			message: 'Authentication Succesful!',
			payload: {
				user: {
					...user.user,
					id: Number(user.user.id),
				},
				token: user.token,
			},
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

const authenticate = async (
	req: IPrivilegedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const user = req.user;
	try {
		const response: IApiResponse<IUserResponseData> = {
			status: ApiStatuses.OK,
			message: 'User found',
			payload: { ...user, id: Number(user.id) },
		};
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};

export { register, login, authenticate, verify };
