import { Response, NextFunction } from 'express';

import { IApiRequest } from '../routes/';
import Joi from 'joi';
import YiErrors from '../helpers/errors';
import { isDebug } from '../helpers/config';

const validationTargets = ['body', 'query', 'params'] as const;
type ValidationTarget = typeof validationTargets[number];

const isTarget = (
	target: ValidationTarget | {}
): target is ValidationTarget => {
	return (
		typeof target === 'string' &&
		validationTargets.includes(target as ValidationTarget)
	);
};

const validate = (
	schema: Joi.ObjectSchema | Joi.ArraySchema,
	target?: ValidationTarget | {}
) => async (req: IApiRequest<unknown>, res: Response, next: NextFunction) => {
	const options: Joi.ValidationOptions = {
		abortEarly: false,
		allowUnknown: true,
		stripUnknown: true,
		debug: isDebug,
	};
	const { error, value } = schema.validate(
		isTarget(target) ? req[target] : target,
		options
	);
	if (error) {
		const validationYiErrors = `Validation error: ${error.details
			.map((x) => x.message)
			.join(', ')}`;
		const err = new Error(validationYiErrors);
		err.name = YiErrors.VALIDATION_ERROR;
		next(err);
	} else {
		if (isTarget(target)) req[target] = value;
		next();
	}
};

export { validate, ValidationTarget };
