import { Router } from 'express';
import * as ConfigController from '../controllers/config.controller';
import { ApiPaths } from '../helpers/api';
import { jwtGuard, privilegedRequest } from '../middleware/auth';

const router = Router();
const ApiEndpoints = ApiPaths.config.endpoints;

router.get(
	'/language/:id',
	jwtGuard,
	privilegedRequest(ConfigController.getLanguage)
);

router.delete(
	'/language/:id',
	jwtGuard,
	privilegedRequest(ConfigController.removeLanguage)
);

router.post(
	'/language',
	jwtGuard,
	privilegedRequest(ConfigController.addLanguage)
);

router.get('/', jwtGuard, privilegedRequest(ConfigController.get));

router.delete('/', jwtGuard, privilegedRequest(ConfigController.remove));

router.post('/new', jwtGuard, privilegedRequest(ConfigController.create));

router.post('/', jwtGuard, privilegedRequest(ConfigController.update));

router.post(
	'/active',
	jwtGuard,
	privilegedRequest(ConfigController.setActiveLanguage)
);

export default router;
