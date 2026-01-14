import * as viem from 'viem';
import { TransactionSerializable } from 'viem';
import {
    generatePrivateKey,
    privateKeyToAccount,
    signMessage,
    signTransaction,
} from 'viem/accounts';

export const isValidEvmAddress = (address: string) => {
    return viem.isAddress(address);
};

export const toTransactionSerializable = (transaction: `0x${string}`) => {
    return viem.parseTransaction(transaction);
};

export const createEvmAccount = async () => {
    const privateKey = generatePrivateKey();
    const publicKey = privateKeyToAccount(privateKey);

    return {
        address: publicKey.address,
        privateKey,
    };
};

export const signEvmMessage = async (
    privateKey: `0x${string}`,
    message: string
) => {
    return signMessage({ privateKey, message });
};

export const signEvmTransaction = async (
    privateKey: `0x${string}`,
    transaction: TransactionSerializable
) => {
    return signTransaction({ privateKey, transaction });
};
