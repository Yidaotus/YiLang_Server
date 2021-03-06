import { Router } from 'express';
import { ApiPaths } from '../helpers/api';
import Joi from 'joi';
import { jwtGuard, privilegedRequest } from '../middleware/auth';
import * as DocumentController from '../controllers/document.controller';

const router = Router();
const ApiEndpoints = ApiPaths.document.endpoints;

const documentSchema = Joi.object({
	lang: Joi.string()
		.required()
		.min(2)
		.max(5),
	document: Joi.string().required(),
});

router[ApiEndpoints.save.method](
	`/${ApiEndpoints.save.path}`,
	jwtGuard,
	privilegedRequest(DocumentController.saveDocument)
);

router[ApiEndpoints.list.method](
	`/${ApiEndpoints.list.path}`,
	jwtGuard,
	privilegedRequest(DocumentController.listDocuments)
);

router[ApiEndpoints.getById.method](
	`/${ApiEndpoints.getById.path}/:id`,
	jwtGuard,
	privilegedRequest(DocumentController.getDocument)
);

export default router;
