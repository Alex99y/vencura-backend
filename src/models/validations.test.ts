import { describe, it, expect, vi } from 'vitest';
import {
    aliasSchema,
    passwordSchema,
    signMessageSchema,
    signTransactionSchema,
} from './validations.js';

vi.mock('../services/chain/evm_service.js', () => {
    return {
        default: class {
            isValidAddress = vi.fn().mockReturnValue(true);
        },
    };
});

describe('validations', () => {
    it('should validate alias', () => {
        expect(aliasSchema.parse('test')).toBe('test');
        expect(aliasSchema.parse('test123')).toBe('test123');
        expect(aliasSchema.parse('test1234')).toBe('test1234');
        expect(() => aliasSchema.parse('test 1234')).toThrowError();
        expect(() =>
            aliasSchema.parse(
                'test123456789012345test123456789012345test123456789012345'
            )
        ).toThrowError();
    });
    it('should validate password', () => {
        expect(passwordSchema.parse('test123456')).toBe('test123456');
        expect(
            passwordSchema.parse(
                '1234567890123456789012345678901234567890123456789012345678901234'
            )
        ).toBeDefined();
        expect(() =>
            passwordSchema.parse(
                '12345678901234567890123456789012345678901234567890123456789012345'
            )
        ).toThrowError();
    });
    it('should validate sign message', () => {
        const objectToParse = {
            message: 'test',
            address: '0xe924785E51C4DA1BA27a9450464a4915e505a8D7',
            password: 'test123456',
        };
        expect(signMessageSchema.parse(objectToParse)).toStrictEqual(
            objectToParse
        );
        expect(() =>
            signMessageSchema.parse({
                ...objectToParse,
                message: undefined,
            })
        ).toThrowError();
    });
    it('should validate sign transaction', () => {
        const objectToParse = {
            transaction: {
                to: '0xe924785E51C4DA1BA27a9450464a4915e505a8D7',
                amount: '1',
            },
            chain: 'sepolia',
            address: '0xe924785E51C4DA1BA27a9450464a4915e505a8D7',
            password: 'test123456',
        };
        expect(signTransactionSchema.parse(objectToParse)).toStrictEqual(
            objectToParse
        );
        expect(() =>
            signTransactionSchema.parse({
                ...objectToParse,
                transaction: {
                    to: undefined,
                    amount: '1',
                },
            })
        ).toThrowError();
        expect(() =>
            signTransactionSchema.parse({
                ...objectToParse,
                chain: 'invalid_chain',
            })
        ).toThrowError();
    });
});
