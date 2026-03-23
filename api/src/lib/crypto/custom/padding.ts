import { createHash, randomBytes } from 'crypto';

function mgf1(mgfSeed: Buffer, maskLen: number, hashAlgorithm: string = 'sha256'): Buffer {
  const hLen = createHash(hashAlgorithm).digest().length;
  let t = Buffer.alloc(0);
  for (let counter = 0; counter <= Math.ceil(maskLen / hLen) - 1; counter++) {
    const c = Buffer.alloc(4);
    c.writeUInt32BE(counter, 0);
    const hash = createHash(hashAlgorithm);
    hash.update(mgfSeed);
    hash.update(c);
    t = Buffer.concat([t, hash.digest()]);
  }
  return t.subarray(0, maskLen);
}

// k = byte length of RSA modulus
export function oaepEncode(m: Buffer, k: number, hashAlgo: string = 'sha256'): Buffer {
  const hLen = createHash(hashAlgo).digest().length;
  if (m.length > k - 2 * hLen - 2) {
    throw new Error('Message too long for RSA-OAEP encoding');
  }

  // L is typically empty in standard OAEP
  const lHash = createHash(hashAlgo).update(Buffer.alloc(0)).digest();
  
  const ps = Buffer.alloc(k - m.length - 2 * hLen - 2, 0x00);
  const db = Buffer.concat([lHash, ps, Buffer.from([0x01]), m]);

  const seed = randomBytes(hLen);
  const dbMask = mgf1(seed, k - hLen - 1, hashAlgo);
  
  const maskedDB = Buffer.alloc(k - hLen - 1);
  for (let i = 0; i < db.length; i++) {
    maskedDB[i] = db[i] ^ dbMask[i];
  }

  const seedMask = mgf1(maskedDB, hLen, hashAlgo);
  const maskedSeed = Buffer.alloc(hLen);
  for (let i = 0; i < seed.length; i++) {
    maskedSeed[i] = seed[i] ^ seedMask[i];
  }

  return Buffer.concat([Buffer.from([0x00]), maskedSeed, maskedDB]);
}

export function oaepDecode(c: Buffer, k: number, hashAlgo: string = 'sha256'): Buffer {
  if (c.length !== k) {
    if (c.length < k && c[0] !== 0x00) {
      // Sometimes the leading 0x00 is dropped by bigint conversions, so pad it back
      const padded = Buffer.alloc(k);
      c.copy(padded, k - c.length);
      c = padded;
    } else {
       throw new Error(`OAEP Decode: Cipher text length (${c.length}) doesn't match modulus length (${k})`);
    }
  }

  const hLen = createHash(hashAlgo).digest().length;
  
  const maskedSeed = c.subarray(1, 1 + hLen);
  const maskedDB = c.subarray(1 + hLen);

  const seedMask = mgf1(maskedDB, hLen, hashAlgo);
  const seed = Buffer.alloc(hLen);
  for (let i = 0; i < hLen; i++) {
    seed[i] = maskedSeed[i] ^ seedMask[i];
  }

  const dbMask = mgf1(seed, k - hLen - 1, hashAlgo);
  const db = Buffer.alloc(k - hLen - 1);
  for (let i = 0; i < maskedDB.length; i++) {
    db[i] = maskedDB[i] ^ dbMask[i];
  }

  const lHash = createHash(hashAlgo).update(Buffer.alloc(0)).digest();
  const dbLHash = db.subarray(0, hLen);
  if (!dbLHash.equals(lHash)) {
    throw new Error('OAEP Decode error: Hash mismatch');
  }

  let separatorIndex = -1;
  for (let i = hLen; i < db.length; i++) {
    if (db[i] === 0x01) {
      separatorIndex = i;
      break;
    } else if (db[i] !== 0x00) {
      throw new Error('OAEP Decode error: Padding string invalid');
    }
  }

  if (separatorIndex === -1) {
    throw new Error('OAEP Decode error: No separator found');
  }

  return db.subarray(separatorIndex + 1);
}
