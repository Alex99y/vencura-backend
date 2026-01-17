import { describe, it, expect, vi, beforeEach } from 'vitest';
import OperationsController from './operations.controller.js';
import OperationsService from './operations.service.js';
import type { AuthenticatedResponse } from '../../middlewares/needs_authentication.js';
import type { Request } from 'express';

vi.mock('../../services/chain/evm_service.js', () => {
    return {
        default: class EvmService {
            isValidAddress = vi.fn().mockReturnValue(true);
        },
    };
});

describe('OperationsController', () => {
    let operationsController: OperationsController;
    let operationsService: OperationsService;
    let req: Request;
    let res: AuthenticatedResponse;

    beforeEach(async () => {
        vi.clearAllMocks();
        operationsService = vi.mocked({
            signMessage: vi.fn(),
            signTransaction: vi.fn(),
        }) as unknown as OperationsService;
        operationsController = new OperationsController(operationsService);

        req = vi.mocked({}) as unknown as Request;
        res = vi.mocked({
            json: vi.fn(),
            locals: {
                userId: '123',
            },
        }) as unknown as AuthenticatedResponse;
    });

    it('should sign a message', async () => {
        req = vi.mocked({
            body: {
                message: 'Hello, world!',
                address: '0xabc123',
                password: 'password',
            },
        }) as unknown as Request;
        (operationsService.signMessage as any).mockResolvedValue(
            '0xmessage_signature'
        );
        await operationsController.signMessage(req as any, res);
        expect(operationsService.signMessage).toHaveBeenCalledWith(
            '123',
            'Hello, world!',
            '0xabc123',
            'password'
        );
        expect(res.json).toHaveBeenCalledWith({
            signature: '0xmessage_signature',
        });
    });

    it('should sign a transaction', async () => {
        req = vi.mocked({
            body: {
                transaction: { to: '0xabc123', amount: '1' },
                chain: 'sepolia',
                address: '0xabc123',
                password: 'password',
            },
        }) as unknown as Request;
        (operationsService.signTransaction as any).mockResolvedValue(
            '0xtransaction_hash'
        );
        await operationsController.signTransaction(req as any, res);
        expect(operationsService.signTransaction).toHaveBeenCalledWith('123', {
            transaction: { to: '0xabc123', amount: '1' },
            chain: 'sepolia',
            address: '0xabc123',
            password: 'password',
        });
        expect(res.json).toHaveBeenCalledWith({ txHash: '0xtransaction_hash' });
    });
});
