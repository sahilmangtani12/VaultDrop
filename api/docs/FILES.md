# Key Files & Code-Level Explanations

> [!TIP]
> This document dives into the exact implementation of the Dabih API's most critical bootstrap, utility, and middleware logic files. It provides a meticulous line-by-line breakdown (or logical block breakdown) of the source code.

---

## 1. Application Entry Point: `src/app.ts` ([View File](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/app.ts))

**Purpose**: This file bootstraps Koa, configures middleware, establishes database/redis connections, and mounts the compiled TSOA routes. It represents the lifecycle beginning of the application.

### Line-by-Line Breakdown:
- **L1-7**: Standard imports. Brings in `Koa` (the underlying web framework), `@koa/bodyparser` (to process JSON payloads), `@koa/router` (for request routing), the internal `logger`, the `getEnv` configuration helper, and `koa-static` for serving frontend assets.
- **L8**: `import { RegisterRoutes } from '../build/routes';`
  - *Explanation*: Imports the dynamically generated routing schema built by TSOA. This file is generated at compile-time and contains all validated endpoints.
- **L10-L15**: Internal service initialization imports (`error`, `indexFallback`, `log`, `serialize`, `initFilesystem`, `initInodes`, `initOpenID`, `initRedis`, `initEmail`).
- **L17**: `const app = async (port?: number) => {`
  - *Explanation*: Declares an asynchronous factory function to construct and bind the API server. This permits safe awaiting of required services before opening ports.
- **L18-L22**: Consecutive `await init...()` calls.
  - *Explanation*: Synchronously pauses execution until the filesystem is mapped, inodes are indexed, Redis is connected, the Email transport is warmed up, and the OpenID Issuer is explicitly discovered online.
- **L23**: `const app = new Koa();`
  - *Explanation*: Instantiates the Koa application object which will manage the middleware onion queue.
- **L24-L27**: `app.use(...)` chain.
  - *Explanation*: Binds the parsing of bodies (`bodyParser`), logging `log()`, custom `error()` interception, and `serialize()` stringification layers directly to the Koa stack. Every HTTP request will flow through these layers.
- **L29-L33**: Logic reading `NODE_ENV` and `LOG_LEVEL` via `getEnv()`.
  - *Explanation*: Extracts configuration securely to determine whether to emit debug verbose logging, preventing silent failures.
- **L35-L36**: `const apiRouter = new Router(); RegisterRoutes(apiRouter);`
  - *Explanation*: Passes a fresh Koa Router to the TSOA generator, allowing TSOA to attach its `GET/POST` controllers directly to the router instance.
- **L38-L42**: Binds `/api/v1` namespace to the `apiRouter`. Also mounts `dist` to serve frontends via `app.use(serve('dist', {}));`.
- **L44**: `app.use(indexFallback());`
  - *Explanation*: Ensures that non-API requests (e.g., standard browser SPA routing) fallback to serving `index.html`.
- **L46-L48**: Checks the port string from Environment variables (or uses `8080`) and binds the active Koa listener. Emits an info log that the API is alive.
- **L49-53**: `state.on('close', ...)`
  - *Explanation*: Maps a shutdown event listener onto the server state, intercepting SIGTERM or close events to gracefully sever the `redis.quit()` connection, freeing memory to avoid zombie ports.
- **L54-L57**: Returns the active `state` object and sets the default CommonJS/ESM export.

---

## 2. Global Error Handler: `src/middleware/error.ts` ([View File](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/middleware/error.ts))

**Purpose**: A Koa middleware interceptor that catches any uncaught Javascript `Error` or `Exception` thrown deeper in the stack (by Controllers or Prisma) and formats it into a secure, standard JSON payload for the client.

### Line-by-Line Breakdown:
- **L1-L4**: Dependency ingestion, importing Koa's `Context` and `Next`, as well as TSOA's `ValidateError` and Prisma's `PrismaClientKnownRequestError`.
- **L6-L10**: `interface DabihError { ... }`
  - *Explanation*: Defines a standardized Error Shape (message, code, details) that the frontend natively understands.
- **L12-L16**: `declare module 'koa'`
  - *Explanation*: A TypeScript ambient module declaration. This forcibly extends Koa's `BaseContext` so typescript allows developers to call `ctx.error(...)` seamlessly throughout the application without type errors.
