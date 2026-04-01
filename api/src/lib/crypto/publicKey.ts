import {
  createPublicKey,
  publicEncrypt,
  constants,
  createHash,
  KeyObject,
  JsonWebKey,
} from 'node:crypto';
import base64url from './base64url';
import { rawEncrypt, bigIntToBuffer, bufferToBigInt } from './custom/rsa';
import { oaepEncode } from './custom/padding';

export const USE_NATIVE_CRYPTO = false; // Toggle to switch to native crypto

class CustomPublicKeyObject {
  constructor(public rsaParams: any) {}
  export(options: any) {
    if (options.type === 'spki' && options.format === 'der') {
      return Buffer.from(this.rsaParams.n.toString() + this.rsaParams.e.toString());
    }
    if (options.format === 'jwk') {
      return {
        kty: 'RSA',
        alg: 'RSA-OAEP-256',
        n: base64url.fromUint8(bigIntToBuffer(this.rsaParams.n)),
        e: base64url.fromUint8(bigIntToBuffer(this.rsaParams.e)),
      };
    }
    throw new Error('Unsupported export');
  }
}

const fromJwk = (key: JsonWebKey) => {
  return createPublicKey({
    key,
    format: 'jwk',
  });
};

const toJwk = (key: KeyObject) => {
  return key.export({ format: 'jwk' });
};

const fromString = (key: string) => {
  const jwk = JSON.parse(key) as JsonWebKey;
  return fromJwk(jwk);
}

const toString = (key: KeyObject) => {
  const jwk = toJwk(key);
  return JSON.stringify(jwk);
}

const encrypt = (key: KeyObject, base64: string) => {
  const buffer = base64url.toUint8(base64);
  if (USE_NATIVE_CRYPTO) {
    const result = publicEncrypt({
      key,
      oaepHash: 'sha256',
      padding: constants.RSA_PKCS1_OAEP_PADDING,
    }, buffer);
    return base64url.fromUint8(result);
  }
  
  const jwk = key.export({ format: 'jwk' });
  const customKey = new CustomPublicKeyObject({
    n: bufferToBigInt(Buffer.from(base64url.toUint8(jwk.n as string))),
    e: bufferToBigInt(Buffer.from(base64url.toUint8(jwk.e as string))),
  });

  const k = Math.ceil(customKey.rsaParams.n.toString(16).length / 2);
  const em = oaepEncode(Buffer.from(buffer), k);
  const m = bufferToBigInt(em);
  const c = rawEncrypt(m, customKey.rsaParams.e, customKey.rsaParams.n);
  
  const cBuffer = bigIntToBuffer(c, k);
  return base64url.fromUint8(cBuffer);
};

const toHash = (key: KeyObject) => {
  const hasher = createHash('sha256');
  const buffer = key.export({ type: 'spki', format: 'der' }) as Buffer;
  
  hasher.update(buffer);
  return hasher.digest('base64url');
}

const publicKey = {
  fromJwk,
  toJwk,
  toString,
  fromString,
  toHash,
  encrypt,
};
export default publicKey;
