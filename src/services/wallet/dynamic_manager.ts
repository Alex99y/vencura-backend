import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm';
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/core';
import { TransactionSerializable } from 'viem';
import BaseWalletManager from './base_manager.js';

export default class DynamicWalletManager extends BaseWalletManager {
    private constructor(private readonly client: DynamicEvmWalletClient) {
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
        accountAddress: string,
        existingPassword: string,
        newPassword: string
    ) => {
        const result = await this.client.updatePassword({
            accountAddress,
            existingPassword,
            newPassword,
            backUpToClientShareService: true,
        });

        return result;
    };

    signTransaction = async (
        senderAddress: string,
        preparedTransaction: TransactionSerializable,
        password?: string
    ) => {
        const signature = await this.client.signTransaction({
            senderAddress,
            transaction: preparedTransaction,
            password,
        });

        return signature;
    };

    signMessage = async (
        accountAddress: string,
        message: string,
        password?: string
    ) => {
        const signature = await this.client.signMessage({
            accountAddress,
            message,
            password,
        });

        return signature;
    };

    static async initialize(
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

        return new DynamicWalletManager(client);
    }
}
