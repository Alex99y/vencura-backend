import BaseWalletManager from '../../services/wallet/base_manager.js';
import OperationsRepository from './operations.repository.js';
import { toTransactionSerializable } from '../../utils/evm.js';

export default class OperationsService {
    constructor(
        private readonly operationsRepository: OperationsRepository,
        private readonly walletManager: BaseWalletManager
    ) {}

    signMessage = async (
        userId: string,
        message: string,
        accountAddress: string
    ) => {
        const signature = await this.walletManager.signMessage(
            accountAddress,
            message
        );
        await this.operationsRepository.storeOperation({
            userId,
            address: accountAddress,
            type: 'sign_message',
            description: `Signed the following message: ${message}`,
        });
        return signature;
    };

    signTransaction = async (
        userId: string,
        transaction: `0x${string}`,
        accountAddress: string
    ) => {
        const transactionSerializable = toTransactionSerializable(transaction);
        const signature = await this.walletManager.signTransaction(
            accountAddress,
            transactionSerializable
        );
        await this.operationsRepository.storeOperation({
            userId,
            address: accountAddress,
            type: 'sign_transaction',
            description: `Signed the following transaction: ${transaction}`,
        });
        return signature;
    };
}
