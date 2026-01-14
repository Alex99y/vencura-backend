import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

const SCRYPT_KEY_LENGTH = 32;
const generateKey = async (
    password: string,
    salt: Uint8Array
): Promise<Buffer<ArrayBufferLike>> => {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, SCRYPT_KEY_LENGTH, (err, key) => {
            if (err) {
                reject(err);
            }
            resolve(key);
        });
    });
};

export async function encrypt(data: string, password: string): Promise<string> {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    const key = await generateKey(password, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(data, 'utf8'),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

export async function decrypt(
    encryptedDataB64: string,
    password: string
): Promise<string> {
    const encryptedData = Buffer.from(encryptedDataB64, 'base64');

    const salt = encryptedData.subarray(0, SALT_LENGTH);
    const iv = encryptedData.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = encryptedData.subarray(
        SALT_LENGTH + IV_LENGTH,
        SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );
    const encrypted = encryptedData.subarray(
        SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );

    const key = await generateKey(password, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
}
