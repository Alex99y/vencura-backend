import { z } from 'zod';
import { addressSchema } from '../accounts/accounts.model.js';

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
