import { TransactionSerializable } from 'viem';
import BaseWalletManager from './base_manager.js';
import { Db } from 'mongodb';

export default class LocalWalletManager extends BaseWalletManager {
    private constructor(db: Db) {
        super();
    }

    createAccount = async (userId: string, password: string) => {
        return {
            address: '0x0000000000000000000000000000000000000000',
            createdAt: Date.now(),
            walletId: '0x0000000000000000000000000000000000000000',
        };
    };

    updateAccountPassword = async (
        accountAddress: string,
        existingPassword: string,
        newPassword: string
    ) => {
        return;
    };

    signMessage = async (
        accountAddress: string,
        message: string,
        password?: string
    ) => {
        return '';
    };

    signTransaction = async (
        accountAddress: string,
        preparedTransaction: TransactionSerializable,
        password?: string
    ) => {
        return '';
    };

    static async initialize(db: Db) {
        return new LocalWalletManager(db);
    }
}
