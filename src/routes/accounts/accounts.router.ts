import express from 'express';
import AccountsController from './accounts.controller.js';
import AccountsService from './accounts.service.js';

// Middlewares
import { needsAuthentication } from '../../middlewares/needsAuthentication.js';
import { validateContentType } from '../../middlewares/validateContentType.js';

import { config } from '../../config/index.js';
import { getWalletManager } from '../../services/wallet/index.js';
import DbService from '../../services/db/db_service.js';

const dbService = await DbService.getDbService();
const walletManager = await getWalletManager(dbService, config);
const accountsService = new AccountsService(
    dbService,
    walletManager
);
const accountsController = new AccountsController(accountsService);

const router: express.Router = express.Router();

router.get('/accounts', needsAuthentication, accountsController.getAccounts);

router.get(
    '/account/:address',
    needsAuthentication,
    accountsController.getAccount
);

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
