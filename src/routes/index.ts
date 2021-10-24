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

router.use('/user', UserRouter);
router.use('/dictionary/entries', DictRouter);
router.use('/documents', DocumentRouter);
router.use('/dictionary/tags', TagsRouter);
router.use('/config', ConfigRouter);

export default router;
