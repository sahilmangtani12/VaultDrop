const b1 = Buffer.alloc(32).toString('base64url');
const b2 = Buffer.alloc(16).toString('base64url');
const comb = b1 + b2;
const dec = Buffer.from(comb, 'base64url');
console.log(dec.length)
