import { createLogger } from './logger.js';
import { vi, describe, it, expect } from 'vitest';
import winston from 'winston';

vi.mock('../config/index.js', () => ({
    config: {
        logger: {
            level: 'info',
            format: 'json',
        },
    },
}));

describe('Logger', () => {
    it('should create a logger', () => {
        const logger = createLogger();
        expect(logger).toBeDefined();
        expect(logger).toBeInstanceOf(winston.Logger);
    });
});
