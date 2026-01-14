import express from 'express';
import AccountsController from './accounts.controller.js';
import AccountsService from './accounts.service.js';
import { AccountsRepository } from './accounts.repository.js';
import OperationsRepository from '../operations/operations.repository.js';

// Middlewares
import { needsAuthentication } from '../../middlewares/needsAuthentication.js';
import { validateContentType } from '../../middlewares/validateContentType.js';

import { config } from '../../utils/config.js';
import { getDb } from '../../services/db/mongo.js';
import { getWalletManager } from '../../services/wallet/index.js';

const db = await getDb();

const accountsRepository = new AccountsRepository(db);
const operationsRepository = new OperationsRepository(db);
const walletManager = await getWalletManager(db, config);
const accountsService = new AccountsService(
    accountsRepository,
    operationsRepository,
    walletManager
);
const accountsController = new AccountsController(accountsService);

const router: express.Router = express.Router();

router.get('/accounts', needsAuthentication, accountsController.getAccounts);

router.post(
    '/account',
    validateContentType,
    needsAuthentication,
    accountsController.createAccount
);

router.put(
    '/account/:address',
    validateContentType,
    needsAuthentication,
    accountsController.updateAccount
);

router.get(
    '/account/:address/balance',
    needsAuthentication,
    accountsController.getAccountBalance
);

router.get(
    '/account/:address/history',
    needsAuthentication,
    accountsController.getAccountHistory
);

export default router;
