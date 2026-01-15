import { SupportedChain } from '../../config/chains.js';
import EvmService from '../../services/chain/evm_service.js';
import BaseWalletManager from '../../services/wallet/base_manager.js';
import { ClientError } from '../../utils/errors.js';
import OperationsRepository from '../operations/operations.repository.js';
import {
    AccountsRepository,
    MAX_ACCOUNTS_PER_USER,
} from './accounts.repository.js';

export default class AccountsService {
    constructor(
        private readonly accountsRepository: AccountsRepository,
        private readonly operationsRepository: OperationsRepository,
        private readonly walletManager: BaseWalletManager
    ) {}

    getAccounts = async (userId: string) => {
        const accounts = await this.accountsRepository.getAccounts(userId);
        return accounts.map((a) => ({
            address: a.address,
            alias: a.alias,
            createdAt: new Date(a.createdAt).toISOString(),
            updatedAt: new Date(a.updatedAt).toISOString(),
        }));
    };

    getAccount = async (userId: string, address: string) => {
        const account = await this.accountsRepository.getAccount(userId, address);
        return {
            address: account.address,
            alias: account.alias,
            createdAt: new Date(account.createdAt).toISOString(),
            updatedAt: new Date(account.updatedAt).toISOString(),
        };
    };

    createAccount = async (userId: string, alias: string, password: string) => {
        const accountsCount =
            await this.accountsRepository.getAccountsCount(userId);
        if (accountsCount >= MAX_ACCOUNTS_PER_USER) {
            throw new ClientError(
                `Maximum number of accounts per user (${MAX_ACCOUNTS_PER_USER}) reached`,
                400
            );
        }
        const account = await this.walletManager.createAccount(
            userId,
            password
        );

        await this.accountsRepository.createAccount(
            userId,
            alias,
            account.address,
            account.walletId,
            account.encryptedPrivateKey
        );
        await this.operationsRepository.storeOperation({
            userId,
            address: account.address,
            type: 'create_account',
            description: `Created account ${account.address} with alias ${alias}`,
        });
    };

    updateAccount = async (userId: string, alias: string, address: string) => {
        await this.accountsRepository.updateAccount(userId, alias, address);
        await this.operationsRepository.storeOperation({
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
            address,
            existingPassword,
            newPassword
        );
        await this.operationsRepository.storeOperation({
            userId,
            address,
            type: 'update_account',
            description: `Updated account password`,
        });
    };

    getAccountBalance = async (userId: string, address: string, chain: SupportedChain) => {
        const evmService = new EvmService();
        const account = await this.accountsRepository.getAccount(userId, address);
        if (!account) {
            throw new ClientError('Account not found', 404);
        }
        const balance = await evmService.getAccountNativeBalance(address, chain);
        return balance.formatted;
    };

    getAccountHistory = async (userId: string, address: string) => {
        const history = await this.operationsRepository.getOperations(
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
