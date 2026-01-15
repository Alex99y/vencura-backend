import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm';
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/core';
import BaseWalletManager from './base_manager.js';
import { SignTransactionType } from '../../models/validations.js';
import { ClientError } from '../../utils/errors.js';
import DbService from '../db/db_service.js';

export default class DynamicWalletManager extends BaseWalletManager {
    private constructor(private readonly dbService: DbService, private readonly client: DynamicEvmWalletClient) {
        super();
    }

    createAccount = async (userId: string, password: string) => {
        const result = await this.client.createWalletAccount({
            thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
            password,
            backUpToClientShareService: true,
        });

        return {
            address: result.accountAddress,
            createdAt: Date.now(),
            walletId: result.walletId,
        };
    };

    updateAccountPassword = async (
        userId: string,
        accountAddress: string,
        existingPassword: string,
        newPassword: string
    ) => {
        try {
            if (!await this.isOwnedByAccount(userId, accountAddress)) {
                throw new ClientError('Account not owned by user', 403);
            }
            const result = await this.client.updatePassword({
                accountAddress,
                existingPassword,
                newPassword,
                backUpToClientShareService: true,
            });

            return result;
        } catch (error) {
            // TODO: Handle invalid password error
            throw error;
        }
    };

    signTransaction = async (userId: string, params: SignTransactionType) => {
        throw new ClientError('Signing transactions is not supported.', 400);
        // try {

        //     const signature = await this.client.signTransaction({
        //         senderAddress: params.address,
        //         transaction: params.transaction,
        //         password: params.password,
        //     });

        //     return signature;
        // } catch (error) {
        //     // TODO: Handle invalid password error
        //     throw error;
        // }
    };

    signMessage = async (
        userId: string,
        accountAddress: string,
        message: string,
        password?: string
    ) => {
        if (!await this.isOwnedByAccount(userId, accountAddress)) {
            throw new ClientError('Account not owned by user', 403);
        }
        try {
            const signature = await this.client.signMessage({
                accountAddress,
                message,
                password,
            });

            return signature;
        } catch (error) {
            // TODO: Handle invalid password error
            throw error;
        }
    };

    private isOwnedByAccount = async (userId: string, address: string) => {
        const account = await this.dbService.accounts.getOne(
            userId,
            address
        );
        if (!account) {
            throw new ClientError('Account not found', 404);
        }
        return account.userId === userId;
    }

    static async initialize(
        dbService: DbService,
        environmentId: string,
        apiKey: string,
        debug: boolean
    ) {
        const client = new DynamicEvmWalletClient({
            environmentId,
            debug,
            // Receiving errors when using the MPC accelerator
            enableMPCAccelerator: false,
        });

        await client.authenticateApiToken(apiKey);

        return new DynamicWalletManager(dbService, client);
    }
}
