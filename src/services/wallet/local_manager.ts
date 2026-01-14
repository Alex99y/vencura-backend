import { TransactionSerializable } from 'viem';
import BaseWalletManager from './base_manager.js';
import { encrypt, decrypt } from '../../utils/encryption.js';
import {
    createEvmAccount,
    signEvmMessage,
    signEvmTransaction,
} from '../../utils/evm.js';
import { Db } from 'mongodb';
import { ClientError } from '../../utils/errors.js';

export default class LocalWalletManager extends BaseWalletManager {
    private constructor(private readonly db: Db) {
        super();
    }

    createAccount = async (userId: string, password: string) => {
        const { address, privateKey } = await createEvmAccount();
        const encryptedPrivateKey = await encrypt(
            privateKey.toString(),
            password
        );
        const walletId = crypto.randomUUID();
        const currentDate = Date.now();

        return {
            address,
            createdAt: currentDate,
            walletId,
            encryptedPrivateKey,
        };
    };

    updateAccountPassword = async (
        accountAddress: string,
        existingPassword: string,
        newPassword: string
    ) => {
        const account = await this.db
            .collection('accounts')
            .findOne({ address: accountAddress });
        if (!account) {
            throw new ClientError('Account not found', 404);
        }
        const decryptedPrivateKey = await decrypt(
            account.privateKey,
            existingPassword
        );
        const newEncryptedPrivateKey = await encrypt(
            decryptedPrivateKey,
            newPassword
        );
        await this.db
            .collection('accounts')
            .updateOne(
                { address: accountAddress },
                { $set: { privateKey: newEncryptedPrivateKey } }
            );
    };

    signMessage = async (
        accountAddress: string,
        message: string,
        password: string
    ) => {
        const account = await this.db
            .collection('accounts')
            .findOne({ address: accountAddress });
        if (!account) {
            throw new ClientError('Account not found', 404);
        }
        const decryptedPrivateKey = await decrypt(account.privateKey, password);
        if (!decryptedPrivateKey) {
            throw new ClientError('Invalid password', 401);
        }
        const signature = await signEvmMessage(
            decryptedPrivateKey as `0x${string}`,
            message
        );
        return signature;
    };

    signTransaction = async (
        accountAddress: string,
        preparedTransaction: TransactionSerializable,
        password: string
    ) => {
        const account = await this.db
            .collection('accounts')
            .findOne({ address: accountAddress });
        if (!account) {
            throw new ClientError('Account not found', 404);
        }
        const decryptedPrivateKey = await decrypt(account.privateKey, password);
        if (!decryptedPrivateKey) {
            throw new ClientError('Invalid password', 401);
        }
        const signature = await signEvmTransaction(
            decryptedPrivateKey as `0x${string}`,
            preparedTransaction
        );
        return signature;
    };

    static async initialize(db: Db) {
        return new LocalWalletManager(db);
    }
}
