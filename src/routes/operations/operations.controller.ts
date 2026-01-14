import { Request } from 'express';
import OperationsService from './operations.service.js';
import {
    signMessageSchema,
    signTransactionSchema,
} from '../../models/index.js';
import { AuthenticatedResponse } from '../../middlewares/needsAuthentication.js';

export default class OperationsController {
    constructor(private readonly operationsService: OperationsService) {}

    signMessage = async (req: Request, res: AuthenticatedResponse) => {
        const userId = res.locals.userId;
        const { message, accountAddress } = signMessageSchema.parse(req.body);
        const signature = await this.operationsService.signMessage(
            userId,
            message,
            accountAddress
        );
        res.json({ signature });
    };

    signTransaction = async (req: Request, res: AuthenticatedResponse) => {
        const userId = res.locals.userId;
        const { transaction, accountAddress } = signTransactionSchema.parse(
            req.body
        );
        const signature = await this.operationsService.signTransaction(
            userId,
            transaction,
            accountAddress
        );
        res.json({ signature });
    };
}
