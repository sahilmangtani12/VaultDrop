# Data Flow & Lifecycle Management

> [!NOTE]
> Understanding the Data Flow in Dabih fundamentally requires understanding that **all file data is encrypted client-side**. The server never sees raw plaintext files, it only orchestrates metadata (`Inodes`) and opaque, encrypted byte streams (`Chunks`).

---

## 🚀 The File Upload Lifecycle

When a user drags and drops a file into the client interface, a massive cryptographic and structural pipeline activates.

### Phase 1: Client Pre-Computation
1. The **Client App** chunks the file identically (e.g., 5MB blocks).
2. The Client encrypts each block using symmetric cryptography (e.g., AES-GCM) with a unique `iv` (Initialization Vector) per block.
3. The Client computes an overall `hash` for the plaintext file, as well as a `hash` for each individual encrypted block.

### Phase 2: Metadata Handshake (API Boundary)
1. The Client securely HTTP `POST`s to `src/api/upload` containing essentially a manifest:
   - "I am uploading a file named `salary.pdf`, it is `10MB`, and the root key hash is `X`."
2. The API parses this via TSOA controllers.
3. **Database Insertion**: The API creates a fresh [FileData](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/prisma/schema.prisma#L37-L50) row in Prisma, assigning it a `uid`.
4. The API links this `FileData` to a new [Inode](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/prisma/schema.prisma#L65-L80) representing its location in the virtual folder tree. 

### Phase 3: The Chunk Stream (Storage Layer)
1. The Client now aggressively loops, `PUT`ing every single encrypted chunk byte stream to the API (`/api/v1/upload/{uid}/chunk`).
2. **Koa Busboy / Multer**: The API intercepts the binary stream.
3. **Piping to Disk**: The stream bypasses Memory (to prevent Node.js OOM crashes) and is piped directly to `src/lib/fs/` using `fs.store()`. It gets written to an actual server disk/S3 bucket under the folder of the `FileData.uid`.
4. **Validation Checkpoint**: Upon a chunk finishing, the API records the `Chunk` in Prisma, storing the `hash`, `iv`, `start`, and `end` byte offsets matching the database row to the file path.
5. Once all chunks are logged, the API flags the `FileData` as complete and ready for retrieval.

---

## 📥 The File Download Lifecycle

1. **Authorization**: `GET /api/v1/download/{uid}`
   - The TSOA Controller queries Prisma. It recursively checks the `Members` table up the `Inode` tree to verify: "Does user 5 have Read permission to this UID?"
   - If missing, throws `403 Forbidden`.
2. **Manifest Dispatch**: If verified, the server fetches all `Chunks` attached to the `FileData`.
3. **Orchestrating the Stream**:
   - The server calls `fs.get(uid, chunk.hash)` to open a `Readable` pipe off the hard drive.
   - It streams the exact encrypted bin block back to the Client.
4. **Client Decryption**: The client takes the stream, looks up the corresponding `iv` (provided by the manifest metadata), and un-encrypts the AES wrapper to emit a valid `.pdf` to the local OS.

---

## 🔄 Search Data Flow (Piscina Background Pool)

Because folders (Inodes) can contain hundreds of thousands of files across thousands of shared groups, searching `Inodes` via SQL quickly becomes highly inefficient or causes severe Postgres deadlocks.

1. User requests a search via `/api/v1/fs/search`.
2. Controller intercepts and calls the **Worker Pool** ([src/worker/index.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/worker/index.ts)).
3. `Piscina` delegates the heavy recursive JS loop to a separate OS thread (`search.ts`).
4. The child thread scans memory trees, caching hits, pushing partial results into **Redis Pub/Sub**.
5. The original Koa HTTP connection stays alive as a stream, or responds with a `jobId`.
6. TSOA handles `/target_jobs` by mapping standard Server-Sent Events (SSE) reading cleanly from Redis until the Piscina thread yells "DONE".
