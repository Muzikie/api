"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptPrivateKey = exports.encryptPrivateKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = 'aes-256-cbc';
const PVK_ENCRYPTION_SALT = process.env.PVK_ENCRYPTION_SALT;
const pvkEncryptionSalt = Buffer.from(PVK_ENCRYPTION_SALT, 'hex');

const encryptPrivateKey = (privateKey, iv) => {
    if (!PVK_ENCRYPTION_SALT) {
        throw new Error('Error: The env variable PVK_ENCRYPTION_SALT is missing');
    }
    const cipher = crypto_1.default.createCipheriv(algorithm, pvkEncryptionSalt, iv);
    const encrypted = Buffer.concat([cipher.update(privateKey), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
    };
};
exports.encryptPrivateKey = encryptPrivateKey;

const decryptPrivateKey = (encryptedData, iv) => {
    if (!PVK_ENCRYPTION_SALT) {
        throw new Error('Error: The env variable PVK_ENCRYPTION_SALT is missing');
    }
    const decipher = crypto_1.default.createDecipheriv(algorithm, pvkEncryptionSalt, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedData, 'hex')), decipher.final()]);
    return decrypted.toString();
};
exports.decryptPrivateKey = decryptPrivateKey;
