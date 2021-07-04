import { Router } from 'express';
import * as DictController from '../controllers/dictionary.controller';
import { ApiPaths } from '../helpers/api';
import Joi from 'joi';
import { validate } from '../middleware/validator';
import { jwtGuard, privilegedRequest } from '../middleware/auth';

const router = Router();
const ApiEndpoints = ApiPaths.dict.endpoints;

const documentSchema = Joi.object({
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
	document: Joi.string().required(),
});

const searchEntrySchema = Joi.object({
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
	key: Joi.string().required(),
});

const getEntrySchema = Joi.object({
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
	id: Joi.string()
		.length(36)
		.required(),
});

const getAllSchema = Joi.object({
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
});

const getEntriesSchema = Joi.object({
	ids: Joi.array().items(Joi.string()),
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
});

const deltaSchema = Joi.object({
	removedEntries: Joi.array().items(Joi.string()),
	updatedEntries: Joi.array().items(entrySchema),
	addedEntries: Joi.array().items(entrySchema),
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
	privilegedRequest(DictController.applyDelta)
);

router[ApiEndpoints.add.method](
	`/${ApiEndpoints.add.path}`,
	jwtGuard,
	validate(Joi.array().items(entrySchema), 'body'),
	privilegedRequest(DictController.addEntries)
);

router[ApiEndpoints.delete.method](
	`/${ApiEndpoints.delete.path}`,
	jwtGuard,
	validate(entrySchema, 'body'),
	privilegedRequest(DictController.deleteEntry)
);

router[ApiEndpoints.getAll.method](
	`/${ApiEndpoints.getAll.path}/:lang`,
	jwtGuard,
	validate(getAllSchema, 'params'),
	privilegedRequest(DictController.getAll)
);

router[ApiEndpoints.search.method](
	`/${ApiEndpoints.search.path}/:lang/:key`,
	jwtGuard,
	validate(searchEntrySchema, 'params'),
	privilegedRequest(DictController.searchEntries)
);

router[ApiEndpoints.list.method](
	`/${ApiEndpoints.list.path}`,
	jwtGuard,
	validate(listSchema, 'body'),
	privilegedRequest(DictController.list)
);

router[ApiEndpoints.getMany.method](
	`/${ApiEndpoints.getMany.path}`,
	jwtGuard,
	validate(getEntriesSchema, 'body'),
	privilegedRequest(DictController.getMany)
);

router[ApiEndpoints.get.method](
	`/${ApiEndpoints.get.path}/:lang/:id`,
	jwtGuard,
	validate(getEntrySchema, 'params'),
	privilegedRequest(DictController.getEntry)
);

router[ApiEndpoints.fetch.method](
	`/${ApiEndpoints.fetch.path}`,
	jwtGuard,
	validate(fetchSchema, 'body'),
	privilegedRequest(DictController.fetchEntries)
);

export default router;
