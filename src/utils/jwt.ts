import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export class JwtService {
    private keyCache: string | undefined;
    private readonly client: jwksClient.JwksClient;
    constructor(private readonly jwksUri: string) {
        this.client = jwksClient({
            jwksUri: this.jwksUri,
        });
    }

    decodeToken(token: string) {
        return jwt.decode(token);
    }

    verifyToken(token: string) {
        return new Promise((resolve, reject) => {
            jwt.verify(
                token,
                this.getKey,
                {
                    algorithms: ['RS256', 'ES256'],
                },
                (err, decoded) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(decoded);
                }
            );
        });
    }

    private getKey = (header: any, callback: any) => {
        // Avoid calling the JWKS endpoint if the key is already cached
        if (this.keyCache) {
            return callback(null, this.keyCache);
        }
        this.client.getSigningKey(header.kid, (err, key) => {
            if (err) {
                return callback(err);
            }
            // Convert the key to PEM format as required by jsonwebtoken
            const signingKey = key.getPublicKey();
            this.keyCache = signingKey;
            callback(null, signingKey);
        });
    };
}