- **L18-L33**: `const getStackMessage = ...`
  - *Explanation*: A helper function. It grabs an `error.stack`, explodes it via newline, removes the absolute local Project Working Directory (`pwd = process.cwd()`) to prevent filesystem info leakage, and returns a cleaner, sanitized stack trace.
- **L35**: `const error = async (ctx: Context, next: Next) => {`
  - *Explanation*: The Koa middleware signature. Takes the request `ctx` and the `next` downstream middleware execution callback.
- **L36-L54**: `try { ctx.error = ...; await next(); }`
  - *Explanation*: Attaches the custom `ctx.error` lambda function to the context immediately. It then attempts to blindly `await next()`. If all downstream controllers succeed, the block skips straight to completion.
- **L55-L62**: `catch (err)`
  - *Explanation*: Catches anything inside the `await next()`. First, it sanity checks `!(err instanceof Error)`. If the thrown value wasn't an actual Javascript Error (e.g. someone ran `throw "string";`), it logs heavily and aborts into a generic 500 error.
- **L63-L70**: `if (err instanceof PrismaClientKnownRequestError)`
  - *Explanation*: Prisma interceptor. If `Prisma` fails (Unique constraint violated, invalid foreign key), this catches the specific class, extracts the internal PRISMA `code`, maps it to an HTTP `400` code, and informs the client.
- **L71-L78**: `if (err instanceof ValidateError)`
  - *Explanation*: TSOA Interceptor. Catches poorly structured client JSON. Emits a clean `422 Unprocessable Entity` response returning the exact `.fields` that the user got wrong.
- **L79-L85**: Standard Error code check. If the Error contains a numeric `code`, it honors it, setting the response to that error code natively.
- **L86-L92**: Fallback. If it's a completely unhandled native Error, it invokes `getStackMessage` and returns a secure `500` server failure payload.
- **L94**: `export default () => error;`
  - *Explanation*: Curries the middleware, returning the instantiated function for Koa to `.use()`.

---

## 3. Filesystem Interface: `src/lib/fs/index.ts` ([View File](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/src/lib/fs/index.ts))

**Purpose**: An abstraction bridge layer. Instead of writing directly to the `fs`, Dabih dictates a `StorageBackend` trait, allowing the system to theoretically plug in an AWS S3, a Google Drive layer, or simple Local FS seamlessly.

### Line-by-Line Breakdown:
- **L6-L13**: `export interface StorageBackend { ... }`
  - *Explanation*: Strongly types the exact required signatures a backend MUST fulfill to support Dabih chunk storage. Requires streaming (`get`/`store`), `head` stats, and bucket orchestration (`removeBucket`, `createBucket`, `listBuckets`).
- **L15**: `let backend: StorageBackend | null = null;`
  - *Explanation*: Maintains the initialized singleton backend pointer in memory.
- **L17**: `export const init = async () => {`
  - *Explanation*: The asynchronous factory that `app.ts` awaits during boot.
- **L18**: `const storageUrl = requireEnv('STORAGE_URL');`
  - *Explanation*: Strongly forces the boot sequence to crash immediately if the `STORAGE_URL` environment variable isn't mapped, guaranteeing safety.
- **L20-L24**: `if (storageUrl.startsWith('fs:'))`
  - *Explanation*: Parses a connection URI. Since Dabih supports local drives, it rips the `fs:` protocol delimiter out, grabs the raw `path`, and injects it into the actual `initFilesystem(path)` instantiator imported on L3. It then assigns the result to the module-level `backend` let.
- **L26**: `throw new Error(...)`
  - *Explanation*: Safe fallback if the system reads an unknown prefix (e.g., `s3://`).
- **L29-L65**: The remaining file defines boilerplate export interceptors (`get`, `store`, `head`, `removeBucket`, `createBucket`, `listBuckets`).
  - *Explanation*: Each function acts identically. It throws an immediate runtime exception if `!backend` (i.e. if a controller tries to upload a file before Koa is done initializing the FS wrapper), otherwise it blind-forwards the exact parameters directly to the underlying instantiated `backend.fn(bucket, key)`.
