import { Router } from 'express';
import * as SentenceWordController from '../controllers/sentenceword.controller';
import Joi from 'joi';
import { validate } from '../middleware/validator';
import { jwtGuard, privilegedRequest } from '../middleware/auth';

const router = Router();

const sentenceWordSchema = Joi.object({
	wordId: Joi.string().required(),
	sentenceId: Joi.string().required(),
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
