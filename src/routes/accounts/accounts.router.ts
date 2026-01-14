import express from 'express';
import AccountsController from './accounts.controller.js';
import AccountsService from './accounts.service.js';
import { AccountsRepository } from './accounts.repository.js';
import OperationsRepository from '../operations/operations.repository.js';
import DynamicApiService from '../../services/dynamic/api.js';

// Middlewares
import { authenticate } from '../../middlewares/authentication.js';
import { contentTypeValidation } from '../../middlewares/contentType.js';

import { config } from '../../utils/config.js';
import { getDb } from '../../services/db/mongo.js';

const db = await getDb();

const accountsRepository = new AccountsRepository(db);
const operationsRepository = new OperationsRepository(db);
const dynamicApiService = await DynamicApiService.initialize(
    config.dynamicLabs.environmentId,
    config.dynamicLabs.apiKey
);
const accountsService = new AccountsService(
    accountsRepository,
    operationsRepository,
    dynamicApiService
);
const accountsController = new AccountsController(accountsService);

const router: express.Router = express.Router();

router.get('/accounts', authenticate, accountsController.getAccounts);

router.post(
    '/account',
    contentTypeValidation,
    authenticate,
    accountsController.createAccount
);

router.put(
    '/account/:address',
    contentTypeValidation,
    authenticate,
    accountsController.updateAccount
);

router.get(
    '/account/:address/balance',
    authenticate,
    accountsController.getAccountBalance
);

router.get(
    '/account/:address/history',
    authenticate,
    accountsController.getAccountHistory
);

export default router;
