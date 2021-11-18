import express from 'express';
import UserRouter from './user';
import DictRouter from './dictionary';
import DocumentRouter from './document';
import ConfigRouter from './config';
import TagsRouter from './tags';
import SentencesRouter from './sentences';
import SentenceWordRouter from './sentenceWord';
import { ITokenData, ApiPaths } from '../helpers/api';
import { IUser } from '../entities/user';
import Joi from 'joi';
import { validate } from '../middleware/validator';
import { ObjectIdSchema } from './schemas';

const router = express.Router();

export interface IApiRequest<T> extends express.Request {
	body: T;
}

export interface IPriviligedRequest<T = void> extends IApiRequest<T> {
	token: ITokenData;
	user: IUser;
}

const langIdSchema = Joi.object({
	langId: ObjectIdSchema,
});

router.use('/user', UserRouter);

router.use(
	'/dictionary/:langId/entries',
	validate(langIdSchema, 'params'),
	DictRouter
);

router.use(
	'/documents/:langId',
	validate(langIdSchema, 'params'),
	DocumentRouter
);

router.use(
	'/dictionary/:langId/tags',
	validate(langIdSchema, 'params'),
	TagsRouter
);
router.use(
	'/dictionary/:langId/sentences',
	validate(langIdSchema, 'params'),
	SentencesRouter
);
router.use(
	'/dictionary/:langId/link',
	validate(langIdSchema, 'params'),
	SentenceWordRouter
);
router.use('/config', ConfigRouter);

export default router;
