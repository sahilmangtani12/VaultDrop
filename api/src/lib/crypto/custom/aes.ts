import { Transform, TransformCallback } from 'stream';
import { AESCore } from './aes-core';

export class AESCBC {
  private core: AESCore;
  private iv: Uint8Array;
  
  constructor(key: Uint8Array, iv: Uint8Array) {
    this.core = new AESCore(key);
    this.iv = new Uint8Array(iv);
  }

  public encrypt(data: Uint8Array): Uint8Array {
    // PKCS7 Padding
    const paddingLength = 16 - (data.length % 16);
    const paddedData = new Uint8Array(data.length + paddingLength);
    paddedData.set(data);
    for (let i = data.length; i < paddedData.length; i++) {
        paddedData[i] = paddingLength;
    }

    const out = new Uint8Array(paddedData.length);
    let previousBlock = this.iv;

    for (let offset = 0; offset < paddedData.length; offset += 16) {
      const block = paddedData.slice(offset, offset + 16);
      for (let i = 0; i < 16; i++) {
        block[i] ^= previousBlock[i];
      }
      this.core.encryptBlock(block, out, 0, offset);
      previousBlock = out.slice(offset, offset + 16);
    }
    
    return out;
  }

  public decrypt(data: Uint8Array): Uint8Array {
    if (data.length % 16 !== 0) throw new Error("Invalid data length for decryption");
    const out = new Uint8Array(data.length);
    let previousBlock = this.iv;

    for (let offset = 0; offset < data.length; offset += 16) {
      this.core.decryptBlock(data, out, offset, offset);
      for (let i = 0; i < 16; i++) {
        out[offset + i] ^= previousBlock[i];
      }
      previousBlock = data.slice(offset, offset + 16);
    }

    // Remove PKCS7 Padding
    const padLength = out[out.length - 1];
    if (padLength < 1 || padLength > 16) {
      // Invalid padding is usually a fail, we tolerate and hope for best or throw error
      throw new Error("Invalid PKCS#7 padding string");
    }
    for (let i = 0; i < padLength; i++) {
        if (out[out.length - 1 - i] !== padLength) {
             throw new Error("Invalid PKCS#7 padding value");
        }
    }
    
    return out.slice(0, out.length - padLength);
  }
}

export class AESCipherTransform extends Transform {
  private core: AESCore;
  private iv: Uint8Array;
  private buffer: Uint8Array;

  constructor(key: Uint8Array, iv: Uint8Array) {
    super();
    this.core = new AESCore(key);
    this.iv = new Uint8Array(iv);
    this.buffer = new Uint8Array(0);
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback) {
    const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding as BufferEncoding);
    
    const combined = new Uint8Array(this.buffer.length + data.length);
    combined.set(this.buffer);
    combined.set(data, this.buffer.length);
    
    const processLength = combined.length - (combined.length % 16);
    if (processLength > 0) {
      const toProcess = combined.slice(0, processLength);
      const out = new Uint8Array(processLength);
      for (let offset = 0; offset < processLength; offset += 16) {
        const block = toProcess.slice(offset, offset + 16);
        for (let i = 0; i < 16; i++) {
          block[i] ^= this.iv[i];
        }
        this.core.encryptBlock(block, out, 0, offset);
        this.iv = out.slice(offset, offset + 16);
      }
      this.push(Buffer.from(out));
    }
    this.buffer = combined.slice(processLength);
    callback();
  }

  _flush(callback: TransformCallback) {
    const paddingLength = 16 - (this.buffer.length % 16);
    const paddedData = new Uint8Array(this.buffer.length + paddingLength);
    paddedData.set(this.buffer);
    for (let i = this.buffer.length; i < paddedData.length; i++) {
      paddedData[i] = paddingLength;
    }

    const out = new Uint8Array(paddedData.length);
    for (let offset = 0; offset < paddedData.length; offset += 16) {
      const block = paddedData.slice(offset, offset + 16);
      for (let i = 0; i < 16; i++) {
        block[i] ^= this.iv[i];
      }
      this.core.encryptBlock(block, out, 0, offset);
      this.iv = out.slice(offset, offset + 16);
    }
    
    this.push(Buffer.from(out));
    callback();
  }

  update(data: string | Buffer, inputEnc?: BufferEncoding, outputEnc?: BufferEncoding): any {
    const buf = typeof data === 'string' ? Buffer.from(data, inputEnc || 'utf8') : data;
    this.write(buf);
    const result = this.read();
    if (!result) return outputEnc ? '' : Buffer.alloc(0);
    return outputEnc ? result.toString(outputEnc) : result;
  }

  final(outputEnc?: BufferEncoding): any {
    this.end();
    const result = this.read();
    if (!result) return outputEnc ? '' : Buffer.alloc(0);
    return outputEnc ? result.toString(outputEnc) : result;
  }
}


