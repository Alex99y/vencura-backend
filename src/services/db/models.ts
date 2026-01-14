import type { Db, ObjectId } from 'mongodb';
import { getDb } from './mongo.js';

export interface StoredAccount {
    _id: ObjectId;
    userId: string;
    address: string;
    alias: string;
    createdAt: number;
    updatedAt: number;
}

export interface StoredOperation {
    _id: ObjectId;
    userId: string;
    address: string;
    createdAt: number;
    type:
        | 'sign_message'
        | 'sign_transaction'
        | 'create_account'
        | 'update_account';
    description: string;
}

const DEFAULT_DB_NAME = 'vencura_db';

// TODO: A future task could be improve this code to manage migrations.
export default async function initModels(): Promise<Db> {
    const db = await getDb(DEFAULT_DB_NAME);
    await db.createCollection('accounts');
    const accounts = db.collection('accounts');
    accounts.createIndex({ userId: 1, address: 1 }, { unique: true });
    await db.createCollection('operations');
    const operations = db.collection('operations');
    operations.createIndex(
        { _id: 1, userId: 1, address: 1, createdAt: 1 },
        { unique: true }
    );

    return db;
}
