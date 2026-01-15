import BaseWalletManager from '../../services/wallet/base_manager.js';
import OperationsRepository from './operations.repository.js';
import { SupportedChain } from '../../config/chains.js';
import EvmService from '../../services/chain/evm_service.js';
import { SignTransactionType } from '../../models/validations.js';

export default class OperationsService {
    constructor(
        private readonly operationsRepository: OperationsRepository,
        private readonly walletManager: BaseWalletManager
    ) {}

    signMessage = async (
        userId: string,
        message: string,
        accountAddress: string,
        password: string
    ) => {
        const signature = await this.walletManager.signMessage(
            accountAddress,
            message,
            password
        );
        await this.operationsRepository.storeOperation({
            userId,
            address: accountAddress,
            type: 'sign_message',
            description: `Signed the following message: ${message}`,
        });
        return signature;
    };

    signTransaction = async (userId: string, params: SignTransactionType) => {
        const txHash = await this.walletManager.signTransaction(params);
        await this.operationsRepository.storeOperation({
            userId,
            address: params.address,
            type: 'sign_transaction',
            description: `Signed the following transaction: ${txHash}`,
        });
        return txHash;
    };
}
