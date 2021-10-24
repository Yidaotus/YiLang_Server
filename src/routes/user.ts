import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import Joi from 'joi';
import { validate } from '../middleware/validator';
import { jwtGuard, privilegedRequest } from '../middleware/auth';

const router = Router();

const registerSchema = Joi.object({
	username: Joi.string().required(),
	email: Joi.string()
		.email()
		.required(),
	password: Joi.string()
		.min(8)
		.required(),
});

const loginSchema = Joi.object({
	email: Joi.string()
		.email()
		.required(),
	password: Joi.string()
		.min(4)
		.required(),
});

const verifyEmailSchema = Joi.object({
	token: Joi.string().length(50),
});

router.post(
	'/register',
	validate(registerSchema, 'body'),
	UserController.register
);

router.post('/login', validate(loginSchema, 'body'), UserController.login);

router.post(
	'/verify',
	validate(verifyEmailSchema, 'body'),
	UserController.verify
);

router.get(
	'/auth',
	jwtGuard,
	privilegedRequest(UserController.authenticate)
);

export default router;
