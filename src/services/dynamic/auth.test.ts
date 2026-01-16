import { describe, it, expect, vi } from 'vitest';
import DynamicAuthService from './auth.js';

vi.mock('../../config/index.js', () => {
    return {
        config: {
            dynamicLabs: {
                environmentId: '123',
            },
        },
    };
});

vi.mock('../../utils/jwt.js', () => {
    const decodeToken = vi.fn().mockImplementation(() => {
        return {
            sub: '123',
        };
    });
    const verifyToken = vi.fn().mockImplementation(() => {
        return Promise.resolve(true);
    });

    return {
        JwtService: class {
            decodeToken = decodeToken;
            verifyToken = verifyToken;
        },
    };
});

describe('DynamicAuthService', () => {
    it('should create a DynamicAuthService', () => {
        const environmentId = '123';
        const dynamicAuthService = new DynamicAuthService();
        const url = dynamicAuthService['getJwkUrl'](environmentId);
        expect(url).toBe(
            `https://app.dynamic.xyz/api/v0/sdk/${environmentId}/.well-known/jwks`
        );
    });

    it('should decode a token', () => {
        const dynamicAuthService = new DynamicAuthService();
        const token = 'test';
        const decodedToken = {
            sub: '123',
        };
        const decoded = dynamicAuthService.decodeToken(token);
        expect(decoded).toBeDefined();
        expect(decoded).toHaveProperty('sub', '123');
    });

    it('should validate a token', async () => {
        const dynamicAuthService = new DynamicAuthService();
        const token = 'test';
        const validated =
            await dynamicAuthService.validateAuthentication(token);
        expect(validated).toBe(true);
    });
});
