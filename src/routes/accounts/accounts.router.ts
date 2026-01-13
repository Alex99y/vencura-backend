import express from 'express';
import AccountsController from './accounts.controller.js';
import AccountsService from './accounts.service.js';

import { authenticate } from '../../middlewares/authentication.js';
import { contentTypeValidation } from '../../middlewares/contentType.js';
import { AccountsRepository } from './accounts.repository.js';
import { getDb } from '../../services/db/mongo.js';

const db = await getDb();
const accountsRepository = new AccountsRepository(db);
const accountsService = new AccountsService(accountsRepository);
const accountsController = new AccountsController(accountsService);

const router = express.Router();

router.get('/accounts', authenticate, accountsController.getAccounts);

router.post(
    '/account',
    contentTypeValidation,
    authenticate,
    accountsController.createAccount
);

router.put(
    '/account',
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
