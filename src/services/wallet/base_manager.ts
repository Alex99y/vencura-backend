import { SupportedChain } from '../../config/chains.js';
import { SignTransactionType } from '../../models/validations.js';

export type WalletAccount = {
    address: string;
    createdAt: number;
    walletId: string;
    encryptedPrivateKey?: string;
};

export default abstract class BaseWalletManager {
    abstract createAccount(
        userId: string,
        password: string
    ): Promise<WalletAccount>;
    abstract updateAccountPassword(
        accountAddress: string,
        existingPassword: string,
        newPassword: string
    ): Promise<void>;
    abstract signMessage(
        accountAddress: string,
        message: string,
        password?: string
    ): Promise<string>;
    abstract signTransaction(params: SignTransactionType): Promise<string>;
}
