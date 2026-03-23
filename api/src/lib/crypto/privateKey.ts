import {
  KeyObject,
  generateKeyPair,
  createPublicKey,
  privateDecrypt,
  constants,
  createHash,
} from 'node:crypto';

import { promisify } from 'util';
import base64url from './base64url';
import { generateRSAKeys, rawDecrypt, bigIntToBuffer, bufferToBigInt } from './custom/rsa';
import { oaepDecode } from './custom/padding';

export const USE_NATIVE_CRYPTO = false; // Toggle to switch to native crypto

class CustomPrivateKeyObject {
  constructor(public rsaParams: any) {}
  export(options: any) {
    if (options.format === 'jwk') {
      return {
        kty: 'RSA',
        alg: 'RSA-OAEP-256',
        n: base64url.fromUint8(bigIntToBuffer(this.rsaParams.n)),
        e: base64url.fromUint8(bigIntToBuffer(this.rsaParams.e)),
        d: base64url.fromUint8(bigIntToBuffer(this.rsaParams.d)),
        p: base64url.fromUint8(bigIntToBuffer(this.rsaParams.p)),
        q: base64url.fromUint8(bigIntToBuffer(this.rsaParams.q)),
        dp: base64url.fromUint8(bigIntToBuffer(this.rsaParams.dp)),
        dq: base64url.fromUint8(bigIntToBuffer(this.rsaParams.dq)),
        qi: base64url.fromUint8(bigIntToBuffer(this.rsaParams.qi)),
      };
    }
    throw new Error('Unsupported format');
  }
}

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
    throw new Error('Unsupported format');
  }
}

const generatePair = async () => {
  if (USE_NATIVE_CRYPTO) {
    const generateFn = promisify(generateKeyPair);
    const { publicKey, privateKey } = await generateFn('rsa', {
      modulusLength: 4096,
      publicExponent: 0x10001,
    });
    return {
      publicKey,
      privateKey,
    };
  }
  const keys = generateRSAKeys(1024); // smaller key size for custom to avoid event loop block
  return {
    publicKey: new CustomPublicKeyObject(keys) as unknown as KeyObject,
    privateKey: new CustomPrivateKeyObject(keys) as unknown as KeyObject,
  };
};

const generate = async () => {
  const { privateKey } = await generatePair();
  return privateKey;
};

const toJwk = (key: KeyObject) => {
  return key.export({ format: 'jwk' });
};

const toPublicKey = (key: KeyObject) => {
  const { n, alg, e, kty } = toJwk(key) as any;
  if (USE_NATIVE_CRYPTO) {
    return createPublicKey({
      key: { n, alg, e, kty },
      format: 'jwk',
    });
  }
  return new CustomPublicKeyObject({
    n: bufferToBigInt(Buffer.from(base64url.toUint8(n))),
    e: bufferToBigInt(Buffer.from(base64url.toUint8(e))),
  }) as unknown as KeyObject;
};

const toHash = (key: KeyObject) => {
  const publicKey = toPublicKey(key);
  const buffer = publicKey.export({ type: 'spki', format: 'der' }) as Buffer;
  const hasher = createHash('sha256');
  hasher.update(buffer);
  return hasher.digest('base64url');
};

const decrypt = (key: KeyObject, base64: string) => {
  const buffer = base64url.toUint8(base64);
  if (USE_NATIVE_CRYPTO) {
    const result = privateDecrypt(
      {
        key,
        oaepHash: 'sha256',
        padding: constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer,
    );
    return base64url.fromUint8(result);
  }
  
  const customKey = key as unknown as CustomPrivateKeyObject;
  const c = bufferToBigInt(Buffer.from(buffer));
  const mBig = rawDecrypt(c, customKey.rsaParams.d, customKey.rsaParams.n);
  const k = Math.ceil(customKey.rsaParams.n.toString(16).length / 2); // octet length
  const mBuffer = bigIntToBuffer(mBig, k);
  
  const decryptedData = oaepDecode(mBuffer, k);
  return base64url.fromUint8(decryptedData);
};

const privateKey = {
  generatePair,
  generate,
  decrypt,
  toJwk,
  toPublicKey,
  toHash,
};
export default privateKey;
