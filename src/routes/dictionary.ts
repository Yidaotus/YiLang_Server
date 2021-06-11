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
	tags: Joi.array().items(
		Joi.object({
			name: Joi.string(),
			color: Joi.string().optional(),
			comment: Joi.string().optional(),
		})
	),
	comment: Joi.string().optional(),
	spelling: Joi.string().optional(),
	variations: Joi.array().items(
		Joi.object({
			key: Joi.string().required(),
			tags: Joi.array().items(
				Joi.object({
					name: Joi.string(),
					color: Joi.string()
						.optional()
						.allow(''),
					comment: Joi.string()
						.optional()
						.allow(''),
				})
			),
			comment: Joi.string()
				.optional()
				.allow(''),
			spelling: Joi.string()
				.optional()
				.allow(''),
		})
	),
});

const deltaSchema = Joi.object({
	removedEntries: Joi.array().items(Joi.string()),
	updatedEntries: Joi.array().items(Joi.object().pattern(/^/, entrySchema)),
	addedEntries: Joi.array().items(Joi.object().pattern(/^/, entrySchema)),
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
