import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { ApiPaths } from '../helpers/api';
import Joi from 'joi';
import { validate, ValidationTarget } from '../middleware/validator';
import { jwtGuard } from '../middleware/auth';

const router = Router();
const ApiEndpoints = ApiPaths.user.endpoints;

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

router[ApiEndpoints.register.method](
	`/${ApiEndpoints.register.path}`,
	validate(registerSchema, 'body'),
	UserController.register
);

router[ApiEndpoints.login.method](
	`/${ApiEndpoints.login.path}`,
	validate(loginSchema, 'body'),
	UserController.login
);

router[ApiEndpoints.verify.method](
	`/${ApiEndpoints.verify.path}`,
	validate(verifyEmailSchema, 'body'),
	UserController.verify
);

router[ApiEndpoints.auth.method](
	`/${ApiEndpoints.auth.path}`,
	jwtGuard,
	UserController.authenticate
);

export default router;
