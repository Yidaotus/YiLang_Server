import express from 'express';
import UserRouter from './user';
import DictRouter from './dictionary';
import DocumentRouter from './document';
import ConfigRouter from './config';
import TagsRouter from './tags';
import { ITokenData, ApiPaths } from '../helpers/api';
import { IUser } from '../entities/user';

const router = express.Router();

export interface IApiRequest<T> extends express.Request {
	body: T;
}

export interface IPriviligedRequest<T = void> extends IApiRequest<T> {
	token: ITokenData;
	user: IUser;
}

router.use(`/${ApiPaths.user.path}`, UserRouter);
router.use(`/${ApiPaths.dict.path}`, DictRouter);
router.use(`/${ApiPaths.document.path}`, DocumentRouter);
router.use(`/${ApiPaths.tags.path}`, TagsRouter);
router.use(`/${ApiPaths.config.path}`, ConfigRouter);

export default router;
