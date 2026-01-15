import { z } from 'zod';
import { SUPPORTED_CHAINS } from '../config/chains.js';
import EvmService from '../services/chain/evm_service.js';

const evmService = new EvmService();
export const addressSchema = z
    .string()
    .refine(evmService.isValidAddress, { message: 'Invalid EVM address' });

export const aliasSchema = z
    .string()
    .min(3)
    .max(20)
    .refine((alias) => alias.match(/^[a-zA-Z0-9]+$/), {
        message: 'Alias must contain only letters and numbers',
    });

export const passwordSchema = z.string().min(8).max(64);

export const signMessageSchema = z.object({
    message: z.string(),
    address: addressSchema,
    password: passwordSchema,
});

export const chainSchema = z.enum(SUPPORTED_CHAINS);

export const signTransactionSchema = z.object({
    transaction: z.object({
        to: addressSchema,
        amount: z.string().or(z.number().transform((val) => val.toString())),
    }),
    chain: chainSchema,
    address: addressSchema,
    password: passwordSchema,
});

export type SignTransactionType = z.infer<typeof signTransactionSchema>;
