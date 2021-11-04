import { Router } from 'express';
import * as SentenceController from '../controllers/sentence.controller';
import Joi from 'joi';
import { validate } from '../middleware/validator';
import { jwtGuard, privilegedRequest } from '../middleware/auth';

const router = Router();

const getByLanguage = Joi.object({
	lang: Joi.string().required(),
});

const getEntriesSchema = Joi.object({
	lang: Joi.string().required(),
	ids: Joi.array()
		.items(Joi.string())
		.required(),
});

const tagIdSchema = Joi.object({
	id: Joi.string().required(),
});

const sentenceSchema = Joi.object({
	content: Joi.string().required(),
	translation: Joi.string().required(),
	lang: Joi.string().required(),
	source: Joi.object().optional(),
});

const deltaSchema = Joi.object({
	removedTags: Joi.array().items(Joi.string()),
	updatedTags: Joi.array().items(sentenceSchema),
	addedTags: Joi.array().items(sentenceSchema),
});

const fetchSchema = Joi.object({
	sortBy: Joi.string()
		.valid('word', 'translation', 'created')
		.required(),
	lang: Joi.string().required(),
	limit: Joi.number()
		.valid(1, 10, 25, 50)
		.optional(),
	skip: Joi.number().optional(),
});

router.post(
	'/',
	jwtGuard,
	validate(sentenceSchema, 'body'),
	privilegedRequest(SentenceController.add)
);

router.post(
	'/:id',
	jwtGuard,
	validate(sentenceSchema, 'body'),
	privilegedRequest(SentenceController.update)
);

router.delete(
	'/:id',
	jwtGuard,
	validate(tagIdSchema, 'params'),
	privilegedRequest(SentenceController.remove)
);

router.get(
	'/byLanguage/:lang',
	jwtGuard,
	validate(getByLanguage, 'params'),
	privilegedRequest(SentenceController.getAllByLanguage)
);

router.get(
	'/byWord/:wordId',
	jwtGuard,
	validate(getByLanguage, 'params'),
	privilegedRequest(SentenceController.getAllForWord)
);

export default router;
