import { Router } from 'express';
import * as DictController from '../controllers/dictionary.controller';
import Joi from 'joi';
import { validate } from '../middleware/validator';
import { jwtGuard, privilegedRequest } from '../middleware/auth';
import { ObjectIdSchema } from './schemas';

const router = Router({ mergeParams: true });

const searchEntrySchema = Joi.object({
	key: Joi.string().required(),
});

const entryIdSchema = Joi.object({
	id: Joi.string().required(),
});

const getEntryIdSchema = Joi.object({
	id: ObjectIdSchema,
});

const entrySchemaOptional = Joi.object({
	id: Joi.string().required(),
	key: Joi.string()
		.required()
		.optional(),
	translations: Joi.array()
		.items(Joi.string())
		.optional(),
	sourceDocument: Joi.string().optional(),
	firstSeen: Joi.object({
		documentId: Joi.string().required(),
		fragmentableId: Joi.string().required(),
		offset: Joi.number().required(),
	}).optional(),
	tags: Joi.array()
		.items(Joi.string())
		.optional(),
	comment: Joi.string()
		.optional()
		.allow(''),
	spelling: Joi.string()
		.optional()
		.allow(''),
	roots: Joi.array()
		.items(Joi.string())
		.required(),
});

const entrySchema = Joi.object({
	key: Joi.string().required(),
	translations: Joi.array()
		.items(Joi.string())
		.required(),
	sourceDocument: Joi.string().optional(),
	firstSeen: Joi.object({
		documentId: Joi.string().required(),
		fragmentableId: Joi.string().required(),
		offset: Joi.number().required(),
	}),
	tags: Joi.array().items(Joi.string()),
	comment: Joi.string()
		.optional()
		.allow(''),
	spelling: Joi.string()
		.optional()
		.allow(''),
	roots: Joi.array()
		.items(Joi.string())
		.required(),
});

const listSchema = Joi.object({
	sortBy: Joi.object({
		key: Joi.string().required(),
		order: Joi.string().valid('ascend', 'descend'),
	}).optional(),
	filter: Joi.object()
		.optional()
		.pattern(
			/^/,
			Joi.array()
				.items(Joi.string())
				.allow(null)
		),
	skip: Joi.number().required(),
	limit: Joi.number().required(),
	excerptLength: Joi.number()
		.optional()
		.allow(''),
	lang: Joi.string().required(),
	searchKey: Joi.string().optional(),
	tagFilter: Joi.array()
		.items(Joi.string())
		.optional(),
});

router.post(
	'/',
	jwtGuard,
	validate(entrySchema, 'body'),
	privilegedRequest(DictController.addEntry)
);

router.delete(
	'/:id',
	jwtGuard,
	validate(entryIdSchema, 'params'),
	privilegedRequest(DictController.deleteEntry)
);

router.post(
	'/search',
	jwtGuard,
	validate(searchEntrySchema, 'body'),
	privilegedRequest(DictController.searchEntries)
);

router.post(
	'/list',
	jwtGuard,
	validate(listSchema, 'body'),
	privilegedRequest(DictController.list)
);

router.post(
	'/:id',
	jwtGuard,
	validate(entrySchema, 'body'),
	privilegedRequest(DictController.updateEntry)
);

router.get(
	'/:id',
	jwtGuard,
	validate(getEntryIdSchema, 'params'),
	privilegedRequest(DictController.getEntry)
);

export default router;
