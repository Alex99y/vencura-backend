import { describe, it, expect, vi } from 'vitest';
import EvmService, { createEvmAccount } from './evm_service.js';
import { SUPPORTED_CHAINS, SupportedChain } from '../../config/chains.js';

vi.mock('../../utils/logger.js', () => {
    return {
        createLogger: () => ({
            error: () => undefined,
        }),
    };
});

vi.mock('viem/accounts', () => {
    return {
        generatePrivateKey: () => '0x123',
        privateKeyToAccount: () => ({
            address: '0xe924785E51C4DA1BA27a9450464a4915e505a8D7',
        }),
        signMessage: vi.fn().mockResolvedValue('0x123'),
        signTransaction: vi.fn().mockResolvedValue('0x123'),
    };
});

describe('EvmService', () => {
    const supportedChain = 'sepolia';
    it('should create an account', async () => {
        const account = await createEvmAccount();
        expect(account).toBeDefined();
        expect(account.address).toBeDefined();
        expect(account.privateKey).toBeDefined();
    });
    it('should validate an address', () => {
        const evmService = new EvmService();
        const evmAddress = '0xe924785E51C4DA1BA27a9450464a4915e505a8D7';
        expect(evmService.isValidAddress(evmAddress)).toBe(true);
        expect(evmService.isValidAddress(evmAddress.substring(20))).toBe(false);
    });
    it('should get public client', () => {
        const evmService = new EvmService();
        for (const supportedChain of SUPPORTED_CHAINS) {
            const publicClient = evmService['getPublicClient'](
                supportedChain as SupportedChain
            );
            expect(publicClient).toBeDefined();
        }
    });
    it('should validate isIP1559Chain', () => {
        const evmService = new EvmService();
        expect(evmService['isIP1559Chain']('sepolia')).toBe(true);
        expect(evmService['isIP1559Chain']('avalanche_fuji')).toBe(true);
        expect(evmService['isIP1559Chain']('ethereum' as any)).toBe(false);
    });
    it('should sign a message', async () => {
        const evmService = new EvmService();
        const signature = await evmService.signMessage('0x123', 'message');
        expect(signature).toBe('0x123');
    });
    it('should get account native balance', async () => {
        const evmService = new EvmService();
        evmService['getPublicClient'] = vi.fn().mockReturnValue({
            getBalance: vi.fn().mockReturnValue(1000000000000000000n),
        });
        const balance = await evmService.getAccountNativeBalance(
            '0x123',
            'sepolia'
        );
        expect(balance).toBeDefined();
        expect(balance.formatted).toBe('1');
        expect(balance.raw).toBe(1000000000000000000n);
    });
    it('should sign a transaction', async () => {
        const evmService = new EvmService();
        evmService['getPublicClient'] = vi.fn().mockReturnValue({
            getTransactionCount: vi.fn().mockReturnValue(2),
            estimateFeesPerGas: vi.fn().mockReturnValue({
                maxFeePerGas: 1000000000000000000n,
                maxPriorityFeePerGas: 1000000000000000000n,
            }),
            getGasPrice: vi.fn().mockReturnValue(1000000000000000000n),
            sendRawTransaction: vi.fn().mockReturnValue('0x123'),
        });
        const signature = await evmService.signAndSendTransaction(
            {
                to: '0x123',
                amount: '1000000000000000000',
            },
            'sepolia',
            '0x123'
        );
        expect(signature).toBe('0x123');
    });
});
