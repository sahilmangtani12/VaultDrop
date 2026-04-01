# The Role of Redis in VaultDrop Architecture

In a zero-knowledge system like VaultDrop, memory management is as critical as encryption. This document details why **Redis** is the cornerstone of the "Blind Vault" security model.

## 1. Volatile Storage vs. Persistence

Most modern applications store data in a persistent database (PostgreSQL). However, for sensitive cryptographic operations, persistence is actually a **liability**.

If an AES key (used for encrypting files) is written to a hard drive (PostgreSQL), it leaves a trace. Even if shifted or "deleted," digital forensics could potentially recover it.

**Redis solves this by being In-Memory Only.**

### The Logic
1. **Transient Memory**: Redis stores data in RAM. When a key is deleted, it is effectively purged from active memory.
2. **Speed**: During chunked file uploads, the server must retrieve the AES key for every single chunk (typically every 1MB-5MB). Redis provides sub-millisecond response times, ensuring high-speed secure streaming.

## 2. The Secure Upload Pipeline (AES Lifecycle)

Redis is primarily used to store **AES-256 session keys** during the file upload process.

### Step-by-Step Flow:
1. **Initialization**: When a user starts an upload, the server generates a unique AES-256 key.
2. **The Handshake**: This key is encrypted with the user's **RSA Public Key** and sent back to the user.
3. **The Vault**: Simultaneously, the raw AES key is stored in Redis with a short TTL (Time To Live).
4. **Streaming**: As the user streams encrypted chunks, the server fetches the AES key from Redis, verifies the chunk integrity (GCM tag), and writes the ciphertext to the final storage.
5. **The Final Wipe**: Once the last chunk is received and the upload is "finished," the server calls `DEL` on the Redis key.

> [!IMPORTANT]
> **The Result**: The server has now lost the "formula" (AES Key) to read the file it just saved. It is now a **Blind Vault**.

## 3. High-Performance Rate Limiting

VaultDrop uses Redis to protect against brute-force attacks on the authentication endpoints.
- **Token Buckets**: Redis tracks the number of requests per IP/Email using atomic increments (`INCR`).
- **Distributed Locks**: To prevent race conditions during heavy file processing, Redis ensures only one worker handles a specific file cleanup task at a time.

## 4. App Secrets & AppInfo

Application-wide secrets (like the JWT signing salt) are stored in Redis during startup. This ensures that even if a server process is compromised, the secrets are not hardcoded in the filesystem or environment variables that are easily accessible to other processes.

## Summary

| Feature | Redis Command | Impact on Security |
| :--- | :--- | :--- |
| AES Key Storage | `SETEX` (with TTL) | Ensures keys are never written to disk and self-destruct if an upload is abandoned. |
| Secure Wipe | `DEL` | Permanently removes the "formula" for file decryption. |
| Rate Limiting | `INCR` + `EXPIRE` | Protects the system from automated attacks. |
| App Secrets | `GET` | Centralized, secure storage for runtime secrets. |

---

VaultDrop's use of Redis ensures that **Volatile Data remains Volatile**, guaranteeing that your "Blind Vault" stays blind after the doors are closed.
