import Joi from 'joi';

export const ObjectIdSchema = Joi.string()
	.alphanum()
	.length(24)
	.required();
