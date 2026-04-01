# Internal & External Dependencies

> [!NOTE]
> This document logs the primary architectural dependencies (Node.js packages & external network services) required to run the Dabih API, explaining precisely why each library was selected over alternatives in `package.json`.

---

## 1. Network / Transport Infrastructure

- **[Koa](https://koajs.com/) (`koa`, `@koa/router`, `@koa/bodyparser`)**
  - **Why**: Chosen over Express for better native `async/await` support in its underlying middleware execution model, dropping the dreaded callback wrappers and improving stack trace clarity. Essential for streaming multi-gigabyte files asynchronously without blocking the event loop.
- **`koa-static`**: Used briefly to serve the final Vite frontend build (`dist/`) directly out of the `appRouter` fallback, avoiding the need for an NGINX proxy during local development.

## 2. Database & Data Access

- **[Prisma Client](https://www.prisma.io/) (`@prisma/client`, `prisma`)**
  - **Why**: Replaces raw SQL drivers (`pg`) and standard ORMs (TypeORM/Sequelize). Dabih relies extensively on advanced relational queries (e.g., retrieving an `Inode` and recursively `include`-ing all its parent folders and children nodes). Prisma drastically simplifies these queries into strictly typed functions and auto-generates migrations.
- **[Redis Client](https://github.com/redis/node-redis) (`redis`)**
  - **Why**: Required for distributed cache and fast, volatile cross-process communication (Pub/Sub). Search queries stream real-time results directly back from the Worker Pool to the HTTP Server via `redis.publish()`.

## 3. OpenAPI & API Structure

- **[TSOA](https://tsoa-community.github.io/) (`tsoa`)**
  - **Why**: Eliminates the "Double Source of Truth" problem where documentation and actual runtime logic diverge. TSOA is actively fed standard TypeScript `interface` schemas, and it generates:
    1. A compiled `routes.ts` file that automatically handles all structural payload parsing and Type validation for Koa.
    2. A complete OpenAPI 3.0 specification (`build/spec.json`) mapping the data shapes for frontend consumption.
- **[Redocly CLI](https://redocly.com/redoc/) (`@redocly/cli`)**
  - Used in build scripts (`npm run build:docs`) to generate beautiful, interactive HTML documentation out of the TSOA-generated `spec.json`.

## 4. Security & Cryptography

- **`jsonwebtoken`**
  - **Why**: Standard protocol for verifying short-lived or long-lived session payloads in a stateless architecture.
- **`openid-client`**
  - **Why**: Modern SSO handling. Delegates identity resolution entirely, allowing corporate users to hit a `/login` endpoint and easily pivot via standard OAuth2/OIDC.
- **`crc`**
  - Fast error-detecting codes used natively to verify the integrity sequence of encrypted chunk packets during client-server transport before flushing to the Storage backend. Node's native `crypto` handles the hashing, but `crc` validates the chunk boundaries faster without full parsing.

## 5. Parallelism & Performance

- **[Piscina](https://github.com/piscinajs/piscina) (`piscina`)**
  - **Why**: Node is inherently single-threaded. Dabih's file tree requires complex, recursive, cryptographic traversal (Search Jobs or Zip Generation). Using core Node `<worker_threads>` natively is extremely verbose. Piscina abstracts thread pooling efficiently.

## 6. Utilities

- **`resend`**: Replaces standard SMTP / `nodemailer`. It provides an ultra-fast REST HTTP client to trigger one-time verification magic email links securely.
- **`winston`**: The core `logger` interceptor. Captures JSON-formatted structured logging for the server stdout for aggregation tools (like Datadog/ELK), supporting level toggles via `process.env.LOG_LEVEL`.

## 7. Testing Infrastructure
- **[AVA](https://github.com/avajs/ava) (`ava`)**
  - **Why**: Known for its incredible parallel execution speed compared to Jest. `ava` allows Dabih to spin up totally isolated Postgres/Redis Docker containers per test run (`npm run test`), firing concurrent HTTP tests to validate system boundaries.
