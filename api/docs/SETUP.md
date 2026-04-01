# Installation & Setup Instructions

> [!TIP]
> This guide is designed to get a new developer's environment fully operational for local testing and feature creation, using Node.js and Docker for isolated resource spinning.

---

## 🚀 Prerequisites

1. **[Node.js](https://nodejs.org/en/)** `v20.x` or higher.
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** or equivalent engine (for Postgres and Redis).
3. **[Git](https://git-scm.com/)** to pull the repository.

---

## 🛠️ Environment Configuration

Dabih utilizes the `dotenv-cli` package to explicitly switch contexts (between `.env.dev`, `.env.test`, and `.env.local`). 

1. Within the `api/` directory, create your local overrides securely.
2. The default `docker-compose.yml` and NPM scripts assume the following `.env.dev` defaults:

```env
# .env.dev (Example Configuration)
PORT=8080
LOG_LEVEL=debug
STORAGE_URL=fs:../data/uploads
DB_URL=postgresql://postgres:postgres@localhost:5432/dabih?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=super_secret_local_development_key
```

> [!WARNING]
> Never set `STORAGE_URL` to an insecure or unmounted directory. `fs:../data/uploads` ensures test chunks get written safely to the local disk inside the ignored repository `data/` folder.

---

## 🏃‍♂️ Bootstrapping Local Development

The [package.json](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/package.json) orchestrates the entire monolithic boot sequence, including Database and Cache compilation.

1. **Install Packages**
   ```bash
   npm install
   ```

2. **Start the Required Docker Services** (Database and Redis Cache)
   The scripts automatically spawn the exact versions of Alpine Postgres/Redis linked by the default `.env` files.
   ```bash
   npm run dev:startdb
   npm run dev:startredis
   ```

3. **Hydrate the Database Schema**
   Pushes the Prisma ORM [schema.prisma](file:///c:/Users/Sahil/OneDrive/Desktop/MPR-SEM6/dabih/api/prisma/schema.prisma) up to your running Postgres Docker container, creating table layouts.
   ```bash
   npm run dev:migrate
   ```

4. **Compile TSOA & Launch The Server**
   This command sequentially commands TSOA to build OpenAPI schema, bundles router files, and launches the `src/app.ts` root server script in nodemon-style live-reload (using `tsx`).
   ```bash
   npm run dev:start
   ```

*(Shortcut)*: You can condense Steps 2 through 4 into a single orchestrated command:
```bash
npm run dev
```

---

## 📊 Opening the Prisma GUI
Sometimes developers need to inspect raw `Inodes`, `User` references, or chunk indices.
```bash
npm run studio
```
This loads Prisma Studio at `http://localhost:5555`, automatically hooking into the `.env.dev` database.

---

## 🧹 Stopping the System Environment
To preserve memory, use the teardown commands from the `package.json` to safely halt and execute cleanup on the Postgres/Redis containers:

```bash
npm run dev:stopdb
npm run dev:stopredis
```
