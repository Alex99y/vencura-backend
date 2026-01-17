import { describe, it, expect, vi, beforeEach } from 'vitest';
import DbService from './db_service.js';
import { Collection, Db } from 'mongodb';

vi.mock('../../config/index.js', () => {
    return {
        config: {
            mongodb: {
                uri: 'mongodb://localhost:27017',
            },
        },
    };
});

vi.mock('../../utils/logger.js', () => {
    return {
        createLogger: () => ({
            error: () => undefined,
        }),
    };
});

vi.mock('./mongo.js', () => {
    return {
        getDb: vi.fn().mockResolvedValue({
            createCollection: vi.fn(),
            collection: vi.fn().mockReturnValue({
                createIndex: vi.fn(),
            }),
        }),
    };
});

describe('DbService', () => {
    let db: Partial<Db>;
    let collection: Partial<Collection<any>>;
    let mockedDbService: Partial<DbService>;

    beforeEach(() => {
        vi.clearAllMocks();
        collection = vi.fn() as any;
        db = {
            client: {} as any,
            createCollection: vi.fn(),
            collection: vi.fn().mockReturnValue(collection),
        };
        // @ts-expect-error - We are mocking the DbService constructor
        mockedDbService = new DbService(db as Db);
    });

    it('should create a db service', async () => {
        const dbService = await DbService.getDbService();
        expect(dbService).toBeDefined();
    });
    it('should create collections', async () => {
        expect(db.collection).toHaveBeenCalledTimes(2);
    });

    describe('accounts', () => {
        it('should get all accounts', async () => {
            const accountsToReturn = [
                {
                    _id: 'abc',
                },
                {
                    _id: 'def',
                },
            ];
            collection.find = vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue(accountsToReturn),
            });
            const accounts = await mockedDbService.accounts?.getAll('123');
            expect(accounts).toBeDefined();
            expect(accounts).toEqual(accountsToReturn);
            expect(accountsToReturn).toHaveLength(2);
            expect(collection.find).toHaveBeenCalledWith({ userId: '123' });
        });
        it('should get one account', async () => {
            const accountToReturn = {
                _id: 'abc',
            };
            collection.findOne = vi.fn().mockResolvedValue(accountToReturn);
            const account = await mockedDbService.accounts?.getOne(
                '123',
                '0x123'
            );
            expect(account).toBeDefined();
            expect(account).toEqual(accountToReturn);
            expect(collection.findOne).toHaveBeenCalledWith({
                userId: '123',
                address: '0x123',
            });
        });
        it('should get the count of accounts', async () => {
            collection.countDocuments = vi.fn().mockResolvedValue(2);
            const count = await mockedDbService.accounts?.getCount('123');
            expect(count).toBeDefined();
            expect(count).toEqual(2);
            expect(collection.countDocuments).toHaveBeenCalledWith({
                userId: '123',
            });
        });
        it('should update one account', async () => {
            collection.updateOne = vi.fn().mockResolvedValue({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: 'abc',
            });
            const result = await mockedDbService.accounts?.updateOne(
                '123',
                '0x123',
                { alias: 'test' }
            );
            expect(result).toBeDefined();
            expect(result).toEqual({
                acknowledged: true,
                modifiedCount: 1,
                upsertedId: 'abc',
            });
            expect(collection.updateOne).toHaveBeenCalledWith(
                { userId: '123', address: '0x123' },
                { $set: { alias: 'test', updatedAt: expect.any(Number) } }
            );
        });
        it('should create one account', async () => {
            const mockedEndSession = vi.fn().mockResolvedValue(undefined);
            (db.client as any).startSession = vi.fn().mockReturnValue({
                withTransaction: vi
                    .fn()
                    .mockImplementation(
                        async (callback: () => Promise<void>) => {
                            await callback();
                        }
                    ),
                endSession: mockedEndSession,
            });
            const countDocuments = vi.fn().mockResolvedValue(0);
            const insertOne = vi
                .fn()
                .mockResolvedValue({ acknowledged: true, insertedId: 'abc' });
            db.collection = vi.fn().mockReturnValue({
                countDocuments,
                insertOne,
            });
            await mockedDbService.accounts?.createOne(
                '123',
                'test',
                '0x123',
                '123'
            );
            expect((db.client as any).startSession).toHaveBeenCalled();
            expect(countDocuments).toHaveBeenCalledWith(
                { userId: '123' },
                { session: expect.any(Object) }
            );
            expect(insertOne).toHaveBeenCalledWith(
                {
                    walletId: '123',
                    alias: 'test',
                    address: '0x123',
                    encryptedPrivateKey: undefined,
                    createdAt: expect.any(Number),
                    updatedAt: expect.any(Number),
                    userId: '123',
                },
                { session: expect.any(Object) }
            );
            expect(mockedEndSession).toHaveBeenCalled();
        });
    });

    describe('operations', () => {
        it('should store one operation', async () => {
            const operationToStore = {
                userId: '123',
                address: '0x123',
                type: 'create_account',
                description: 'Created account 0x123',
            };
            collection.insertOne = vi
                .fn()
                .mockResolvedValue({ acknowledged: true, insertedId: 'abc' });
            await mockedDbService.operations?.storeOne(operationToStore as any);
            expect(collection.insertOne).toHaveBeenCalledWith({
                userId: '123',
                address: '0x123',
                type: 'create_account',
                description: 'Created account 0x123',
                createdAt: expect.any(Number),
            });
        });
        it('should get operations', async () => {
            const operationsToReturn = [
                {
                    _id: 'abc',
                },
                {
                    _id: 'def',
                },
            ];
            collection.find = vi
                .fn()
                .mockReturnThis()
                .mockReturnValue({
                    limit: vi.fn().mockReturnThis(),
                    sort: vi.fn().mockReturnThis(),
                    toArray: vi.fn().mockResolvedValue(operationsToReturn),
                });
            const operations = await mockedDbService.operations?.getOperations(
                '123',
                '0x123'
            );
            expect(operations).toBeDefined();
            expect(operationsToReturn).toHaveLength(2);
        });
    });
});
