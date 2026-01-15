import { Db } from 'mongodb';
import { StoredAccount } from '../../services/db/models.js';
import { ClientError } from '../../utils/errors.js';

export const MAX_ACCOUNTS_PER_USER = 10;
export class AccountsRepository {
    constructor(private readonly db: Db) {}

    async getAccounts(userId: string): Promise<StoredAccount[]> {
        return this.db
            .collection('accounts')
            .find({ userId })
            .toArray() as Promise<StoredAccount[]>;
    }

    async getAccount(userId: string, address: string): Promise<StoredAccount> {
        return this.db
            .collection('accounts')
            .findOne({ userId, address }) as Promise<StoredAccount>;
    }

    async updateAccount(userId: string, alias: string, address: string) {
        const currentDate = Date.now();
        return this.db
            .collection('accounts')
            .updateOne(
                { userId, address },
                { $set: { alias, updatedAt: currentDate } }
            );
    }

    async createAccount(
        userId: string,
        alias: string,
        address: string,
        walletId: string,
        encryptedPrivateKey?: string
    ) {
        const currentDate = Date.now();
        const account = {
            userId,
            alias,
            address,
            walletId,
            createdAt: currentDate,
            updatedAt: currentDate,
            encryptedPrivateKey,
        };

        // Use a transaction to make the count check and insert atomic to avoid race conditions
        const session = this.db.client.startSession();
        try {
            await session.withTransaction(async () => {
                const count = await this.db
                    .collection('accounts')
                    .countDocuments({ userId }, { session });
                if (count >= MAX_ACCOUNTS_PER_USER) {
                    throw new ClientError(
                        `Maximum number of accounts per user (${MAX_ACCOUNTS_PER_USER}) reached`,
                        400
                    );
                }
                await this.db
                    .collection('accounts')
                    .insertOne(account, { session });
            });
        } finally {
            await session.endSession();
        }
    }

    async getAccountsCount(userId: string): Promise<number> {
        return this.db.collection('accounts').countDocuments({ userId });
    }
}
