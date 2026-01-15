import express from 'express';

// Middlewares
import { needsAuthentication } from '../../middlewares/needsAuthentication.js';
import { validateContentType } from '../../middlewares/validateContentType.js';

import OperationsController from './operations.controller.js';
import OperationsService from './operations.service.js';
import OperationsRepository from './operations.repository.js';
import { getDb } from '../../services/db/mongo.js';
import { config } from '../../config/index.js';
import { getWalletManager } from '../../services/wallet/index.js';

const db = await getDb();
const walletManager = await getWalletManager(db, config);
const operationsRepository = new OperationsRepository(db);
const operationsService = new OperationsService(
    operationsRepository,
    walletManager
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
