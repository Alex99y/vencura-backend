import { JwtPayload } from 'jsonwebtoken';
import { config } from '../../utils/config.js';
import { JwtService } from '../../utils/jwt.js';

// There are more fields in the decoded token, but for the assignment purposes, we only need the following fields
export interface DecodedToken extends JwtPayload {
    kid: string;
    sub: string;
    email: string;
    environment_id: string;
    exp: number;
}

export default class DynamicAuthService {
    private readonly jwtService: JwtService;
    constructor() {
        const jwkUrl = this.getJwkUrl(config.dynamicLabs.environmentId);
        this.jwtService = new JwtService(jwkUrl);
    }

    decodeToken = (token: string): DecodedToken => {
        const decodedToken = this.jwtService.decodeToken(token);
        if (!decodedToken || typeof decodedToken !== 'object') {
            throw new Error('Invalid JWT token');
        }
        return decodedToken as DecodedToken;
    };

    validateAuthentication = async (token: string) => {
        return this.jwtService.verifyToken(token);
    };

    private getJwkUrl = (environmentId: string) => {
        return `https://app.dynamic.xyz/api/v0/sdk/${environmentId}/.well-known/jwks`;
    };
}
