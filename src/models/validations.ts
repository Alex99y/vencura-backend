import { z } from 'zod';
import { isValidEvmAddress } from '../utils/evm.js';

export const addressSchema = z
    .string()
    .refine(isValidEvmAddress, { message: 'Invalid EVM address' });

export const aliasSchema = z
    .string()
    .min(3)
    .max(20)
    .refine((alias) => alias.match(/^[a-zA-Z0-9]+$/), {
        message: 'Alias must contain only letters and numbers',
    });

export const signMessageSchema = z.object({
    message: z.string(),
    accountAddress: addressSchema,
});

export const signTransactionSchema = z.object({
    transaction: z
        .string()
        .refine((t) => t.startsWith('0x'), { message: 'Invalid transaction' })
        .transform((t) => t as `0x${string}`),
    accountAddress: addressSchema,
});

export const passwordSchema = z.string().min(8).max(64);
