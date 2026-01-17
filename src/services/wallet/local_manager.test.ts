import { describe, it, expect, vi, beforeEach } from 'vitest';
import LocalWalletManager from './local_manager.js';
import type DbService from '../db/db_service.js';
import { encrypt } from '../../utils/encryption.js';
import { decrypt } from 'dotenv';

vi.mock('../chain/evm_service.js', () => {
    class EvmService {
        signMessage = vi.fn().mockResolvedValue('0x123');
        signAndSendTransaction = vi.fn().mockResolvedValue('0x123');
    }
    return {
        default: EvmService,
        createEvmAccount: vi.fn().mockResolvedValue({
            address: '0x123',
            privateKey: '0x123',
        }),
    };
});

describe('LocalWalletManager', () => {
    let dbService: Partial<DbService>;

    beforeEach(() => {
        vi.clearAllMocks();
        dbService = {
            accounts: {
                getOne: vi.fn(),
                getAll: vi.fn(),
                createOne: vi.fn(),
                updateOne: vi.fn(),
                getCount: vi.fn(),
            },
            operations: {
                storeOne: vi.fn(),
                getOperations: vi.fn(),
            },
        } as Partial<DbService>;
    });

    it('should create a LocalWalletManager', async () => {
        const localWalletManager = await LocalWalletManager.initialize(
            dbService as DbService
        );
        expect(localWalletManager).toBeInstanceOf(LocalWalletManager);
    });

    it('should create an account', async () => {
        const localWalletManager = await LocalWalletManager.initialize(
            dbService as DbService
        );
        const account = await localWalletManager.createAccount(
            '123',
            'password'
        );
        expect(account).toBeDefined();
        expect(account.address).toBe('0x123');
        expect(account.encryptedPrivateKey).toBeDefined();
    });

    it('should update an account password', async () => {
        const localWalletManager = await LocalWalletManager.initialize(
            dbService as DbService
        );
        const account = await localWalletManager.createAccount(
            '123',
            'password'
        );
        (dbService?.accounts?.updateOne as any).mockImplementation(() =>
            Promise.resolve()
        );
        (dbService?.accounts?.getOne as any).mockResolvedValue({
            address: account.address,
            encryptedPrivateKey: account.encryptedPrivateKey,
        });
        await localWalletManager.updateAccountPassword(
            '123',
            account.address,
            'password',
            'newpassword'
        );
        expect(dbService?.accounts?.getOne as any).toHaveBeenCalledWith(
            '123',
            account.address
        );
        expect(dbService?.accounts?.updateOne as any).toHaveBeenCalledWith(
            '123',
            account.address,
            { encryptedPrivateKey: expect.any(String) }
        );
    });

    it('should sign a message', async () => {
        const localWalletManager = await LocalWalletManager.initialize(
            dbService as DbService
        );
        const account = await localWalletManager.createAccount(
            '123',
            'password'
        );
        (dbService?.accounts?.getOne as any).mockResolvedValue({
            address: account.address,
            encryptedPrivateKey: account.encryptedPrivateKey,
        });
        const signature = await localWalletManager.signMessage(
            '123',
            account.address,
            'message',
            'password'
        );
        expect(signature).toBe('0x123');
        expect(dbService?.accounts?.getOne as any).toHaveBeenCalledWith(
            '123',
            account.address
        );
    });

    it('should sign a transaction', async () => {
        const localWalletManager = await LocalWalletManager.initialize(
            dbService as DbService
        );
        const account = await localWalletManager.createAccount(
            '123',
            'password'
        );
        (dbService?.accounts?.getOne as any).mockResolvedValue({
            address: account.address,
            encryptedPrivateKey: account.encryptedPrivateKey,
        });
        const signature = await localWalletManager.signTransaction('123', {
            address: account.address,
            transaction: {
                to: '0x123',
                amount: '1000000000000000000',
            },
            chain: 'sepolia',
            password: 'password',
        });
        expect(signature).toBe('0x123');
        expect(dbService?.accounts?.getOne as any).toHaveBeenCalledWith(
            '123',
            account.address
        );
    });

    it('should throw an error if the account is not found', async () => {
        const localWalletManager = await LocalWalletManager.initialize(
            dbService as DbService
        );
        (dbService?.accounts?.getOne as any).mockResolvedValue(null);
        await expect(
            localWalletManager['getAndDecryptPrivateKey'](
                '123',
                '0x123',
                'password'
            )
        ).rejects.toThrow('Account not found or private key not found');
    });

    it('should throw an error if the password is incorrect', async () => {
        const localWalletManager = await LocalWalletManager.initialize(
            dbService as DbService
        );
        (dbService?.accounts?.getOne as any).mockResolvedValue({
            address: '0x123',
            encryptedPrivateKey: '0x123',
        });
        await expect(
            localWalletManager['getAndDecryptPrivateKey'](
                '123',
                '0x123',
                'wrongpassword'
            )
        ).rejects.toThrow('Invalid password');
    });
});
