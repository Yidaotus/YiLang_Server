import { Router } from 'express';
import * as DictController from '../controllers/dictionary.controller';
import { ApiPaths } from '../helpers/api';
import Joi from 'joi';
import { validate, ValidationTarget } from '../middleware/validator';
import { jwtGuard } from '../middleware/auth';

const router = Router();
const ApiEndpoints = ApiPaths.dict.endpoints;

const documentSchema = Joi.object({
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
	document: Joi.string().required(),
});

const getEntrySchema = Joi.object({
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
	key: Joi.string().required(),
});

const getEntriesSchema = Joi.object({
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
});

const entrySchema = Joi.object({
	id: Joi.string().required(),
	key: Joi.string().required(),
	translations: Joi.array()
		.items(Joi.string())
		.required(),
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
	sourceDocument: Joi.string().optional(),
	firstSeen: Joi.string().optional(),
	tags: Joi.array().items(Joi.string()),
	comment: Joi.string()
		.optional()
		.allow(''),
	spelling: Joi.string()
		.optional()
		.allow(''),
	variations: Joi.array().items(
		Joi.object({
			key: Joi.string().required(),
			comment: Joi.string()
				.optional()
				.allow(''),
			spelling: Joi.string()
				.optional()
				.allow(''),
			tags: Joi.array().items(Joi.string()),
		})
	),
});

// @TODO Only use the one from tags route!
const tagSchema = Joi.object({
	id: Joi.string().required(),
	name: Joi.string(),
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
	color: Joi.string()
		.optional()
		.allow(''),
	comment: Joi.string()
		.optional()
		.allow(''),
	grammarPoint: Joi.object().optional(),
});

const deltaSchema = Joi.object({
	removedEntries: Joi.array().items(Joi.string()),
	updatedEntries: Joi.array().items(entrySchema),
	addedEntries: Joi.array().items(entrySchema),
	addedTags: Joi.array().items(tagSchema),
});

const fetchSchema = Joi.object({
	sortBy: Joi.string()
		.valid('word', 'translation', 'created')
		.required(),
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
	limit: Joi.number()
		.valid(1, 10, 25, 50)
		.optional(),
	skip: Joi.number().optional(),
});

router[ApiEndpoints.applyDelta.method](
	`/${ApiEndpoints.applyDelta.path}`,
	jwtGuard,
	validate(deltaSchema, 'body'),
	DictController.applyDelta
);

router[ApiEndpoints.add.method](
	`/${ApiEndpoints.add.path}`,
	jwtGuard,
	validate(Joi.array().items(entrySchema), 'body'),
	DictController.addEntries
);

router[ApiEndpoints.modify.method](
	`/${ApiEndpoints.modify.path}`,
	jwtGuard,
	validate(entrySchema, 'body'),
	DictController.modifyEntry
);

router[ApiEndpoints.delete.method](
	`/${ApiEndpoints.delete.path}`,
	jwtGuard,
	validate(entrySchema, 'body'),
	DictController.deleteEntry
);

router[ApiEndpoints.getAll.method](
	`/${ApiEndpoints.getAll.path}/:lang`,
	jwtGuard,
	validate(getEntriesSchema, 'params'),
	DictController.getAll
);

router[ApiEndpoints.get.method](
	`/${ApiEndpoints.get.path}/:lang/:key`,
	jwtGuard,
	validate(getEntrySchema, 'params'),
	DictController.getEntry
);

router[ApiEndpoints.fetch.method](
	`/${ApiEndpoints.fetch.path}`,
	jwtGuard,
	validate(fetchSchema, 'body'),
	DictController.fetchEntries
);

/*
router[ApiEndpoints.analyze.method](
	`/${ApiEndpoints.analyze.path}`,
	jwtGuard,
	validate(documentSchema, 'body'),
	DictController.analyzeDocument
);
*/

export default router;
