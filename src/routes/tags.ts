import { Router } from 'express';
import * as TagsController from '../controllers/tags.controller';
import { ApiPaths } from '../helpers/api';
import Joi from 'joi';
import { validate } from '../middleware/validator';
import { jwtGuard, privilegedRequest } from '../middleware/auth';

const router = Router();
const ApiEndpoints = ApiPaths.tags.endpoints;

const getAllSchema = Joi.object({
	lang: Joi.string().required(),
});

const getEntriesSchema = Joi.object({
	lang: Joi.string().required(),
	ids: Joi.array()
		.items(Joi.string())
		.required(),
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
	removedTags: Joi.array().items(Joi.string()),
	updatedTags: Joi.array().items(tagSchema),
	addedTags: Joi.array().items(tagSchema),
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

router[ApiEndpoints.getMany.method](
	ApiEndpoints.getMany.path,
	jwtGuard,
	validate(getEntriesSchema, 'body'),
	privilegedRequest(TagsController.getMany)
);

router[ApiEndpoints.getAll.method](
	`/${ApiEndpoints.getAll.path}/:lang`,
	jwtGuard,
	validate(getAllSchema, 'params'),
	privilegedRequest(TagsController.getAll)
);

router[ApiEndpoints.applyDelta.method](
	`/${ApiEndpoints.applyDelta.path}`,
	jwtGuard,
	validate(deltaSchema, 'body'),
	privilegedRequest(TagsController.applyDelta)
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
