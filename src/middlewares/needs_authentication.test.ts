import { describe, it, expect, vi, beforeEach } from 'vitest';
import { needsAuthentication, type AuthenticatedResponse } from './needs_authentication.js';
import { Request, NextFunction } from 'express';
import { ClientError } from '../utils/errors.js';
import type { DecodedToken } from '../services/dynamic/auth.js';

const { mockDecodeToken, mockValidateAuthentication } = vi.hoisted(() => {
    return {
        mockDecodeToken: vi.fn(),
        mockValidateAuthentication: vi.fn(),
    };
});

vi.mock('../services/dynamic/auth.js', () => {
    return {
        default: class {
            decodeToken = mockDecodeToken;
            validateAuthentication = mockValidateAuthentication;
        },
    };
});

vi.mock('../config/index.js', () => {
    return {
        config: {
            dynamicLabs: {
                environmentId: 'test-env-id',
            },
        },
    };
});

describe('needsAuthentication middleware', () => {
    let req: Request;
    let res: AuthenticatedResponse;
    let next: NextFunction;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        
        // Set default return values
        mockDecodeToken.mockReturnValue({
            sub: 'test-user-id',
            environment_id: 'test-env-id',
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        } as DecodedToken);
        mockValidateAuthentication.mockResolvedValue(true);

        req = { headers: {} } as Request;
        res = vi.mocked({
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
            locals: {},
        }) as unknown as AuthenticatedResponse;
        next = vi.fn() as NextFunction;
    });

    it('should throw an error if the token is not provided', async () => {
        await expect(() => needsAuthentication(req, res, next)).rejects.toThrow(ClientError);
        expect(next).not.toHaveBeenCalled();
    });
    it('should throw an error if the token is invalid', async () => {
        req.headers.authorization = 'test-token-invalid';
        mockDecodeToken.mockReturnValue(null);
        await expect(() => needsAuthentication(req, res, next)).rejects.toThrow(ClientError);
        expect(next).not.toHaveBeenCalled();
    });
    it('should throw an error if the token is not valid for the environment', async () => {
        req.headers.authorization = 'test-token';
        mockDecodeToken.mockReturnValue({
            sub: 'test-user-id',
            environment_id: 'invalid-env-id',
        } as DecodedToken);
        await expect(() => needsAuthentication(req, res, next)).rejects.toThrow(ClientError);
        expect(next).not.toHaveBeenCalled();
    });
    it('should throw an error if the token has expired', async () => {
        req.headers.authorization = 'test-token';
        mockDecodeToken.mockReturnValue({
            sub: 'test-user-id',
            environment_id: 'test-env-id',
            exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        } as DecodedToken);
        await expect(() => needsAuthentication(req, res, next)).rejects.toThrow(ClientError);
        expect(next).not.toHaveBeenCalled();
    });
    it('should throw an error if the token is invalid', async () => {
        req.headers.authorization = 'test-token';
        mockValidateAuthentication.mockResolvedValue(false);
        await expect(() => needsAuthentication(req, res, next)).rejects.toThrow(ClientError);
        expect(next).not.toHaveBeenCalled();
    });
    it('should set the user id in the response locals', async () => {
        req.headers.authorization = 'test-token';
        await needsAuthentication(req, res, next);
        expect(mockDecodeToken).toHaveBeenCalledWith('test-token');
        expect(mockValidateAuthentication).toHaveBeenCalledWith('test-token');
        expect(res.locals.userId).toBe('test-user-id');
        expect(next).toHaveBeenCalled();
    });
});