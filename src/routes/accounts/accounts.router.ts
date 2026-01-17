import express from 'express';
import type AccountsController from './accounts.controller.js';

// Middlewares
import { needsAuthentication } from '../../middlewares/needs_authentication.js';
import { validateContentType } from '../../middlewares/validate_content_type.js';

export default function (accountsController: AccountsController) {
    const router: express.Router = express.Router();

    router.get(
        '/accounts',
        needsAuthentication,
        accountsController.getAccounts
    );

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

    return router;
}
