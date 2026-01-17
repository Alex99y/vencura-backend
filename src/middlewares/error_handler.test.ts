import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from './error_handler.js';
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ClientError } from '../utils/errors.js';

vi.mock('../utils/logger.js', () => {
    return {
        createLogger: vi.fn().mockReturnValue({
            error: vi.fn(),
        }),
    };
});

describe('errorHandler middleware', () => {
    let res: Response;
    let req: Request;
    let next: NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();
        next = vi.fn() as NextFunction;
        req = { headers: { 'content-type': 'application/json' } } as Request;
        res = vi.mocked({
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        }) as unknown as Response;
    });

    it('should handle ZodError', () => {
        const err = new ZodError([
            { message: 'test', path: ['test'], code: 'custom', input: 'test' },
        ]);
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Validation Error',
            errors: err.issues.map((issue) => issue.message),
        });
        expect(next).not.toHaveBeenCalled();
    });
    it('should handle ClientError', () => {
        const err = new ClientError('test');
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'test' });
        expect(next).not.toHaveBeenCalled();
    });
    it('should handle other errors', () => {
        const err = new Error('test');
        errorHandler(err, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message:
                'Internal Server Error. Please, report this issue to the administrator.',
        });
        expect(next).not.toHaveBeenCalled();
    });
});
