import { randomBytes } from 'crypto';

export function modExp(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if ((exp & 1n) === 1n) result = (result * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

export function modInverse(a: bigint, m: bigint): bigint {
  let [m0, y, x] = [m, 0n, 1n];

  if (m === 1n) return 0n;

  while (a > 1n) {
    let q = a / m;
    let t = m;

    m = a % m;
    a = t;
    t = y;

    y = x - q * y;
    x = t;
  }

  if (x < 0n) x += m0;

  return x;
}

function getRandomBigInt(bits: number): bigint {
  const bytes = Math.ceil(bits / 8);
  const buf = randomBytes(bytes);
  // ensure the most significant bit is 1 to guarantee length
  buf[0] |= 0x80;
  // assure odd number
  buf[buf.length - 1] |= 0x01;
  let res = 0n;
  for (let i = 0; i < buf.length; i++) {
    res = (res << 8n) | BigInt(buf[i]);
  }
  // Trim excess bits if any
  const shift = BigInt(bytes * 8 - bits);
  return res >> shift;
}

export function millerRabin(n: bigint, k: number = 20): boolean {
  if (n === 2n || n === 3n) return true;
  if (n < 2n || n % 2n === 0n) return false;

  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }

  for (let i = 0; i < k; i++) {
    // We pick a random basis 'a' in [2, n-2]
    // For large bigints, we just generate smaller random numbers < n as basis
    const a = (getRandomBigInt(256) % (n - 3n)) + 2n;
    let x = modExp(a, d, n);

    if (x === 1n || x === n - 1n) continue;

    let composite = true;
    for (let r = 1n; r < s; r++) {
      x = modExp(x, 2n, n);
      if (x === n - 1n) {
        composite = false;
        break;
      }
    }

    if (composite) return false;
  }

  return true;
}

export function generatePrime(bits: number): bigint {
  while (true) {
    const p = getRandomBigInt(bits);
    if (millerRabin(p)) return p;
  }
}

export interface RSAKeyPairFromScratch {
  n: bigint;
  e: bigint;
  d: bigint;
  p: bigint;
  q: bigint;
  dp: bigint;
  dq: bigint;
  qi: bigint;
}

export function generateRSAKeys(bits: number = 2048): RSAKeyPairFromScratch {
  const e = 65537n;
  let p: bigint, q: bigint, n: bigint, phi: bigint, d: bigint;
  
  // Note: key generation from scratch takes time!
  while (true) {
    p = generatePrime(bits / 2);
    if (p % e === 1n) continue;
    break;
  }

  while (true) {
    q = generatePrime(bits / 2);
    if (q === p || q % e === 1n) continue;
    break;
  }

  n = p * q;
  phi = (p - 1n) * (q - 1n);
  d = modInverse(e, phi);

  const dp = d % (p - 1n);
  const dq = d % (q - 1n);
  const qi = modInverse(q, p);

  return { n, e, d, p, q, dp, dq, qi };
}

export function bufferToBigInt(buf: Buffer): bigint {
  let res = 0n;
  for (let i = 0; i < buf.length; i++) {
    res = (res << 8n) | BigInt(buf[i]);
  }
  return res;
}

export function bigIntToBuffer(num: bigint, k?: number): Buffer {
  let hex = num.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  let buf = Buffer.from(hex, 'hex');
  if (k !== undefined && buf.length < k) {
    const pad = Buffer.alloc(k - buf.length, 0);
    buf = Buffer.concat([pad, buf]);
  }
  return buf;
}

export function rawEncrypt(m: bigint, e: bigint, n: bigint): bigint {
  return modExp(m, e, n);
}

export function rawDecrypt(c: bigint, d: bigint, n: bigint): bigint {
  return modExp(c, d, n);
}
