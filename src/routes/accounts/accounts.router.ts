import express from 'express';
import AccountsController from './accounts.controller.js';
import AccountsService from './accounts.service.js';

import { authenticate } from '../../middlewares/authentication.js';

const accountsService = new AccountsService();
const accountsController = new AccountsController(accountsService);

const router = express.Router();

router.get('/accounts', authenticate, accountsController.getAccounts);

router.post('/account', authenticate, accountsController.createAccount);

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
