import { Collection, Db } from 'mongodb';
import {
    StoredAccount,
    StoredOperation,
    StoredOperationResult,
    StoredOperationWithoutIdAndCreatedAt,
} from './types.js';
import { createLogger } from '../../utils/logger.js';
import { getDb } from './mongo.js';
import { ClientError } from '../../utils/errors.js';
const logger = createLogger();

const ACCOUNTS_COLLECTION = 'accounts';
const OPERATIONS_COLLECTION = 'operations';

// TODO: This should be configurable
const MAX_ACCOUNTS_PER_USER = 10;

async function createCollections(db: Db) {
    try {
        await db.createCollection(ACCOUNTS_COLLECTION);
        const accounts = db.collection(ACCOUNTS_COLLECTION);
        accounts.createIndex({ userId: 1, address: 1 }, { unique: true });
        await db.createCollection(OPERATIONS_COLLECTION);
        const operations = db.collection(OPERATIONS_COLLECTION);
        operations.createIndex(
            { _id: 1, userId: 1, address: 1, createdAt: 1 },
            { unique: true }
        );
    } catch (error) {
        logger.error('Error creating collections:', error);
        throw error;
    }
}

export default class DbService {
    private readonly accountsCollection: Collection<StoredAccount>;
    private readonly operationsCollection: Collection<
        Omit<StoredOperation, '_id'>
    >;
    private constructor(private readonly db: Db) {
        this.accountsCollection = db.collection(ACCOUNTS_COLLECTION);
        this.operationsCollection = db.collection(OPERATIONS_COLLECTION);
    }

    public readonly accounts = {
        getAll: async (userId: string): Promise<StoredAccount[]> => {
            return this.accountsCollection
                .find({ userId })
                .toArray() as Promise<StoredAccount[]>;
        },
        getOne: async (
            userId: string,
            address: string
        ): Promise<StoredAccount> => {
            return this.accountsCollection.findOne({
                userId,
                address,
            }) as Promise<StoredAccount>;
        },
        createOne: async (
            userId: string,
            alias: string,
            address: string,
            walletId: string,
            encryptedPrivateKey?: string
        ) => {
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
        },
        updateOne: async (
            userId: string,
            address: string,
            set: Partial<StoredAccount>
        ) => {
            const currentDate = Date.now();
            return await this.accountsCollection.updateOne(
                { userId, address },
                { $set: { ...set, updatedAt: currentDate } }
            );
        },
        getCount: async (userId: string): Promise<number> => {
            return await this.accountsCollection.countDocuments({ userId });
        },
    };

    public readonly operations = {
        storeOne: async (
            operationToStore: StoredOperationWithoutIdAndCreatedAt
        ) => {
            const currentDate = Date.now();
            const operation = {
                ...operationToStore,
                createdAt: currentDate,
            };
            await this.operationsCollection.insertOne(operation);
        },
        getOperations: async (
            userId: string,
            address: string
        ): Promise<StoredOperationResult[]> => {
            const result = await this.operationsCollection
                .find({ userId, address })
                .limit(20)
                .sort({ createdAt: -1 })
                .toArray();
            return result.map((operation) => ({
                createdAt: operation.createdAt,
                type: operation.type,
                description: operation.description,
            }));
        },
    };

    static async getDbService() {
        const db = await getDb();
        await createCollections(db);
        return new DbService(db);
    }
}
