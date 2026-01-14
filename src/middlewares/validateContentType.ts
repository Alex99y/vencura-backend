import { RequestHandler } from 'express';
import { ClientError } from '../utils/errors.js';

const SUPPORTED_CONTENT_TYPES = ['application/json'];

export const validateContentType: RequestHandler = (req, res, next) => {
    if (!SUPPORTED_CONTENT_TYPES.includes(req.headers['content-type'])) {
        throw new ClientError(
            'Content-Type not supported or not provided',
            400
        );
    }
    next();
};
