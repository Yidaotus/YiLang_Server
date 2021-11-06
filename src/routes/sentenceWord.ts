import { Router } from 'express';
import * as SentenceWordController from '../controllers/sentenceword.controller';
import Joi from 'joi';
import { validate } from '../middleware/validator';
import { jwtGuard, privilegedRequest } from '../middleware/auth';
import { ObjectIdSchema } from './schemas';

const router = Router({ mergeParams: true });

const sentenceWordSchema = Joi.object({
	wordId: ObjectIdSchema,
	sentenceId: ObjectIdSchema,
});

router.post(
	'/',
	jwtGuard,
	validate(sentenceWordSchema, 'body'),
	privilegedRequest(SentenceWordController.link)
);

router.delete(
	'/',
	jwtGuard,
	validate(sentenceWordSchema, 'body'),
	privilegedRequest(SentenceWordController.unlink)
);

export default router;
