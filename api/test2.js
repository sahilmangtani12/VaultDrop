const b1 = Buffer.alloc(32, 1);
const b2 = Buffer.alloc(16, 2);
const s1 = b1.toString('base64url');
const s2 = b2.toString('base64url');
const combStr = s1 + s2;
const dec = Buffer.from(combStr, 'base64url');
const bufComb = Buffer.concat([b1, b2]);
console.log(dec.equals(bufComb));
