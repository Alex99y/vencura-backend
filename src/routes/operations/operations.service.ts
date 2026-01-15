import BaseWalletManager from '../../services/wallet/base_manager.js';
import DbService from '../../services/db/db_service.js';
import { SignTransactionType } from '../../models/validations.js';

export default class OperationsService {
    constructor(
        private readonly dbService: DbService,
        private readonly walletManager: BaseWalletManager
    ) {}

    signMessage = async (
        userId: string,
        message: string,
        accountAddress: string,
        password: string
    ) => {
        const signature = await this.walletManager.signMessage(
            userId,
            accountAddress,
            message,
            password
        );
        await this.dbService.operations.storeOne({
            userId,
            address: accountAddress,
            type: 'sign_message',
            description: `Signed the following message: ${message}`,
        });
        return signature;
    };

    signTransaction = async (userId: string, params: SignTransactionType) => {
        const txHash = await this.walletManager.signTransaction(userId, params);
        await this.dbService.operations.storeOne({
            userId,
            address: params.address,
            type: 'sign_transaction',
            description: `Signed the following transaction: ${txHash}`,
        });
        return txHash;
    };
}
