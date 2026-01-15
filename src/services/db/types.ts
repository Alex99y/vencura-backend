import { ObjectId } from "mongodb";

export interface StoredAccount {
    _id: ObjectId;
    userId: string;
    address: string;
    alias: string;
    createdAt: number;
    updatedAt: number;
    encryptedPrivateKey?: string;
}

export type OperationType =
    | 'sign_message'
    | 'sign_transaction'
    | 'create_account'
    | 'update_account'
    | 'update_account_password';

export interface StoredOperationResult {
    createdAt: number;
    type: OperationType;
    description: string;
}

export interface StoredOperation extends StoredOperationResult {
    _id: ObjectId;
    userId: string;
    address: string;
}

export interface StoredOperationWithoutIdAndCreatedAt extends Omit<StoredOperation, '_id' | 'createdAt'> {
}

