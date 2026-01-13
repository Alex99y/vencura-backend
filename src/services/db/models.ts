import type { ObjectId } from 'mongodb';
import { getDb } from './mongo.js';

export interface StoredAccount {
    _id: ObjectId;
    userId: string;
    address: string;
    alias: string;
    createdAt: number;
    updatedAt: number;
}

const DEFAULT_DB_NAME = 'vencura_db';

// TODO: A future task could be improve this code to manage migrations.
export default async function initModels() {
    const db = await getDb(DEFAULT_DB_NAME);
    await db.createCollection('accounts');
    const accounts = db.collection('accounts');
    accounts.createIndex({ userId: 1, address: 1 }, { unique: true });
}
