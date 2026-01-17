import { describe, it, expect, vi } from 'vitest';
import { validateContentType } from './validate_content_type.js';
import { Request, Response, NextFunction } from 'express';
import { ClientError } from '../utils/errors.js';

describe('validateContentType middleware', () => {
    it('should validate the content type', () => {
        const req = { headers: { 'content-type': 'application/json' } } as Request;
        const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
        const next = vi.fn() as NextFunction;
        validateContentType(req, res, next);
        expect(next).toHaveBeenCalled();
    });
    it('should throw an error if the content type is not supported', () => {
        const req = { headers: { 'content-type': 'text/html' } } as Request;
        const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
        const next = vi.fn() as NextFunction;
        expect(() => validateContentType(req, res, next)).toThrow(ClientError);
        expect(next).not.toHaveBeenCalled();
    });
    it('should throw an error if the content type is not provided', () => {
        const req = { headers: {} } as Request;
        const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
        const next = vi.fn() as NextFunction;
        expect(() => validateContentType(req, res, next)).toThrow(ClientError);
        expect(next).not.toHaveBeenCalled();
    });
});