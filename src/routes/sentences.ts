import { Router } from 'express';
import * as SentenceController from '../controllers/sentence.controller';
import Joi from 'joi';
import { validate } from '../middleware/validator';
import { jwtGuard, privilegedRequest } from '../middleware/auth';
import { ObjectIdSchema } from './schemas';

const router = Router({ mergeParams: true });

const tagIdSchema = Joi.object({
	id: ObjectIdSchema,
});

const sentenceSchema = Joi.object({
	content: Joi.string().required(),
	translation: Joi.string().required(),
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
	'/all',
	jwtGuard,
	privilegedRequest(SentenceController.getAllByLanguage)
);

router.get(
	'/byWord/:wordId',
	jwtGuard,
	privilegedRequest(SentenceController.getAllForWord)
);

export default router;
