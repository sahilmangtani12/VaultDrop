import {
  createCipheriv,
  createDecipheriv,
  createHash,
  scryptSync,
} from 'crypto';

import base64url from './base64url';
import random from './random';
import { createCustomCipheriv, createCustomDecipheriv } from './custom/aes';

export const USE_NATIVE_CRYPTO = false; // Change to true to switch to Node.js native crypto

const derive = (secret: string, salt: string) => {
  const keyBytes = 32;
  const key = scryptSync(secret, salt, keyBytes);
  return base64url.fromUint8(key);
};

const generate = async () => {
  const bytes = await random.getBytes(32);
  return base64url.fromUint8(bytes);
};

const generateIv = async () => {
  const bytes = await random.getBytes(16);
  return base64url.fromUint8(bytes);
};

const encrypt = (key: string, iv: string): any => {
  const rawKey = base64url.toUint8(key);
  const rawIv = base64url.toUint8(iv);
  if (USE_NATIVE_CRYPTO) {
    const algorithm = 'aes-256-cbc';
    return createCipheriv(algorithm, rawKey, rawIv);
  }
  return createCustomCipheriv(rawKey, rawIv);
};

const decrypt = (key: string, iv: string): any => {
  const rawKey = base64url.toUint8(key);
  const rawIv = base64url.toUint8(iv);
  if (USE_NATIVE_CRYPTO) {
    const algorithm = 'aes-256-cbc';
    return createDecipheriv(algorithm, rawKey, rawIv);
  }
  return createCustomDecipheriv(rawKey, rawIv);
};

const encryptString = (key: string, iv: string, data: string) => {
  const cipher = encrypt(key, iv);
  const p1 = cipher.update(Buffer.from(data, 'utf8'));
  const p2 = cipher.final();
  return Buffer.concat([p1, p2]).toString('base64url');
};

const encryptSecret = (key: string, iv: string, data: string) => {
  const cipher = encrypt(key, iv);
  const p1 = cipher.update(Buffer.from(data, 'base64url'));
  const p2 = cipher.final();
  return Buffer.concat([p1, p2]).toString('base64url');
};

const decryptSecret = (key: string, iv: string, data: string) => {
  const decipher = decrypt(key, iv);
  const p1 = decipher.update(Buffer.from(data, 'base64url'));
  const p2 = decipher.final();
  return Buffer.concat([p1, p2]).toString('base64url');
};

const decryptString = (key: string, iv: string, data: string) => {
  const decipher = decrypt(key, iv);
  const p1 = decipher.update(Buffer.from(data, 'base64url'));
  const p2 = decipher.final();
  return Buffer.concat([p1, p2]).toString('utf8');
};

const toHash = (key: string) => {
  const hasher = createHash('sha256');
  const buffer = base64url.toUint8(key);
  hasher.update(buffer);
  return hasher.digest('base64url');
};

const aesKey = {
  derive,
  generate,
  generateIv,
  encrypt,
  decrypt,
  encryptString,
  decryptString,
  encryptSecret,
  decryptSecret,
  toHash,
};

export default aesKey;
