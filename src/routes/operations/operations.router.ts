import express from 'express';

// Middlewares
import { needsAuthentication } from '../../middlewares/needs_authentication.js';
import { validateContentType } from '../../middlewares/validate_content_type.js';

import type OperationsController from './operations.controller.js';

export default function (operationsController: OperationsController) {
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

    return router;
}
