import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export interface Config {
    port: number;
    host: string;
    cors: string[];
    rateLimit: {
        windowMs: number;
        max: number;
    };
    env: 'development' | 'production';
    logger: {
        level: 'info' | 'debug' | 'warn' | 'error';
        format: 'json' | 'text';
    };
    dynamicLabs: {
        apiKey: string;
        environmentId: string;
    };
    mongodb: {
        uri: string | undefined;
    };
}

export const config: Config = {
    port: z
        .string()
        .transform((val) => parseInt(val))
        .default(8080)
        .refine((n) => n > 0 && n < 65536, {
            message: 'Port must be between 1 and 65535',
        })
        .parse(process.env.PORT),
    host: z.string().default('0.0.0.0').parse(process.env.HOST),
    cors: z
        .array(z.string())
        .default(['http://localhost:3000'])
        .parse(process.env.CORS_ORIGIN.split(',')),
    rateLimit: {
        windowMs: z
            .string()
            .transform((val) => parseInt(val))
            .default(1000)
            .refine((n) => n > 0, { message: 'Window must be greater than 0' })
            .parse(process.env.RATE_LIMIT_WINDOW_MS),
        max: z
            .string()
            .transform((val) => parseInt(val))
            .default(20)
            .refine((n) => n > 0, { message: 'Max must be greater than 0' })
            .parse(process.env.RATE_LIMIT_MAX),
    },
    env: z
        .enum(['development', 'production'])
        .default('development')
        .parse(process.env.NODE_ENV),
    logger: {
        level: z
            .enum(['info', 'debug', 'warn', 'error'])
            .default('info')
            .parse(process.env.LOG_LEVEL),
        format: z
            .enum(['json', 'text'])
            .default('json')
            .parse(process.env.LOG_FORMAT),
    },
    dynamicLabs: {
        apiKey: z.string().default('').parse(process.env.DYNAMIC_AUTH_TOKEN),
        environmentId: z
            .string()
            .default('')
            .parse(process.env.DYNAMIC_ENVIRONMENT_ID),
    },
    mongodb: {
        uri: z.string().optional().parse(process.env.MONGODB_URI),
    },
};

export const isDevelopment = config.env === 'development';
export const isProduction = config.env === 'production';