export class AESDecipherTransform extends Transform {
  private core: AESCore;
  private iv: Uint8Array;
  private buffer: Uint8Array;

  constructor(key: Uint8Array, iv: Uint8Array) {
    super();
    this.core = new AESCore(key);
    this.iv = new Uint8Array(iv);
    this.buffer = new Uint8Array(0);
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback) {
    let data;
    if (Buffer.isBuffer(chunk)) data = chunk;
    else if (typeof chunk === 'string') data = Buffer.from(chunk, encoding === 'buffer' ? 'utf8' : encoding as BufferEncoding);
    else data = Buffer.from(chunk);

    const combined = new Uint8Array(this.buffer.length + data.length);
    combined.set(this.buffer);
    combined.set(data, this.buffer.length);
    
    // We must always KEEP at least one byte in buffer to handle PKCS7 padding in _flush.
    // Actually, keep 16 bytes so we can unpad at the end.
    let processLength = combined.length - (combined.length % 16);
    if (combined.length > 0 && combined.length === processLength) {
       // Keep the last block for flush
       processLength -= 16;
    }

    if (processLength > 0) {
      const toProcess = combined.slice(0, processLength);
      const out = new Uint8Array(processLength);
      for (let offset = 0; offset < processLength; offset += 16) {
        this.core.decryptBlock(toProcess, out, offset, offset);
        for (let i = 0; i < 16; i++) {
          out[offset + i] ^= this.iv[i];
        }
        this.iv = toProcess.slice(offset, offset + 16);
      }
      this.push(Buffer.from(out));
    }
    this.buffer = combined.slice(processLength);
    callback();
  }

  _flush(callback: TransformCallback) {
    if (this.buffer.length === 0) {
        return callback(); // Technically invalid, but handle silently or fail
    }
    if (this.buffer.length % 16 !== 0) {
        return callback(new Error("Decryption failed: Final block not a multiple of block size."));
    }

    const out = new Uint8Array(this.buffer.length);
    for (let offset = 0; offset < this.buffer.length; offset += 16) {
        this.core.decryptBlock(this.buffer, out, offset, offset);
        for (let i = 0; i < 16; i++) {
        out[offset + i] ^= this.iv[i];
        }
        this.iv = this.buffer.slice(offset, offset + 16);
    }
    
    // Unpad
    const padLength = out[out.length - 1];
    if (padLength < 1 || padLength > 16) {
         return callback(new Error("Decryption padding error"));
    }
    
    for (let i = 0; i < padLength; i++) {
      if (out[out.length - 1 - i] !== padLength) {
         return callback(new Error("Decryption padding error structure"));
      }
    }

    this.push(Buffer.from(out.slice(0, out.length - padLength)));
    callback();
  }

  update(data: string | Buffer, inputEnc?: BufferEncoding, outputEnc?: BufferEncoding): any {
    const buf = typeof data === 'string' ? Buffer.from(data, inputEnc || 'utf8') : data;
    this.write(buf);
    const result = this.read();
    if (!result) return outputEnc ? '' : Buffer.alloc(0);
    return outputEnc ? result.toString(outputEnc) : result;
  }

  final(outputEnc?: BufferEncoding): any {
    this.end();
    const result = this.read();
    if (!result) return outputEnc ? '' : Buffer.alloc(0);
    return outputEnc ? result.toString(outputEnc) : result;
  }
}

export function createCustomCipheriv(key: Uint8Array, iv: Uint8Array) {
    return new AESCipherTransform(key, iv);
}

export function createCustomDecipheriv(key: Uint8Array, iv: Uint8Array) {
    return new AESDecipherTransform(key, iv);
}
