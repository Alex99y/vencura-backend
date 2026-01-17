import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccountsService from './accounts.service.js';
import type DbService from '../../services/db/db_service.js';
import type BaseWalletManager from '../../services/wallet/base_manager.js';
import type EvmService from '../../services/chain/evm_service.js';

describe('AccountsService', () => {
    let accountsService: AccountsService;
    let dbService: DbService;
    let walletManager: BaseWalletManager;
    let evmService: EvmService;

    beforeEach(async () => {
        vi.clearAllMocks();
        dbService = vi.mocked({
            accounts: {
                getAll: vi.fn(),
                getOne: vi.fn(),
                createOne: vi.fn(),
                updateOne: vi.fn(),
            },
            operations: {
                storeOne: vi.fn(),
                getOperations: vi.fn(),
            },
        }) as unknown as DbService;
        walletManager = vi.mocked({
            createAccount: vi.fn(),
            updateAccountPassword: vi.fn(),
            signMessage: vi.fn(),
            signTransaction: vi.fn(),
        }) as BaseWalletManager;

        evmService = vi.mocked({
            getAccountNativeBalance: vi.fn(),
        }) as unknown as EvmService;
        accountsService = new AccountsService(
            dbService,
            walletManager,
            evmService
        );
    });

    it('should get all accounts', async () => {
        const accountsToReturn = [
            {
                address: '0x123',
                alias: 'test',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
        (dbService.accounts.getAll as any).mockResolvedValue(accountsToReturn);
        const accounts = await accountsService.getAccounts('123');
        expect(accounts).toEqual(
            accountsToReturn.map((a) => ({
                address: a.address,
                alias: a.alias,
                createdAt: a.createdAt.toISOString(),
                updatedAt: a.updatedAt.toISOString(),
            }))
        );
        expect(dbService.accounts.getAll).toHaveBeenCalledWith('123');
    });

    it('should get one account', async () => {
        const accountToReturn = {
            address: '0x123',
            alias: 'test',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        (dbService.accounts.getOne as any).mockResolvedValue(accountToReturn);
        const account = await accountsService.getAccount('123', '0x123');
        expect(account).toEqual({
            address: accountToReturn.address,
            alias: accountToReturn.alias,
            createdAt: new Date(accountToReturn.createdAt).toISOString(),
            updatedAt: new Date(accountToReturn.updatedAt).toISOString(),
        });
    });

    it('should create an account', async () => {
        const accountToReturn = {
            address: '0x123',
            createdAt: Date.now(),
            walletId: '123',
            encryptedPrivateKey: '0x123',
        };
        (walletManager.createAccount as any).mockResolvedValue(accountToReturn);
        await accountsService.createAccount('123', 'test', 'password');
        expect(walletManager.createAccount).toHaveBeenCalledWith(
            '123',
            'password'
        );
        expect(dbService.accounts.createOne).toHaveBeenCalledWith(
            '123',
            'test',
            '0x123',
            '123',
            '0x123'
        );
        expect(dbService.operations.storeOne).toHaveBeenCalledWith({
            userId: '123',
            address: accountToReturn.address,
            type: 'create_account',
            description: `Created account ${accountToReturn.address} with alias test`,
        });
    });

    it('should update an account', async () => {
        (dbService.accounts.getOne as any).mockResolvedValue({
            address: '0xabc123',
            alias: 'another_alias',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        (dbService.accounts.updateOne as any).mockResolvedValue();
        await accountsService.updateAccount(
            'user_id_123',
            'another_alias',
            '0xabc123'
        );
        expect(dbService.accounts.updateOne).toHaveBeenCalledWith(
            'user_id_123',
            '0xabc123',
            { alias: 'another_alias' }
        );
        expect(dbService.operations.storeOne).toHaveBeenCalledWith({
            userId: 'user_id_123',
            address: '0xabc123',
            type: 'update_account',
            description: `Updated account alias to another_alias`,
        });
    });

    it('should update an account password', async () => {
        (dbService.accounts.getOne as any).mockResolvedValue({
            address: '0xabcdefg',
            alias: 'test',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        (walletManager.updateAccountPassword as any).mockResolvedValue();
        await accountsService.updateAccountPassword(
            '123',
            '0xabcdefg',
            'password',
            'newpassword'
        );
        expect(walletManager.updateAccountPassword).toHaveBeenCalledWith(
            '123',
            '0xabcdefg',
            'password',
            'newpassword'
        );
        expect(dbService.operations.storeOne).toHaveBeenCalledWith({
            userId: '123',
            address: '0xabcdefg',
            type: 'update_account',
            description: `Updated account password`,
        });
    });

    it('should get an account balance', async () => {
        (dbService.accounts.getOne as any).mockResolvedValue({
            address: '0x123abc',
            alias: 'test',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        (evmService.getAccountNativeBalance as any).mockResolvedValue({
            formatted: '100',
            raw: 100n,
        });
        const balance = await accountsService.getAccountBalance(
            '123',
            '0x123abc',
            'sepolia'
        );
        expect(balance).toEqual('100');
        expect(evmService.getAccountNativeBalance).toHaveBeenCalledWith(
            '0x123abc',
            'sepolia'
        );
        expect(dbService.accounts.getOne).toHaveBeenCalledWith(
            '123',
            '0x123abc'
        );
    });

    it('should get an account history', async () => {
        (dbService.operations.getOperations as any).mockResolvedValue([
            {
                address: '0x123abc',
                type: 'transfer',
                description: 'Transfer 100 ETH to 0x123abc',
                createdAt: Date.now(),
            },
        ]);
        const history = await accountsService.getAccountHistory(
            '123',
            '0x123abc'
        );
        expect(history).toEqual([
            {
                createdAt: new Date(history[0].createdAt).toISOString(),
                type: 'transfer',
                description: 'Transfer 100 ETH to 0x123abc',
            },
        ]);
        expect(dbService.operations.getOperations).toHaveBeenCalledWith(
            '123',
            '0x123abc'
        );
    });
});
