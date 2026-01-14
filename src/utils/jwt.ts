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

    private getKey = async (
        header: jwt.JwtHeader,
        callback: jwt.SigningKeyCallback
    ) => {
        // Avoid calling the JWKS endpoint if the key is already cached
        // TODO: Add a timeout to the cache
        if (this.keyCache) {
            return callback(null, this.keyCache);
        }
        try {
            const signingKey = await this.client.getSigningKey(header.kid);
            this.keyCache = signingKey.getPublicKey();
            callback(null, this.keyCache);
        } catch (err: any) {
            return callback(err);
        }
    };
}
