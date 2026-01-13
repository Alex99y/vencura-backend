import { AccountsRepository } from './accounts.repository.js';

export default class AccountsService {
    constructor(private readonly accountsRepository: AccountsRepository) {}

    getAccounts = async (userId: string) => {
        const accounts = await this.accountsRepository.getAccounts(userId);
        return accounts.map((a) => ({
            address: a.address,
            alias: a.alias,
            createdAt: new Date(a.createdAt).toISOString(),
            updatedAt: new Date(a.updatedAt).toISOString(),
        }));
    };

    createAccount = async (userId: string, alias: string) => {
        await this.accountsRepository.createAccount(
            userId,
            alias,
            '0x1234567890123456789012345678901234567890'
        );
    };

    updateAccount = async (userId: string, alias: string, address: string) => {
        await this.accountsRepository.updateAccount(userId, alias, address);
    };

    getAccountBalance = async (userId: string, address: string) => {
        return 0;
    };

    getAccountHistory = async (userId: string, address: string) => {
        return [address];
    };
}
