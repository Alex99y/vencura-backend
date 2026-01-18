import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import getApp from './server.js';
import DbService from './services/db/db_service.js';
import BaseWalletManager from './services/wallet/base_manager.js';

vi.mock('./config/index.js', () => {
    return {
        config: {
            cors: ['http://localhost:3000'],
            rateLimit: {
                windowMs: 15 * 60 * 1000,
                max: 100,
            },
            dynamicLabs: {
                environmentId: 'test-env-id',
            },
        },
    };
});

vi.mock('./utils/logger.js', () => {
    return {
        createLogger: vi.fn().mockReturnValue({
            info: console.log,
            error: console.log,
        }),
    };
});

vi.mock('./routes/accounts/accounts.service.js', () => {
    return {
        default: class AccountsService {},
    };
});

vi.mock('./routes/operations/operations.service.js', () => {
    return {
        default: class OperationsService {},
    };
});

const mockAccountsControllerMethods = vi.hoisted(() => {
    return {
        mockGetAccounts: vi.fn(),
        mockGetAccount: vi.fn(),
        mockCreateAccount: vi.fn(),
        mockUpdateAccount: vi.fn(),
        mockGetAccountBalance: vi.fn(),
        mockGetAccountHistory: vi.fn(),
    };
});

vi.mock('./routes/accounts/accounts.controller.js', () => {
    return {
        default: class AccountsController {
            getAccounts = mockAccountsControllerMethods.mockGetAccounts;
            getAccount = mockAccountsControllerMethods.mockGetAccount;
            createAccount = mockAccountsControllerMethods.mockCreateAccount;
            updateAccount = mockAccountsControllerMethods.mockUpdateAccount;
            getAccountBalance =
                mockAccountsControllerMethods.mockGetAccountBalance;
            getAccountHistory =
                mockAccountsControllerMethods.mockGetAccountHistory;
        },
    };
});

const mockOperationsControllerMethods = vi.hoisted(() => {
    return {
        mockSignMessage: vi.fn(),
        mockSignTransaction: vi.fn(),
    };
});

vi.mock('./routes/operations/operations.controller.js', () => {
    return {
        default: class OperationsController {
            signMessage = mockOperationsControllerMethods.mockSignMessage;
            signTransaction =
                mockOperationsControllerMethods.mockSignTransaction;
        },
    };
});

const mockNeedsAuthentication = vi.hoisted(() => {
    return {
        mockNeedsAuthentication: vi.fn(),
    };
});

vi.mock('./middlewares/needs_authentication.js', () => {
    return {
        needsAuthentication: mockNeedsAuthentication.mockNeedsAuthentication,
    };
});

const mockValidateContentType = vi.hoisted(() => {
    return {
        mockValidateContentType: vi.fn(),
    };
});

vi.mock('./middlewares/validate_content_type.js', () => {
    return {
        validateContentType: mockValidateContentType.mockValidateContentType,
    };
});

describe('Server', () => {
    let app: express.Express;

    beforeEach(() => {
        vi.clearAllMocks();
        const dbService = vi.mocked({}) as unknown as DbService;
        const walletManager = vi.mocked({}) as unknown as BaseWalletManager;
        app = getApp(dbService, walletManager);

        // Mock middleware functions to call next() to continue
        mockNeedsAuthentication.mockNeedsAuthentication.mockImplementation(
            (req, res, next) => {
                next();
            }
        );
        mockValidateContentType.mockValidateContentType.mockImplementation(
            (req, res, next) => {
                next();
            }
        );
    });

    it('should request GET /api/v1/accounts', async () => {
        const accountsToReturn = [
            {
                id: '1',
                name: 'Account 1',
            },
        ];
        mockAccountsControllerMethods.mockGetAccounts.mockImplementation(
            (req, res, next) => {
                res.status(200).json(accountsToReturn);
            }
        );
        const response = await request(app).get('/api/v1/accounts').send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(accountsToReturn);
    });

    it('should request GET /api/v1/account/:address', async () => {
        const address = '0x1234567890abcdef';
        const accountToReturn = {
            id: '1',
            name: 'Account 1',
            address: address,
        };
        mockAccountsControllerMethods.mockGetAccount.mockImplementation(
            (req, res, next) => {
                res.status(200).json(accountToReturn);
            }
        );
        const response = await request(app)
            .get(`/api/v1/account/${address}`)
            .send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(accountToReturn);
    });

    it('should request POST /api/v1/account', async () => {
        const accountToReturn = {
            id: '1',
            name: 'Account 1',
            address: '0x1234567890abcdef',
        };
        mockAccountsControllerMethods.mockCreateAccount.mockImplementation(
            (req, res, next) => {
                res.status(200).json(accountToReturn);
            }
        );
        const response = await request(app).post('/api/v1/account').send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(accountToReturn);
    });

    it('should request PUT /api/v1/account/:address', async () => {
        const address = '0x1234567890abcdef';
        const accountToReturn = {
            id: '1',
            name: 'Account 1',
            address: address,
        };
        mockAccountsControllerMethods.mockUpdateAccount.mockImplementation(
            (req, res, next) => {
                res.status(200).json(accountToReturn);
            }
        );
        const response = await request(app)
            .put(`/api/v1/account/${address}`)
            .send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(accountToReturn);
    });

    it('should request GET /api/v1/account/:address/balance', async () => {
        const address = '0x1234567890abcdef';
        const balanceToReturn = '100';
        mockAccountsControllerMethods.mockGetAccountBalance.mockImplementation(
            (req, res, next) => {
                res.status(200).json(balanceToReturn);
            }
        );
        const response = await request(app)
            .get(`/api/v1/account/${address}/balance`)
            .send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(balanceToReturn);
    });

    it('should request GET /api/v1/account/:address/history', async () => {
        const address = '0x1234567890abcdef';
        const historyToReturn = [
            {
                id: '1',
                name: 'Operation 1',
            },
        ];
        mockAccountsControllerMethods.mockGetAccountHistory.mockImplementation(
            (req, res, next) => {
                res.status(200).json(historyToReturn);
            }
        );
        const response = await request(app)
            .get(`/api/v1/account/${address}/history`)
            .send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(historyToReturn);
    });

    it('should request POST /api/v1/sign-message', async () => {
        const messageToReturn = '0x1234567890abcdef';
        mockOperationsControllerMethods.mockSignMessage.mockImplementation(
            (req, res, next) => {
                res.status(200).json(messageToReturn);
            }
        );
        const response = await request(app).post('/api/v1/sign-message').send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(messageToReturn);
    });

    it('should request POST /api/v1/sign-transaction', async () => {
        const transactionToReturn = '0x1234567890abcdef';
        mockOperationsControllerMethods.mockSignTransaction.mockImplementation(
            (req, res, next) => {
                res.status(200).json(transactionToReturn);
            }
        );
        const response = await request(app)
            .post('/api/v1/sign-transaction')
            .send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(transactionToReturn);
    });
});
