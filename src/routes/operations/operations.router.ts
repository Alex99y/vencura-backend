import express from 'express';

// Middlewares
import { needsAuthentication } from '../../middlewares/needsAuthentication.js';
import { validateContentType } from '../../middlewares/validateContentType.js';

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
    validateContentType,
    needsAuthentication,
    operationsController.signMessage
);
router.post(
    '/sign-transaction',
    validateContentType,
    needsAuthentication,
    operationsController.signTransaction
);

export default router;
