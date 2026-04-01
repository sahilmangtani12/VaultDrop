# System Architecture

> [!IMPORTANT]
> The Dabih API follows a modern, layered monolith design using Node.js, Koa, TSOA, and Prisma. It incorporates a separation of concerns, delegating distinct responsibilities to routing, controller logic, data access, and background workers.

## High-Level Architecture

The API sits between client applications (web/mobile) and the persistent storage layer. All client communication is done over HTTP (REST) using JSON. The core responsibilities are managed by the following layers:

### 1. **Client / Transport Layer**
Client requests arrive via HTTP, often carrying JSON Web Tokens (JWT) for authentication. Koa provides the underlying transport layer.

### 2. **Middleware & Routing Layer (Koa & TSOA)**
- **Koa Middleware**: Intercepts requests to parse bodies, serialize responses, and catch application-level errors uniformly ([src/middleware/error.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/middleware/error.ts)).
- **TSOA**: Automatically generated routes inside `build/routes.ts` validate incoming data structures against TypeScript interfaces before passing the request down to the Controllers.

### 3. **Controller / Business Logic Layer**
- The files inside `src/api/` (e.g., `fs/controller.ts`, `auth/controller.ts`) contain pure business logic.
- They dictate how files are uploaded, how identities are verified, and how directories are traversed.
- They receive strongly-typed data payloads from TSOA and interact with internal service modules.

### 4. **Service & Utility Modules (`src/lib`)**
- Modular services providing specific technical implementations:
  - **Crypto**: Handles specialized hashing and payload encryption.
  - **Filesystem (`fs`)**: Pluggable storage backend interface ([src/lib/fs/index.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/lib/fs/index.ts)).
  - **Redis**: For caching and pub/sub.
  - **Email (`resend`)**: Asynchronous email delivery.

### 5. **Data Access Layer (Prisma)**
- Prisma handles all queries to the PostgreSQL database.
- Database relations between `User`, `Inode`, `FileData`, and `PublicKey` are modeled here.

### 6. **Background Processing Layer (Piscina)**
- A background worker pool powered by Piscina ([src/worker/index.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/worker/index.ts)) offloads heavy IO/CPU operations like deep recursive folder searches without blocking the main event loop.

---

## Architecture Diagram (Flow Overview)

Below is an ASCII representation of the complete architecture flow:

```text
       +-------------------+
       |   Client App      |   (Vue/React Frontend, CLI)
       +-------------------+
                 |
                 | HTTP / REST (JWT Auth)
                 v
   +---------------------------+
   |        Koa Server         |   (Entry: src/app.ts)
   |  +---------------------+  |
   |  |     Middleware      |  |   (Error Handler, Serializer)
   |  +---------------------+  |
   +-------------|-------------+
                 v
   +---------------------------+
   |      TSOA Router          |   (Generated routes.ts)
   |  (Payload Validation)     |
   +-------------|-------------+
                 v
   +---------------------------+
   |       Controllers         |   (src/api/*/*.ts)
   |   [Auth, FS, Upload...]   |
   +-------------|-------------+
                 |
        +--------+--------+------------------+
        |                 |                  |
        v                 v                  v
+--------------+  +---------------+  +----------------+
| Service / Lib|  | Worker Pool   |  | Email Service  |
|  (src/lib/)  |  | (src/worker/) |  |  (Resend)      |
+------|-------+  +---------------+  +----------------+
       |                  |
       |                  v
       |          +---------------+
       |--------> |   Redis Cache |  (Pub/Sub, Search results)
       |          +---------------+
       v
+--------------+
| Prisma ORM   |  (Database client)
+------|-------+
       |
       v
+--------------+
| PostgreSQL   |  (Metadata, Keys, Inodes, File definitions)
+--------------+

+--------------------------------+
|       Storage Backend          |
|  (Local FS Storage of Chunks)  |
+--------------------------------+
```

## System Communication

### Data Flow Breakdown
1. **HTTP Inbound**: A client POSTs data to `/api/v1/fs/upload`.
2. **Koa Parsing**: The request body is parsed by `@koa/bodyparser`.
3. **TSOA Validation**: TSOA validates the structural integrity of the request against the expected Controller interfaces.
4. **Execution**: The Controller calls `db.prisma` to check permissions and allocates a database entry.
5. **Storage**: The actual encrypted file chunks are streamed to the Storage Backend via `src/lib/fs/`.
6. **Background**: If a background task like deep searching is requested, the controller dispatches the workload to the Piscina Worker Pool.
7. **Response**: Koa serializes the successful payload and responds to the client.

### Error Handling Flow
Errors are thrown natively inside Controllers (e.g., throwing a standard `Error` or a specific TSOA validation error). The Koa error middleware ([src/middleware/error.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/middleware/error.ts)) catches these unconditionally, strips sensitive stack traces (unless in dev), and normalizes the payload to a consistent `{"message": "...", "code": 500}` structure for the client.
