import { z } from 'zod';
import { isValidEvmAddress } from '../../utils/evm.js';

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
