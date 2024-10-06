import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const PVK_ENCRYPTION_SALT = process.env.PVK_ENCRYPTION_SALT;
if (!PVK_ENCRYPTION_SALT) {
    throw new Error('Error: The env variable PVK_ENCRYPTION_SALT is missing');
}
const pvkEncryptionSalt = Buffer.from(PVK_ENCRYPTION_SALT, 'hex');

// Function to encrypt the private key
export const encryptPrivateKey = (privateKey: string, iv: Buffer) => {
    const cipher = crypto.createCipheriv(algorithm, pvkEncryptionSalt, iv);
    const encrypted = Buffer.concat([cipher.update(privateKey), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
    };
};

// Function to decrypt the private key
export const decryptPrivateKey = (encryptedData: string, iv: string) => {
    const decipher = crypto.createDecipheriv(algorithm, pvkEncryptionSalt, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedData, 'hex')), decipher.final()]);
    return decrypted.toString();
};
