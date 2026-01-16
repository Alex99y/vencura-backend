import { ClientError } from './errors.js';
import { describe, it, expect } from 'vitest';

describe('ClientError', () => {
    it('should create a client error', () => {
        const error = new ClientError('test');
        expect(error.message).toBe('test');
    });
});
