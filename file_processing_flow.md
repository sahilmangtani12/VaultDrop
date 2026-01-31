# Dabih File Processing Flow

This document details the life cycle of a file in the Dabih platform—from user login and key exchange to file upload, backend processing, and finally downloading/viewing the file. It also specifies the cryptographic operations happening throughout the flow.

## 1. Authentication & Key Exchange (Login Flow)

**A. User Login:**
1. User enters their email on the frontend (`SignIn.tsx`).
2. Frontend calls `api.auth.signIn(email)`.
3. Backend ([api/src/api/auth/signIn.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/api/auth/signIn.ts)) creates a JWT token encoding the user's email and a unique `sub` (subject ID), signs it with a server-side HMAC secret, and sends a login link to the user's email (`/verify/<token>`).
4. User clicks the link. The frontend intercepts the token and calls `verifyToken`.
5. Backend ([verifyEmail.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/api/auth/verifyEmail.ts)) verifies the JWT. If it's a new user, it creates a database record (with scopes like `dabih:base` or `dabih:admin`) and provisions a home directory (`getHome`). The backend generates a new session JWT and returns it.
6. The frontend saves the session JWT to `localStorage` (`vaultdrop_token`).

**B. Keypair Generation & Registration:**
1. After login, if the user doesn't have an RSA keypair registered, they are redirected to `/key`.
2. Frontend ([CreateKey.tsx](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/vite/src/pages/key/CreateKey.tsx)) generates an asymmetric **RSA-OAEP** keypair in the browser using the Web Crypto API.
   - **Private Key**: Exported to Base64 and stored securely *only* on the user's device (`localStorage` as `vaultdrop_private_key`).
   - **Public Key**: Exported as JSON Web Key (JWK) and sent to the backend (`api.user.addKey`).
3. Backend stores the user's public key in the database. (Note: Newly added keys may require admin approval before becoming active).

---

## 2. File Upload Flow

Files are processed in chunks to support large files efficiently and securely.

**A. Upload Initialization:**
1. User selects a file to upload.
2. Frontend [transferWorker.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/vite/src/lib/transferWorker.ts) calls `api.upload.start`, sending file metadata (name, size, target directory).
3. Backend ([start.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/api/upload/start.ts)):
   - Retrieves the public keys of the user *and* the system root admins.
   - Generates a unique **AES-GCM 256-bit symmetric key** for this specific file.
   - Hashes the AES key and creates database records (`fileData` and `inode`).
   - Encrypts the raw AES key Multiple times—once using the user's **RSA Public Key** and once using each admin's **RSA Public Key**. These encrypted key blobs are stored in the database (`addKeys`).
   - Temporarily stores the raw AES key in a secure Redis cache to facilitate streaming chunk encryption without re-decrypting the RSA blobs for every chunk.

**B. Chunking and Encryption:**
1. Frontend [transferWorker.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/vite/src/lib/transferWorker.ts) slices the file into chunks (e.g., 2 MiB).
2. For each chunk, frontend calculates its raw SHA-256 hash and sends the raw chunk data to `api.upload.chunk`.
3. Backend ([chunk.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/api/upload/chunk.ts)):
   - Streams the incoming chunk bytes.
   - Validates the byte size and hash.
   - Reads the ephemeral AES key from Redis.
   - Generates a secure random IV (Initialization Vector) for this chunk.
   - Encrypts the stream using **AES-GCM** on the fly.
   - Computes a CRC32 checksum of the encrypted data.
   - Writes the encrypted data to disk (`fs.store`).
   - Saves chunk metadata (start byte, end byte, hash, IV, CRC) in the database.

**C. Finalizing Upload:**
1. Frontend ensures all chunks are successfully uploaded, concatenates all chunk hashes, hashes the result, and calls `api.upload.finish`.
2. Backend ([finish.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/api/upload/finish.ts)) verifies that all chunks are accounted for, contiguous, and match the total file size.
3. The uploaded `inode` status is updated from `UPLOAD` to `FILE`, making it available for viewing.
4. The ephemeral raw AES key is permanently deleted from Redis.

---

## 3. File Downloading & Viewing Flow

When a user wants to view or download a file, the decryption happens *client-side* in the browser.

**A. Initialization & Key Decryption:**
1. User clicks download on a file.
2. Frontend [transferWorker.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/vite/src/lib/transferWorker.ts) fetches the file metadata (`api.fs.file(mnemonic)`). This metadata includes the file's encrypted AES key (which was encrypted with the user's Public Key during upload).
3. Frontend uses the user's **RSA Private Key** (from `localStorage`) to decrypt the file's AES key blob. The client now holds the raw **AES-GCM symmetric key** for the file.

**B. Fetching and Decrypting Chunks:**
1. Frontend requests individual encrypted chunks from the backend (`api.download.chunkBuf`).
2. Backend streams the raw encrypted bytes from disk.
3. Frontend uses the **AES-GCM key** and the chunk's specfic **IV** (retrieved from metadata) to decrypt the chunk locally.
4. Frontend verifies the decrypted chunk's hash matches the original chunk hash saved during upload.
5. The decrypted chunk is stitched back together using the Origin Private File System (OPFS).

**C. Packaging (Optional) & Delivery:**
1. If the user downloaded a single file, the browser yields the fully decrypted file from OPFS directly to the user.
2. If multiple files/directories were downloaded, the frontend zips them together in the browser using `JSZip` and outputs an `archive.zip` file.
3. OPFS temporary data is cleaned up securely.

---

## Summary of Keys

1. **JWT Secret (HMAC):** Used by backend to sign authentication logic and session tokens.
2. **User's RSA Keypair:** Generated in browser. Private key stays on device, Public Key stored on server. Used for encrypting/decrypting the file's symmetric AES keys.
3. **File's AES-GCM Key:** Generated on backend per-file during upload. Temporarily stored in Redis for streaming encryption, then thrown away. Persisted only as RSA-encrypted blobs. Used for encrypting the actual file chunks.
4. **Chunk IV:** Randomly generated per-chunk on backend during upload. Stored in plaintext in database. Required alongside the AES key to decrypt chunks.
