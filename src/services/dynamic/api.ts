import { DynamicEvmWalletClient } from '@dynamic-labs-wallet/node-evm';
import { ThresholdSignatureScheme } from '@dynamic-labs-wallet/core';
import { TransactionSerializable } from 'viem';
import { config } from '../../utils/config.js';

export default class DynamicApiService {
    constructor(private readonly client: DynamicEvmWalletClient) {}

    createAccount = async (password?: string) => {
        const result = await this.client.createWalletAccount({
            thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
            password,
            backUpToClientShareService: true,
        });

        return result;
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

    // Avoid re-initializing the client if it already exists
    private static DYNAMIC_EVM_SINGLETON_CLIENT: DynamicApiService | undefined;
    private static PROMISE_INITIALIZATION:
        | Promise<DynamicApiService>
        | undefined;
    static async initialize(environmentId: string, apiKey: string) {
        if (DynamicApiService.DYNAMIC_EVM_SINGLETON_CLIENT) {
            return DynamicApiService.DYNAMIC_EVM_SINGLETON_CLIENT;
        }
        const initialize = async () => {
            if (DynamicApiService.DYNAMIC_EVM_SINGLETON_CLIENT) {
                return DynamicApiService.DYNAMIC_EVM_SINGLETON_CLIENT;
            }
            const client = new DynamicEvmWalletClient({
                environmentId,
                debug: config.env === 'development',
                // Receiving errors when using the MPC accelerator
                enableMPCAccelerator: false,
            });

            await client.authenticateApiToken(apiKey);

            DynamicApiService.DYNAMIC_EVM_SINGLETON_CLIENT =
                new DynamicApiService(client);

            return DynamicApiService.DYNAMIC_EVM_SINGLETON_CLIENT;
        };
        if (DynamicApiService.PROMISE_INITIALIZATION) {
            return DynamicApiService.PROMISE_INITIALIZATION;
        }
        DynamicApiService.PROMISE_INITIALIZATION = initialize();
        return await DynamicApiService.PROMISE_INITIALIZATION;
    }
}
