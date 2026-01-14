import { Db } from 'mongodb';

interface StoredOperationWithoutIdAndCreatedAt {
    userId: string;
    address: string;
    type:
        | 'sign_message'
        | 'sign_transaction'
        | 'create_account'
        | 'update_account';
    description: string;
}

interface StoredOperationResult {
    createdAt: number;
    type:
        | 'sign_message'
        | 'sign_transaction'
        | 'create_account'
        | 'update_account';
    description: string;
}

export default class OperationsRepository {
    constructor(private readonly db: Db) {}

    async storeOperation(
        operationToStore: StoredOperationWithoutIdAndCreatedAt
    ): Promise<void> {
        const currentDate = Date.now();
        const operation = {
            ...operationToStore,
            createdAt: currentDate,
        };
        await this.db.collection('operations').insertOne(operation);
    }

    async getOperations(
        userId: string,
        address: string
    ): Promise<StoredOperationResult[]> {
        const result = await this.db
            .collection('operations')
            .find({ userId, address })
            .toArray();
        return result.map((operation) => ({
            createdAt: operation.createdAt,
            type: operation.type,
            description: operation.description,
        }));
    }
}
