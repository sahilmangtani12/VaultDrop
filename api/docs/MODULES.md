# System Modules

The Dabih API codebase is intuitively organized by operational domains. Inside the [src/api](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/api) directory, each folder represents an isolated feature module.

## 1. Auth Module (`src/api/auth`)
**Purpose**: Manages user sign-in, session refresh, identity verification (via Email/Resend), and OpenID callback integration.
- **Components**:
  - `controller.ts`: Defines the TSOA HTTP boundaries.
  - `login.ts / signIn.ts`: Core email/password and identity validation logic.
  - `callback.ts`: Handles secure callbacks from the external OpenID provider.
  - `verifyEmail.ts`: Verifies one-time email tokens.
- **Interactions**: Interacts heavily with `src/lib/openid`, Resend for Outbound Magic links, and Prisma (checking `User` records). Generates long-lived JWTs.

## 2. FileSystem Module (`src/api/fs`)
**Purpose**: The central organizing logic. Simulates a hierarchical filesystem using `Inodes`.
- **Components**:
  - `addDirectory.ts` & `directory.ts`: Logic to spawn and retrieve new folder models (`type: 1`).
  - `file.ts`: Logic to handle virtual files (`type: 2`).
  - `duplicate.ts`, `move.ts`, `remove.ts`: CRUD operations on the virtual filesystem tree.
  - `tree.ts`, `list.ts`: Fetches structures and arrays of `Inodes` for client UI mapping.
  - `setAccess.ts` & `addMembers.ts`: Security operations assigning which `User` (and corresponding key) gets permission over which branch of `Inodes`.
- **Interactions**: This is the heaviest module. It acts purely on `Prisma` to update `Inode` layouts, and triggers Redis calls when an expensive background `tree` structure lookup must be queued.

## 3. Upload & Download Modules (`src/api/upload`, `src/api/download`)
**Purpose**: Manages the ingestion and exfiltration of raw encrypted Chunks.
- `src/api/upload/`:
  - Determines file limits and chunk sequencing.
  - Generates new entries in the `FileData` and `Chunk` tables indicating start/end offsets.
  - Pipes data securely into `src/lib/fs/` (the local storage layer).
- `src/api/download/`:
  - Retrieves file chunks.
  - Assures permissions are verified before streaming.
  - Provides the `iv` and `hash` of chunks so the frontend can independently decrypt and verify.

## 4. User Module (`src/api/user`)
**Purpose**: Client identity resolution. Let systems fetch the public key configuration of other people.
- **Components**:
  - `/me`: Resolves the calling user's current JWT into an active database user, bringing along their associated Public Keys.
  - `/keys`: A critical endpoint where Alice requests Bob's Public Key, so Alice can proactively encrypt an access token using Bob's identity before saving an `Inode` link.

## 5. FileData Module (`src/api/filedata`)
**Purpose**: Manages explicit FileData elements (the actual metadata wrappers around chunks, isolated from their position in the `Inode` filesystem hierarchy).
- Allows system administrators or garbage collection routines to un-correlate FileData from an Inode, track orphaned files, or check checksum validation.

## 6. Token Module (`src/api/token`)
**Purpose**: Application-specific or limited-scope token generation.
- Handles scoped permission grants representing "Share Links" where a token can grant static readonly access to a specific `Inode`.

## 7. Job Module (`src/api/job`)
**Purpose**: Exposes endpoints for tracking asynchronous background jobs (e.g., deep search, zip file generation, heavy recursive queries).
- **Interactions**: Tightly integrated with Redis (`src/lib/redis`) to query the real-time status and completion state of an arbitrary `jobId`. Outputs stream back incrementally to the client.

## Core Utility Module (`src/lib/`)
Strictly isolated from TSOA mapping:
- [src/lib/crypto](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/lib/crypto): Low-level helpers for hashing and padding validation.
- [src/lib/fs](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/lib/fs): The actual chunk bitstream writer on top of `fs:node`.
- [src/lib/database](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/lib/database): Precompiled, hardened Prisma accessor singletons.
