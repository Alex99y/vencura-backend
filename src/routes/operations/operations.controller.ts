import { Request } from 'express';
import OperationsService from './operations.service.js';
import {
    signMessageSchema,
    signTransactionSchema,
} from '../../models/index.js';
import { AuthenticatedResponse } from '../../middlewares/needs_authentication.js';

export default class OperationsController {
    constructor(private readonly operationsService: OperationsService) {}

    signMessage = async (req: Request, res: AuthenticatedResponse) => {
        const userId = res.locals.userId;
        const { message, address, password } = signMessageSchema.parse(
            req.body
        );
        const signature = await this.operationsService.signMessage(
            userId,
            message,
            address,
            password
        );
        res.json({ signature });
    };

    signTransaction = async (req: Request, res: AuthenticatedResponse) => {
        const userId = res.locals.userId;
        const { transaction, chain, address, password } =
            signTransactionSchema.parse(req.body);
        const txHash = await this.operationsService.signTransaction(userId, {
            transaction,
            chain,
            address,
            password,
        });
        res.json({ txHash });
    };
}
