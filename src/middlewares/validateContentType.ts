import { RequestHandler } from 'express';
import { ClientError } from '../utils/errors.js';

const SUPPORTED_CONTENT_TYPES = ['application/json'];

export const validateContentType: RequestHandler = (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (!contentType) {
        throw new ClientError('Content-Type not provided', 400);
    }
    if (!SUPPORTED_CONTENT_TYPES.includes(contentType)) {
        throw new ClientError(`Content-Type ${contentType} not supported`, 400);
    }
    next();
};
