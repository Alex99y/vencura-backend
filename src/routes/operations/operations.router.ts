import express from 'express';

// Middlewares
import { authenticate } from '../../middlewares/authentication.js';
import { contentTypeValidation } from '../../middlewares/contentType.js';

import OperationsController from './operations.controller.js';
import OperationsService from './operations.service.js';
import DynamicApiService from '../../services/dynamic/api.js';
import OperationsRepository from './operations.repository.js';
import { getDb } from '../../services/db/mongo.js';
import { config } from '../../utils/config.js';

const db = await getDb();
const dynamicApiService = await DynamicApiService.initialize(
    config.dynamicLabs.environmentId,
    config.dynamicLabs.apiKey
);
const operationsRepository = new OperationsRepository(db);
const operationsService = new OperationsService(
    operationsRepository,
    dynamicApiService
);
const operationsController = new OperationsController(operationsService);

const router: express.Router = express.Router();

router.post(
    '/sign-message',
    contentTypeValidation,
    authenticate,
    operationsController.signMessage
);
router.post(
    '/sign-transaction',
    contentTypeValidation,
    authenticate,
    operationsController.signTransaction
);

export default router;
