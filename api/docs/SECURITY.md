# Security & Authentication Concepts

> [!CAUTION]
> The Dabih API handles End-to-End Encrypted files. If the cryptographic models outlined below are breached, or if access control checking is bypassed in a controller, all guarantees of privacy fail.

---

## 1. Zero-Trust Architecture (Client-Side Encryption)

Dabih relies on a "Zero-Trust Data" paradigm. The server itself is functionally "blind" to the payload and filename contents of any file.

- **Chunk Hashing**: All chunk cryptographic boundaries, `iv`s, and `hash` digests are provided entirely by the Client. 
- **Verifiable Integrity**: While the server cannot decrypt the chunks passing through [src/api/upload](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/api/upload/), it *does* execute an inline CRC scan and matching hash verification before committing the chunk to the disk. Overwritten chunks throwing hash mismatch errors result in a `422` error, preventing data corruption by bad actors intercepting the `PUT` stream.

---

## 2. Stateless Authentication (JWT)

> [!NOTE]
> Sessions in Dabih are stateless.

Once a User successfully binds via OpenID or the fallback `Email/SignIn` methods inside `src/api/auth`, a securely signed JSON Web Token (JWT) is minted containing the user's database `sub` claim. 

- **Key Verification**: All requests to secure routes automatically trigger TSOA's `@Security('jwt')` middleware. The underlying implementation extracts the `Bearer` token from the `Authorization` header and uses the unified `process.env.JWT_SECRET` wrapper to verify signature validity.
- **Refresh Flow**: To mitigate the theft of long-lived access tokens, standard access JWTs expire rapidly. The client must hit the refresh endpoint periodically with their long-lived `refreshToken`.

---

## 3. Asymmetric Sharing (Public Key Cryptography)

Because the API never holds a shared secret or a plaintext encryption key for files, Alice must encrypt files specifically for Bob.

1. Any new user creating an account must upload their **Public Key** to the [PublicKey Table](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/prisma/schema.prisma#L24-L35).
2. Alice queries the API for Bob's Identity (`src/api/user`).
3. The API returns Bob's verified Public Key.
4. Alice uses Bob's key locally in her browser to encrypt the underlying symmetric File Encryption Key, bundling it as a `keyHash`.
5. She submits an `accessList` to the `Inode`/`fileData`.

---

## 4. Authorization & Recursive Access Control

Every `Inode` (folder/file) can be shared arbitrarily via the [Member](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/prisma/schema.prisma#L82-L92) table. 

**Inheritance Rules**:
- If Alice is granted `Permission Level 2` (Write Access) to an Inode, she inherits identical permissions down all children Inodes inside it indefinitely.
- TSOA Controllers validate this recursively. For instance, any call to `/api/v1/fs/tree` must calculate the lowest common `parentId` where the requesting `sub` exists in the `Member` list before divulging the database row structure.

---

## 5. Defense in Depth (Environment Integrity)

- **Input Serialization**: `Prisma` ensures explicit sanitization against Node/PostgreSQL injection vectors naturally.
- **OpenAPI Typings**: TSOA controllers automatically reject improperly structured JSON bodies. By verifying structure dynamically before hitting the controller (`app.ts` -> `routes.ts`), TSOA ensures buffer over-read bugs or `undefined` payload injections do not trigger logic faults.
- **Local Error Squashing**: Driven by [src/middleware/error.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/middleware/error.ts), all explicit logic stack traces in the server are silenced in Production mode before entering the Koa network response. This prevents directory-structure bleeding via Error messages.
