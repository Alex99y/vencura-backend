import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export const configScheme = z.object({
    port: z
        .string()
        .transform((val) => parseInt(val))
        .default(8080)
        .refine((n) => n > 0 && n < 65536, {
            message: 'Port must be between 1 and 65535',
        }),
    host: z.string().default('0.0.0.0'),
    cors: z.array(z.string()).default(['http://localhost:3000']),
    rateLimit: z.object({
        windowMs: z
            .string()
            .transform((val) => parseInt(val))
            .default(1000)
            .refine((n) => n > 0, { message: 'Window must be greater than 0' }),
        max: z
            .string()
            .transform((val) => parseInt(val))
            .default(20)
            .refine((n) => n > 0, { message: 'Max must be greater than 0' }),
    }),
    env: z.enum(['development', 'production']).default('development'),
    logger: z.object({
        level: z.enum(['info', 'debug', 'warn', 'error']).default('info'),
        format: z.enum(['json', 'text']).default('json'),
    }),
    dynamicLabs: z.object({
        apiKey: z.string().optional(),
        environmentId: z.string(),
    }),
    mongodb: z.object({
        uri: z.string().optional(),
    }),
});

export type Config = z.infer<typeof configScheme>;

export const config: Config = configScheme.parse({
    port: process.env.PORT,
    host: process.env.HOST,
    cors: process.env.CORS_ORIGIN?.split(','),
    rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS,
        max: process.env.RATE_LIMIT_MAX,
    },
    env: process.env.NODE_ENV,
    logger: {
        level: process.env.LOG_LEVEL,
        format: process.env.LOG_FORMAT,
    },
    dynamicLabs: {
        apiKey: process.env.DYNAMIC_AUTH_TOKEN,
        environmentId: process.env.DYNAMIC_ENVIRONMENT_ID,
    },
    mongodb: {
        uri: process.env.MONGODB_URI,
    },
});
