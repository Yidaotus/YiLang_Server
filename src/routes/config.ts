import { Router } from 'express';
import * as ConfigController from '../controllers/config.controller';
import { ApiPaths } from '../helpers/api';
import { jwtGuard, privilegedRequest } from '../middleware/auth';

const router = Router();
const ApiEndpoints = ApiPaths.config.endpoints;

router[ApiEndpoints.get.method](
	ApiEndpoints.get.path,
	jwtGuard,
	privilegedRequest(ConfigController.get)
);

router[ApiEndpoints.set.method](
	ApiEndpoints.set.path,
	jwtGuard,
	privilegedRequest(ConfigController.set)
);

router[ApiEndpoints.setActiveLanguage.method](
	ApiEndpoints.setActiveLanguage.path,
	jwtGuard,
	privilegedRequest(ConfigController.setActiveLanguage)
);

export default router;
