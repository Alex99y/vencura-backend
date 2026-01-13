import { Request, RequestHandler, Response } from "express";
import AccountsService from "./accounts.service.js";
import { addressSchema, aliasSchema } from "./accounts.model.js";
import { AuthenticatedResponse } from "../../middlewares/authentication.js";

type RequestWithAddress = Request<{ address: string }>

type CreateAccountRequest = Request<{}, {}, { alias: string }>

export default class AccountsController {
    constructor(private readonly accountService: AccountsService) {
    }

    getAccounts: RequestHandler = async (req: Request, res: AuthenticatedResponse) => {
        const userId = res.locals.userId
        const accounts = await this.accountService.getAccounts(userId)
        res.json(accounts)
    }

    createAccount: RequestHandler = async (req: CreateAccountRequest, res: AuthenticatedResponse) => {
        const userId = res.locals.userId
        const alias = aliasSchema.parse(req.body.alias)
        const account = await this.accountService.createAccount(userId, alias)
        res.json(account)
    }

    getAccountBalance: RequestHandler = async (req: RequestWithAddress, res: AuthenticatedResponse) => {
        const userId = res.locals.userId
        const address = addressSchema.parse(req.params.address)
        const balance = await this.accountService.getAccountBalance(userId, address)
        res.json(balance)
    }

    getAccountHistory: RequestHandler = async (req: RequestWithAddress, res: AuthenticatedResponse) => {
        const userId = res.locals.userId
        const address = addressSchema.parse(req.params.address)
        const history = await this.accountService.getAccountHistory(userId, address)
        res.json(history)
    }
}