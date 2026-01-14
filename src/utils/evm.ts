import * as viem from 'viem';

export const isValidEvmAddress = (address: string) => {
    return viem.isAddress(address);
};

export const toTransactionSerializable = (transaction: `0x${string}`) => {
    return viem.parseTransaction(transaction);
};
