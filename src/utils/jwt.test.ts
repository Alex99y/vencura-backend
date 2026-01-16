import { JwtService } from './jwt.js';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll } from 'vitest';
import nock from 'nock';
import crypto from 'crypto';

const URL = 'https://jwks.example.com';
const PATH = '/.well-known/jwks.json';
const FULL_URL = URL + PATH;

// Generate RSA key pair for testing
let privateKey: string;
let publicKey: string;
let jwk: {
    kid: string;
    n: string;
    e: string;
    kty: string;
    alg: string;
    use: string;
};

beforeAll(() => {
    // Generate RSA key pair needed for testing the verify endpoint
    //
    const { publicKey: pubKey, privateKey: privKey } =
        crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });

    privateKey = privKey;
    publicKey = pubKey;

    const keyObject = crypto.createPublicKey(publicKey);
    const jwkExport = keyObject.export({ format: 'jwk' });

    jwk = {
        kid: 'test-key-id',
        n: jwkExport.n!,
        e: jwkExport.e!,
        kty: 'RSA',
        alg: 'RS256',
        use: 'sig',
    };

    nock(URL)
        .get(PATH)
        .reply(200, { keys: [jwk] });
});

describe('JwtService', () => {
    it('should decode a token', () => {
        const jwtService = new JwtService(FULL_URL);
        const token = jwt.sign({ sub: '123' }, privateKey, {
            algorithm: 'RS256',
        });
        const decoded = jwtService.decodeToken(token);
        expect(decoded).toBeDefined();
        expect(decoded).toHaveProperty('sub', '123');
    });

    it('should verify a token', async () => {
        const jwtService = new JwtService(FULL_URL);
        const token = jwt.sign({ sub: '123' }, privateKey, {
            algorithm: 'RS256',
        });
        const verified = await jwtService.verifyToken(token);
        expect(verified).toBeDefined();
        expect(verified).toHaveProperty('sub', '123');

        // Check that the key cache is set
        expect(jwtService['keyCache']).toBeDefined();
    });
});
