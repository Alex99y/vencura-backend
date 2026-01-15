import { createPublicClient, formatUnits, http, isAddress, parseEther, TransactionSerializable } from 'viem';
import { SupportedChain } from '../../config/chains.js';
import * as viemChains from 'viem/chains';
import { generatePrivateKey, privateKeyToAccount, signMessage, signTransaction } from 'viem/accounts';

export const createEvmAccount = async () => {
    const privateKey = generatePrivateKey();
    const publicKey = privateKeyToAccount(privateKey);

    return {
        address: publicKey.address,
        privateKey,
    };
};


export default class EvmService {

    isValidAddress = (address: string) => {
        return isAddress(address);
    }

    getAccountNativeBalance = async (address: string, chain: SupportedChain) => {
        const publicClient = this.getPublicClient(chain);
        const balance = await publicClient.getBalance({
            address: address as `0x${string}`,
        });

        return {
            formatted: formatUnits(balance, 18),
            raw: balance,
        }
    }

    signMessage = async (
        privateKey: `0x${string}`,
        message: string,
    ): Promise<string> => {
        const signature = await signMessage({ privateKey, message });
        return signature;
    }

    signAndSendTransaction = async (
        transaction: {
            to: string;
            amount: string;
        },
        network: SupportedChain,
        privateKey: `0x${string}`,
    ): Promise<string> => {
        const publicClient = this.getPublicClient(network);
        const isIP1559 = this.isIP1559Chain(network);
        const tx: TransactionSerializable = {
            chainId: this.getViemChain(network).id,
            to: transaction.to as `0x${string}`,
            value: parseEther(transaction.amount),
            nonce: 0,
            gas: 21000n,
        }

        if (isIP1559) {
            const { maxFeePerGas, maxPriorityFeePerGas } = await publicClient.estimateFeesPerGas();
            tx.maxFeePerGas = maxFeePerGas;
            tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
        } else {
            tx.gasPrice = await publicClient.getGasPrice();
        }

        const signature = await signTransaction({ privateKey, transaction: tx });
        const hash = await publicClient.sendRawTransaction({ serializedTransaction: signature });
        return hash;
    };

    private isIP1559Chain(chain: SupportedChain) {
        return chain === 'sepolia' || chain === 'avalanche_fuji';
    }

    private getPublicClient(chain: SupportedChain) {
        return createPublicClient({
            chain: this.getViemChain(chain),
            transport: http(),
        });
    }

    private getViemChain(chain: SupportedChain) {
        switch (chain) {
            case 'sepolia':
                return viemChains.sepolia;
            case 'avalanche_fuji':
                return viemChains.avalancheFuji;
            default:
                throw new Error(`Unsupported chain: ${chain}`);
        }
    }
}