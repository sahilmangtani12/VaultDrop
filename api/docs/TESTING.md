# Testing Strategy

> [!TIP]
> Dabih utilizes an end-to-end (E2E) integration testing philosophy, firing real HTTP requests against the full Koa stack utilizing a dedicated `.env.test` Docker container swarm.

---

## 1. Context & Architecture

Test suites often mock out databases or network drivers. However, given Dabih's immense reliance on complex recursive `Prisma` querying (for chunk integrity and member relations) and `Redis` pub-sub channels, the system explicitly **avoids mocking**. 

Instead, it spins up totally fresh instances of Postgres (`16-alpine`) and Redis (`alpine`), applying the test configuration via `dotenv -e .env.test`.

## 2. Framework Choice (`ava`)

- **[AVA](https://github.com/avajs/ava)** was chosen for testing over `Jest` or `Vitest` due to its minimal footprint and concurrent execution capabilities.
- Tests are executed utilizing the `--import=tsx` flag declared in `package.json` to transparently compile typescript test payloads (`*.test.ts`) dynamically.
- Due to database contention (where multiple tests trying to write the same User UID simultaneously would throw Postgres conflict errors), `ava` is instructed to run strictly sequentially via `ava --serial`.

---

## 3. The Test Lifecycle

The lifecycle is completely defined within the scripts of [package.json](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/package.json).

### Initialization (`npm run test:init`)
Before a test executes:
1. `npm run test:clean`: Wipes the mock virtual filesystem locally (`./data/__test__/`).
2. `npm run test:startdb`: Spins up an isolated PostgreSQL container via Docker bindings on port `15432`, bypassing any interference with local developer databases on `5432`.
3. `npm run test:startredis`: Spins up a Redis instance on `6380`.
4. `npm run test:prepare`: Pushes the latest `prisma migrate` schema changes directly into the fresh test container, ensuring the test DB matches source code.

### Execution (`npm run test:api`)
The framework parses the application boundary. Test files inject payloads directly into the API modules. For example, testing `fs/` interactions runs against `fs.test.ts`, creating users, encrypting mock blocks, pushing chunks, and verifying chunk integrity recursively.

### Teardown (`npm run test:reset`)
Once all AVA tests exit (or fail out):
- `test:stopdb` and `test:stopredis` force-remove the Docker instances, leaving no dangling resources and guaranteeing a clean slate for the next CI run.

---

## 4. Run Locally

To trigger the entire automated suite end-to-end, execute:

```bash
npm run test
```

*(This will trigger `init`, `api` testing, and gracefully cascade to `reset` even on failure).*
