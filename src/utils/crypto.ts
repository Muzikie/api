import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const PVK_ENCRYPTION_SALT = process.env.PVK_ENCRYPTION_SALT;
const pvkEncryptionSalt = Buffer.from(PVK_ENCRYPTION_SALT, 'hex');

export const encryptPrivateKey = (privateKey: string, iv: Buffer) => {
  if (!PVK_ENCRYPTION_SALT) {
    throw new Error('Error: The env variable PVK_ENCRYPTION_SALT is missing');
  }

  const cipher = crypto.createCipheriv(algorithm, pvkEncryptionSalt, iv);
  const encrypted = Buffer.concat([cipher.update(privateKey), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
};
