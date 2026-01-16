import express from 'express';

// Middlewares
import { needsAuthentication } from '../../middlewares/needsAuthentication.js';
import { validateContentType } from '../../middlewares/validateContentType.js';

import OperationsController from './operations.controller.js';
import OperationsService from './operations.service.js';
import { config } from '../../config/index.js';
import { getWalletManager } from '../../services/wallet/index.js';
import DbService from '../../services/db/db_service.js';

const dbService = await DbService.getDbService();
const walletManager = await getWalletManager(dbService, config);
const operationsService = new OperationsService(dbService, walletManager);
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
