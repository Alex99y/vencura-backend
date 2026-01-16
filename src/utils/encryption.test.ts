import { encrypt, decrypt } from './encryption.js';
import { describe, it, expect } from 'vitest';

describe('Encryption', () => {
    it('should encrypt and decrypt a string', async () => {
        const string = 'test';
        const encrypted = await encrypt(string, 'password');
        const decrypted = await decrypt(encrypted, 'password');
        expect(decrypted).toBe(string);
    });

    it('should throw an error if the password is incorrect', async () => {
        const string = 'test';
        const encrypted = await encrypt(string, 'password');
        await expect(decrypt(encrypted, 'wrong_password')).rejects.toThrow();
    });

    it('should throw an error if the encrypted data is invalid', async () => {
        const invalidData = 'invalid_data';
        await expect(decrypt(invalidData, 'password')).rejects.toThrow();
    });
});
