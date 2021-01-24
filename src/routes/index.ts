import express from 'express';
import UserRouter from './user';
import DictRouter from './dictionary';
import { ITokenData, IUserData, ApiPaths } from '../helpers/api';
import { IUser } from '../entities/user';

const router = express.Router();

export interface IApiRequest<T> extends express.Request {
	body: T;
}

export interface IPriviligedRequest<T> extends IApiRequest<T> {
	token: ITokenData;
	user: IUser;
}

router.use(`/${ApiPaths.user.path}`, UserRouter);
router.use(`/${ApiPaths.dict.path}`, DictRouter);

export default router;
