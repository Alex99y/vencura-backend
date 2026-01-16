import { SupportedChain } from '../../config/chains.js';
import EvmService from '../../services/chain/evm_service.js';
import DbService from '../../services/db/db_service.js';
import BaseWalletManager from '../../services/wallet/base_manager.js';
import { ClientError } from '../../utils/errors.js';

export default class AccountsService {
    constructor(
        private readonly dbService: DbService,
        private readonly walletManager: BaseWalletManager
    ) {}

    getAccounts = async (userId: string) => {
        const accounts = await this.dbService.accounts.getAll(userId);
        return accounts.map((a) => ({
            address: a.address,
            alias: a.alias,
            createdAt: new Date(a.createdAt).toISOString(),
            updatedAt: new Date(a.updatedAt).toISOString(),
        }));
    };

    getAccount = async (userId: string, address: string) => {
        const account = await this.dbService.accounts.getOne(userId, address);
        return {
            address: account.address,
            alias: account.alias,
            createdAt: new Date(account.createdAt).toISOString(),
            updatedAt: new Date(account.updatedAt).toISOString(),
        };
    };

    createAccount = async (userId: string, alias: string, password: string) => {
        const account = await this.walletManager.createAccount(
            userId,
            password
        );

        await this.dbService.accounts.createOne(
            userId,
            alias,
            account.address,
            account.walletId,
            account.encryptedPrivateKey
        );
        await this.dbService.operations.storeOne({
            userId,
            address: account.address,
            type: 'create_account',
            description: `Created account ${account.address} with alias ${alias}`,
        });
    };

    updateAccount = async (userId: string, alias: string, address: string) => {
        await this.dbService.accounts.updateOne(userId, address, { alias });
        await this.dbService.operations.storeOne({
            userId,
            address,
            type: 'update_account',
            description: `Updated account alias to ${alias}`,
        });
    };

    updateAccountPassword = async (
        userId: string,
        address: string,
        existingPassword: string,
        newPassword: string
    ) => {
        await this.walletManager.updateAccountPassword(
            userId,
            address,
            existingPassword,
            newPassword
        );
        await this.dbService.operations.storeOne({
            userId,
            address,
            type: 'update_account',
            description: `Updated account password`,
        });
    };

    getAccountBalance = async (
        userId: string,
        address: string,
        chain: SupportedChain
    ) => {
        const evmService = new EvmService();
        const account = await this.dbService.accounts.getOne(userId, address);
        if (!account) {
            throw new ClientError('Account not found', 404);
        }
        const balance = await evmService.getAccountNativeBalance(
            address,
            chain
        );
        return balance.formatted;
    };

    getAccountHistory = async (userId: string, address: string) => {
        const history = await this.dbService.operations.getOperations(
            userId,
            address
        );
        return history.map((operation) => ({
            createdAt: new Date(operation.createdAt).toISOString(),
            type: operation.type,
            description: operation.description,
        }));
    };
}
