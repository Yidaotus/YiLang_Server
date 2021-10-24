import { Router } from 'express';
import Joi from 'joi';
import { jwtGuard, privilegedRequest } from '../middleware/auth';
import * as DocumentController from '../controllers/document.controller';

const router = Router();

const documentSchema = Joi.object({
	lang: Joi.string().required(),
	document: Joi.string().required(),
});

router.post(
	'/',
	jwtGuard,
	privilegedRequest(DocumentController.saveDocument)
);

router.post(
	'/list',
	jwtGuard,
	privilegedRequest(DocumentController.listDocuments)
);

router.get(
	'/:id',
	jwtGuard,
	privilegedRequest(DocumentController.getDocument)
);

router.delete(
	'/:id',
	jwtGuard,
	privilegedRequest(DocumentController.removeDocument)
);

export default router;
