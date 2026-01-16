import BaseWalletManager from './base_manager.js';
import { encrypt, decrypt } from '../../utils/encryption.js';
import EvmService, { createEvmAccount } from '../chain/evm_service.js';
import { ClientError } from '../../utils/errors.js';
import { SignTransactionType } from '../../models/index.js';
import DbService from '../db/db_service.js';

export default class LocalWalletManager extends BaseWalletManager {
    private constructor(private readonly dbService: DbService) {
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
        userId: string,
        accountAddress: string,
        existingPassword: string,
        newPassword: string
    ) => {
        const decryptedPrivateKey = await this.getAndDecryptPrivateKey(
            userId,
            accountAddress,
            existingPassword
        );
        const newEncryptedPrivateKey = await encrypt(
            decryptedPrivateKey,
            newPassword
        );
        await this.dbService.accounts.updateOne(userId, accountAddress, {
            encryptedPrivateKey: newEncryptedPrivateKey,
        });
    };

    signMessage = async (
        userId: string,
        accountAddress: string,
        message: string,
        password: string
    ) => {
        const decryptedPrivateKey = await this.getAndDecryptPrivateKey(
            userId,
            accountAddress,
            password
        );
        const evmService = new EvmService();
        const signature = await evmService.signMessage(
            decryptedPrivateKey as `0x${string}`,
            message
        );
        return signature;
    };

    signTransaction = async (
        userId: string,
        { transaction, chain, address, password }: SignTransactionType
    ) => {
        const decryptedPrivateKey = await this.getAndDecryptPrivateKey(
            userId,
            address,
            password
        );
        const evmService = new EvmService();
        const signature = await evmService.signAndSendTransaction(
            transaction,
            chain,
            decryptedPrivateKey as `0x${string}`
        );
        return signature;
    };

    private getAndDecryptPrivateKey = async (
        userId: string,
        address: string,
        password: string
    ) => {
        const account = await this.dbService.accounts.getOne(userId, address);
        if (!account || !account.encryptedPrivateKey) {
            throw new ClientError(
                'Account not found or private key not found',
                404
            );
        }
        const decryptedPrivateKey = await decrypt(
            account.encryptedPrivateKey,
            password
        );
        if (!decryptedPrivateKey) {
            throw new ClientError('Invalid password', 401);
        }
        return decryptedPrivateKey as `0x${string}`;
    };

    static async initialize(dbService: DbService) {
        return new LocalWalletManager(dbService);
    }
}
