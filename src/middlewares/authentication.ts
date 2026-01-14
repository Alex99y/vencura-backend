import { NextFunction, Request, RequestHandler, Response } from 'express';
import DynamicAuthService from '../services/dynamic/auth.js';
import { ClientError } from '../utils/errors.js';

const dynamicAuthService = new DynamicAuthService();

export type AuthenticatedResponse<T = any> = Response<T, { userId: string }>;

export const authenticate: RequestHandler = async (
    req: Request,
    res: AuthenticatedResponse,
    next: NextFunction
) => {
    const token = req.headers.authorization;

    if (!token) {
        throw new ClientError('Unauthorized, JWT token is required', 401);
    }

    const decodedToken = dynamicAuthService.decodeToken(token);
    if (!decodedToken) {
        throw new ClientError('Unauthorized, JWT is empty or null', 401);
    }
    
    if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
        throw new ClientError('Unauthorized, JWT token has expired', 401);
    }
    
    if (!await dynamicAuthService.validateAuthentication(token)) {
        throw new ClientError('Unauthorized, invalid JWT token', 401);
    }
    res.locals.userId = decodedToken.sub;

    next();
};
