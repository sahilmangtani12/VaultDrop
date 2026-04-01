# Dabih API Server
> [!NOTE]
> This document provides a high-level overview of the Dabih API server, its domain, and its core technology stack.

## Project Overview & Domain
The **Dabih API Server** is the backend application powering an **End-to-End Encrypted (E2EE) File Storage and Sharing System**. 
Its primary domain revolves around securely managing user identities, managing encrypted cryptographic keys, storing file chunks, and providing a hierarchical folder structure (Inodes) similar to Google Drive or Dropbox—but fundamentally secure-by-design, as it relies on client-side encryption. The server only sees encrypted file fragments (Chunks), and handles metadata such as file sizes, ownership, and access controls.

The API exposes a securely authenticated interface over HTTP to enable client applications to:
- Authenticate via OpenID and JSON Web Tokens (JWT).
- Navigate and organize directories (Inodes).
- Upload and download encrypted file chunks.
- Share access securely between users using Public Key cryptography.

---

## Technical Stack Explained

> [!TIP]
> The backend stack is deliberately chosen to maximize performance (Node.js/Koa), type safety (TSOA/Prisma), and seamless database management.

### 1. **[Node.js](https://nodejs.org/) & TypeScript**
- **Purpose**: Server runtime and language.
- **Role in Dabih**: Node.js provides the asynchronous, event-driven runtime necessary for handling high-concurrency file uploads and downloads. TypeScript is used across the codebase to ensure robust type-safety, preventing silent errors related to configuration or variable mismanagement.

### 2. **[Koa.js](https://koajs.com/)**
- **Purpose**: Web framework.
- **Role in Dabih**: Koa serves as the underlying routing and middleware framework. It handles HTTP request piping, routing (via `@koa/router`), body parsing, static file serving, and global error handling/serialization. It's explicitly designed to be tiny and expressive, exposing the `ctx` context object which Dabih extends (e.g., adding `ctx.error` for standardizing error outputs). References: [src/app.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/app.ts)

### 3. **[Prisma](https://www.prisma.io/)**
- **Purpose**: Next-generation Object-Relational Mapper (ORM).
- **Role in Dabih**: Prisma is the primary bridge to the PostgreSQL database. It provides an intuitive schema definition ([prisma/schema.prisma](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/prisma/schema.prisma)) and generates a fully type-safe database client. It fulfills the role of modeling the complex relations between Users, PublicKeys, Inodes (which relate to themselves recursively via `parentId`), FileData, and Chunks.

### 4. **[TSOA](https://tsoa-community.github.io/docs/)**
- **Purpose**: OpenAPI generation and Controller routing.
- **Role in Dabih**: TSOA is used to build the primary API controllers inside `src/api/`. By simply writing standard TypeScript classes and decorating them with `@Get`, `@Post`, and `@Body`, TSOA automatically:
  1. Validates incoming request payloads and parameters at runtime before hitting business logic.
  2. Compiles a swagger/OpenAPI specification (`build/spec.json`) automatically, which is then parsed to generate API docs (`dist/openapi.html`).
  3. Generates the Koa router bindings dynamically (`build/routes.ts`).

### 5. **Additional Infrastructure**
- **PostgreSQL**: The core relational database storing all metadata (Users, Inodes, File definitions).
- **Redis**: Used as a high-performance, in-memory datastore for caching and pub/sub background operations. Example: [src/lib/redis/index.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/lib/redis/index.ts).
- **Piscina**: A Node.js worker pool library used for offloading heavy tasks (like deep file searching). Example: [src/worker/index.ts](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/worker/index.ts).
- **OpenID Client**: Integrates with external Identity Providers to handle Single Sign-On.

---

## Directory Walkthrough

For deep technical insights into architectural layout, module breakdowns, and code-level logic, please see the subsequent documentation files located inside the `docs/` folder:

- 🏗️ [Architecture](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/docs/ARCHITECTURE.md)
- 📦 [Modules](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/docs/MODULES.md)
- 📄 [Files & Logic](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/docs/FILES.md)
- 🔄 [Data Flow](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/docs/DATA_FLOW.md)
- 🔗 [Dependencies](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/docs/DEPENDENCIES.md)
- 🛡️ [Security](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/docs/SECURITY.md)
- 🛠️ [Setup Instructions](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/docs/SETUP.md)
- 🧪 [Testing Strategy](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/docs/TESTING.md)
