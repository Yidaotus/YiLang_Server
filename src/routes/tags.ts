import { Router } from 'express';
import * as TagsController from '../controllers/tags.controller';
import { ApiPaths } from '../helpers/api';
import Joi from 'joi';
import { validate, ValidationTarget } from '../middleware/validator';
import { jwtGuard } from '../middleware/auth';

const router = Router();
const ApiEndpoints = ApiPaths.tags.endpoints;

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

const tagSchema = Joi.object({
	id: Joi.string().required(),
	name: Joi.string(),
	lang: Joi.string().required(),
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
	updatedEntries: Joi.array().items(tagSchema),
	addedEntries: Joi.array().items(tagSchema),
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

router[ApiEndpoints.getAll.method](
	`/${ApiEndpoints.getAll.path}/:lang`,
	jwtGuard,
	validate(getEntriesSchema, 'params'),
	TagsController.getAll
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
