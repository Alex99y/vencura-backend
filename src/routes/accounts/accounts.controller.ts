import { Request } from 'express';
import AccountsService from './accounts.service.js';
import {
    addressSchema,
    aliasSchema,
    chainSchema,
    passwordSchema,
} from '../../models/index.js';
import { AuthenticatedResponse } from '../../middlewares/needs_authentication.js';

type RequestWithAddress = Request<{ address: string }>;

type CreateAccountRequest = Request<
    {},
    {},
    { alias?: string; password?: string }
>;
type UpdateAccountRequest = Request<
    { address: string },
    {},
    { alias?: string; existingPassword?: string; newPassword?: string }
>;

export default class AccountsController {
    constructor(private readonly accountService: AccountsService) {}

    getAccounts = async (req: Request, res: AuthenticatedResponse) => {
        const userId = res.locals.userId;
        const accounts = await this.accountService.getAccounts(userId);
        res.json(accounts);
    };

    getAccount = async (
        req: RequestWithAddress,
        res: AuthenticatedResponse
    ) => {
        const userId = res.locals.userId;
        const address = addressSchema.parse(req.params.address);
        const account = await this.accountService.getAccount(userId, address);
        res.json(account);
    };

    createAccount = async (
        req: CreateAccountRequest,
        res: AuthenticatedResponse
    ) => {
        const userId = res.locals.userId;
        const alias = aliasSchema.parse(req.body?.alias);
        const password = passwordSchema.parse(req.body?.password);
        await this.accountService.createAccount(userId, alias, password);
        res.json({ message: 'Account created successfully' });
    };

    updateAccount = async (
        req: UpdateAccountRequest,
        res: AuthenticatedResponse
    ) => {
        const userId = res.locals.userId;
        const alias = aliasSchema.optional().parse(req.body?.alias);
        const address = addressSchema.parse(req.params?.address);
        const existingPassword = passwordSchema
            .optional()
            .parse(req.body?.existingPassword);
        const newPassword = passwordSchema
            .optional()
            .parse(req.body?.newPassword);
        if (alias)
            await this.accountService.updateAccount(userId, alias, address);
        if (existingPassword && newPassword)
            await this.accountService.updateAccountPassword(
                userId,
                address,
                existingPassword,
                newPassword
            );
        res.json({ message: 'Account updated successfully' });
    };

    getAccountBalance = async (
        req: RequestWithAddress,
        res: AuthenticatedResponse
    ) => {
        const userId = res.locals.userId;
        const address = addressSchema.parse(req.params.address);
        const chain = chainSchema.parse(req.query.chain);
        const balance = await this.accountService.getAccountBalance(
            userId,
            address,
            chain
        );
        res.json({ balance });
    };

    getAccountHistory = async (
        req: RequestWithAddress,
        res: AuthenticatedResponse
    ) => {
        const userId = res.locals.userId;
        const address = addressSchema.parse(req.params.address);
        const history = await this.accountService.getAccountHistory(
            userId,
            address
        );
        res.json(history);
    };
}
