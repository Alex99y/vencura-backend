import type { ThresholdSignatureScheme } from '@dynamic-labs-wallet/core';
import type { TransactionSerializable } from 'viem';

// TEMP: Dynamic Labs Wallet Node EVM types are not exported correctly, so we need to declare them here.
declare module '@dynamic-labs-wallet/node-evm' {
    class DynamicEvmWalletClient {
        constructor(config: {
            environmentId: string;
            debug: boolean;
            enableMPCAccelerator: boolean;
        });
        authenticateApiToken(apiKey: string): Promise<void>;
        createWalletAccount(params: {
            thresholdSignatureScheme: ThresholdSignatureScheme;
            password: string;
            backUpToClientShareService: boolean;
        }): Promise<{ accountAddress: string; walletId: string }>;
        updatePassword(params: {
            accountAddress: string;
            existingPassword: string;
            newPassword: string;
            backUpToClientShareService: boolean;
        }): Promise<void>;
        signMessage(params: {
            accountAddress: string;
            message: string;
            password?: string;
        }): Promise<string>;
        signTransaction(params: {
            senderAddress: string;
            transaction: TransactionSerializable;
            password: string;
        }): Promise<string>;
    }
}
