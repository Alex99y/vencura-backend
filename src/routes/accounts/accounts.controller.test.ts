import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request } from 'express';
import AccountsController from './accounts.controller.js';
import type AccountsService from './accounts.service.js';
import type { AuthenticatedResponse } from '../../middlewares/needs_authentication.js';

vi.mock('../../services/chain/evm_service.js', () => {
    return {
        default: class EvmService {
            isValidAddress = vi.fn().mockReturnValue(true);
        },
    };
});

describe('AccountsController', () => {
    let accountsController: AccountsController;
    let accountsService: AccountsService;

    let req: Request;
    let res: AuthenticatedResponse;

    beforeEach(() => {
        vi.clearAllMocks();
        accountsService = vi.mocked({
            getAccounts: vi.fn(),
            getAccount: vi.fn(),
            createAccount: vi.fn(),
            updateAccount: vi.fn(),
            updateAccountPassword: vi.fn(),
            getAccountBalance: vi.fn(),
            getAccountHistory: vi.fn(),
        }) as unknown as AccountsService;
        accountsController = new AccountsController(accountsService);

        req = vi.mocked({}) as unknown as Request;
        res = vi.mocked({
            json: vi.fn(),
            locals: {
                userId: 'test-user-id',
            },
        }) as unknown as AuthenticatedResponse;
    });

    it('should get accounts', async () => {
        const date = new Date().toISOString();
        (accountsService.getAccounts as any).mockResolvedValue([
            {
                address: '0x123abc',
                alias: 'test',
                createdAt: date,
                updatedAt: date,
            },
        ]);
        await accountsController.getAccounts(req, res);
        expect(accountsService.getAccounts).toHaveBeenCalledWith(
            'test-user-id'
        );
        expect(res.json).toHaveBeenCalledWith([
            {
                address: '0x123abc',
                alias: 'test',
                createdAt: date,
                updatedAt: date,
            },
        ]);
    });

    it('should get an account', async () => {
        const date = new Date().toISOString();
        (accountsService.getAccount as any).mockResolvedValue({
            address: '0x123abc',
            alias: 'test',
            createdAt: date,
            updatedAt: date,
        });
        req = vi.mocked({
            params: {
                address: '0x123abc',
            },
        }) as unknown as Request & { params: { address: string } };
        await accountsController.getAccount(req as any, res);
        expect(accountsService.getAccount).toHaveBeenCalledWith(
            'test-user-id',
            '0x123abc'
        );
        expect(res.json).toHaveBeenCalledWith({
            address: '0x123abc',
            alias: 'test',
            createdAt: date,
            updatedAt: date,
        });
    });

    it('should create an account', async () => {
        (accountsService.createAccount as any).mockResolvedValue();
        req = vi.mocked({
            body: {
                alias: 'test',
                password: 'password',
            },
        }) as unknown as Request & {
            body: { alias: string; password: string };
        };
        await accountsController.createAccount(req as any, res);
        expect(accountsService.createAccount).toHaveBeenCalledWith(
            'test-user-id',
            'test',
            'password'
        );
        expect(res.json).toHaveBeenCalledWith({
            message: 'Account created successfully',
        });
    });

    it('should update an account', async () => {
        (accountsService.updateAccount as any).mockResolvedValue();
        req = vi.mocked({
            params: {
                address: '0x123abc',
            },
            body: {
                alias: 'test',
            },
        }) as unknown as Request;
        await accountsController.updateAccount(req as any, res);
        expect(accountsService.updateAccount).toHaveBeenCalledWith(
            'test-user-id',
            'test',
            '0x123abc'
        );
        expect(res.json).toHaveBeenCalledWith({
            message: 'Account updated successfully',
        });
    });

    it('should update an account password', async () => {
        (accountsService.updateAccountPassword as any).mockResolvedValue();
        req = vi.mocked({
            params: {
                address: '0x123abc',
            },
            body: {
                existingPassword: 'password',
                newPassword: 'newpassword',
            },
        }) as unknown as Request;
        await accountsController.updateAccount(req as any, res);
    });

    it('should get an account balance', async () => {
        (accountsService.getAccountBalance as any).mockResolvedValue('100');
        req = vi.mocked({
            params: {
                address: '0x123abc',
            },
            query: {
                chain: 'sepolia',
            },
        }) as unknown as Request;
        await accountsController.getAccountBalance(req as any, res);
    });

    it('should get an account history', async () => {
        const date = new Date().toISOString();
        req = vi.mocked({
            params: {
                address: '0x123abc',
            },
        }) as unknown as Request;
        (accountsService.getAccountHistory as any).mockResolvedValue([
            {
                address: '0x123abc',
                type: 'transfer',
                description: 'Transfer 100 ETH to 0x123abc',
                createdAt: date,
            },
        ]);
        await accountsController.getAccountHistory(req as any, res);
        expect(accountsService.getAccountHistory).toHaveBeenCalledWith(
            'test-user-id',
            '0x123abc'
        );
        expect(res.json).toHaveBeenCalledWith([
            {
                address: '0x123abc',
                type: 'transfer',
                description: 'Transfer 100 ETH to 0x123abc',
                createdAt: date,
            },
        ]);
    });
});
