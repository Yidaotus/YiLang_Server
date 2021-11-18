import { Router } from 'express';
import Joi from 'joi';
import { jwtGuard, privilegedRequest } from '../middleware/auth';
import * as DocumentController from '../controllers/document.controller';
import { validate } from '../middleware/validator';
import { ObjectIdSchema } from './schemas';

const router = Router({ mergeParams: true });

const documentSchema = Joi.object({
	lang: Joi.string().required(),
	serializedDocument: Joi.string().required(),
});

const documentUpdateSchema = Joi.object({
	title: Joi.string().optional(),
	lang: Joi.string().optional(),
	serializedDocument: Joi.string().required(),
});

const idSchema = Joi.object({
	id: ObjectIdSchema,
});

router.post(
	'/',
	jwtGuard,
	privilegedRequest(DocumentController.createDocument)
);

router.post(
	'/list',
	jwtGuard,
	privilegedRequest(DocumentController.listDocuments)
);

router.get(
	'/:id',
	jwtGuard,
	validate(idSchema, 'params'),
	privilegedRequest(DocumentController.getDocument)
);

router.post(
	'/:id',
	jwtGuard,
	validate(idSchema, 'params'),
	validate(documentUpdateSchema, 'body'),
	privilegedRequest(DocumentController.updateDocument)
);

router.delete(
	'/:id',
	jwtGuard,
	validate(idSchema, 'params'),
	privilegedRequest(DocumentController.removeDocument)
);

export default router;
