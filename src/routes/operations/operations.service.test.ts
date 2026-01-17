import { describe, it, expect, vi, beforeEach } from 'vitest';
import OperationsService from './operations.service.js';
import type DbService from '../../services/db/db_service.js';
import type BaseWalletManager from '../../services/wallet/base_manager.js';

describe('OperationsService', () => {
    let operationsService: OperationsService;
    let dbService: DbService;
    let walletManager: BaseWalletManager;

    beforeEach(async () => {
        vi.clearAllMocks();
        dbService = vi.mocked({
            operations: {
                storeOne: vi.fn(),
            },
        }) as unknown as DbService;
        walletManager = vi.mocked({
            signMessage: vi.fn(),
            signTransaction: vi.fn(),
        }) as unknown as BaseWalletManager;
        operationsService = new OperationsService(dbService, walletManager);
    });

    it('should sign a message', async () => {
        (walletManager.signMessage as any).mockResolvedValue(
            '0xmessage_signature'
        );
        const signature = await operationsService.signMessage(
            '123',
            'Hello, world!',
            '0xabc123',
            'password'
        );
        expect(signature).toBe('0xmessage_signature');
        expect(dbService.operations.storeOne).toHaveBeenCalledWith({
            userId: '123',
            address: '0xabc123',
            type: 'sign_message',
            description: 'Signed the following message: Hello, world!',
        });
    });

    it('should sign a transaction', async () => {
        (walletManager.signTransaction as any).mockResolvedValue(
            '0xtransaction_hash'
        );
        const txHash = await operationsService.signTransaction('123', {
            transaction: { to: '0xabc123', amount: '1' },
            chain: 'sepolia',
            address: '0xabc123',
            password: 'password',
        });
        expect(txHash).toBe('0xtransaction_hash');
        expect(dbService.operations.storeOne).toHaveBeenCalledWith({
            userId: '123',
            address: '0xabc123',
            type: 'sign_transaction',
            description: 'Signed the following transaction: 0xtransaction_hash',
        });
    });
});
