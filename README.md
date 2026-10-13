# Elysia backend template

A small, feature-based Bun backend with PostgreSQL, Drizzle, Better Auth, Pino and OpenAPI. Routes handle HTTP and validation; services own application logic; repositories own database queries. There is no separate controller layer or generic base repository.

## Getting started

Install Bun 1.3.14+, then:

```sh
bun install
cp .env.example .env
bun -e 'console.log(crypto.randomUUID() + crypto.randomUUID())'
# Set BETTER_AUTH_SECRET to the generated value in .env.
docker compose up -d postgres
bun run db:migrate
bun run dev
```

The API listens on port 3000. Open `/docs` for interactive documentation or `/openapi.json` for the specification. `/health` and `/health/live` are process checks; `/health/ready` checks PostgreSQL and returns 503 when unavailable. The root path returns a standard 404.

## Architecture

```text
src/
  app.ts                         createApp(), no listening socket
  server.ts                      listen and graceful shutdown
  config/                        validated environment, app and auth settings
  common/
    errors/                      AppError and status-specific errors
    http/                        response schemas and pagination
    middleware/                  request IDs and completion logs
    plugins/                     CORS, logger, error handler, OpenAPI
  infrastructure/
    auth/auth.ts                 Better Auth with Drizzle adapter
    database/
      db.ts                      shared PostgreSQL pool and Drizzle client
      schema/auth.schema.ts      users, sessions, accounts, verifications
      schema/index.ts            schema exports
      migrations/                committed drizzle-kit migrations
    logger/logger.ts             Pino and credential redaction
  modules/
    health/health.module.ts
    users/
      user.module.ts
      user.schema.ts
      user.service.ts
      user.repository.ts
  routes/index.ts                /api/v1 routes
 tests/
  unit/                          service, environment, response and logging
  integration/                   HTTP and PostgreSQL/auth boundaries
```

Dependency direction: **Elysia module → service → repository → Drizzle → PostgreSQL**. Services do not import HTTP objects; repositories do not return HTTP envelopes. The user table belongs to Better Auth. Add a separate `user.schema.ts` in the database schema directory only when domain fields are actually needed, rather than duplicating the auth user table.

## Environment

Only `src/config/env.ts` reads `process.env`. Bun loads `.env` automatically, including for database scripts. Invalid settings fail startup without printing secret values.

| Variable             | Purpose / default                                                    |
| -------------------- | -------------------------------------------------------------------- |
| `NODE_ENV`           | `development`, `test`, `production`; development default             |
| `APP_NAME`           | Log/documentation name; `elysia-api`                                 |
| `APP_HOST`           | Bind address; `0.0.0.0`                                              |
| `APP_PORT`           | Integer port; `3000`                                                 |
| `APP_URL`            | Public HTTP URL; `http://localhost:3000`                             |
| `DATABASE_URL`       | Required PostgreSQL connection string                                |
| `BETTER_AUTH_SECRET` | Required random secret, at least 32 characters                       |
| `BETTER_AUTH_URL`    | Auth public URL; `http://localhost:3000`                             |
| `TRUSTED_ORIGINS`    | Comma-separated exact HTTP origins; localhost default                |
| `LOG_LEVEL`          | `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent`; `info` |

Use HTTPS URLs/origins and a fresh secret in production. Set `LOG_LEVEL=debug` for development. Production emits JSON; development uses pino-pretty. Credentials are redacted, request bodies are never logged, and unexpected database errors are logged without query values. Do not commit `.env`.

## Authentication and users

Better Auth owns `/api/auth/*`, including `/sign-up/email`, `/sign-in/email`, `/sign-out`, and `/get-session`. Its responses and cookies follow Better Auth's native contract. Do not wrap auth responses or duplicate password/session handling. The integration follows the [Better Auth Elysia guide](https://better-auth.com/docs/integrations/elysia).

Email/password auth is enabled. Production uses secure cookies, trusted origins and Better Auth's rate limiter. Add email verification/recovery delivery and domain-specific permissions before using this template for an application that needs them. The default auth rate limiter uses process-local storage; configure shared storage for multiple instances.

The reference directory endpoints require a valid session:

```text
GET /api/v1/users?page=1&limit=20&search=Alice&sort=createdAt&order=desc
GET /api/v1/users/:id
```

They return only id, name, image, and createdAt; emails and credentials are excluded. Sorting supports `createdAt` and `name`, ordering supports `asc` and `desc`, and limit is capped at 100. The authenticated directory is an example policy: replace it with your domain authorization rules when adding private fields. Signup belongs to Better Auth, so fake user CRUD endpoints are intentionally omitted.

General API rate limiting can be added as an Elysia plugin in `createApp()` or enforced at the gateway. Auth rate limiting is already enabled outside tests. The Bun HTTP server caps incoming bodies at 1 MiB. Deploy behind a TLS reverse proxy and configure your own application authorization.

## Responses and errors

Application endpoints return:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

Single resources use `meta: null`. Errors return:

```json
{
  "success": false,
  "message": "User not found",
  "error": { "code": "USER_NOT_FOUND", "details": null }
}
```

Depend on `error.code`, not message text. Validation uses 422 with field details; malformed JSON uses 400, authentication 401, authorization 403, missing resources 404, conflicts 409 and unexpected errors 500. Status codes are not duplicated in JSON. Every request returns `X-Request-ID`; safe incoming IDs are retained, others are replaced. Completion logs include request ID, method, path, status and duration.

## Commands and database

| Command                           | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `bun run dev`                     | Watch server                                      |
| `bun run start`                   | Start source server                               |
| `bun run build`                   | Bundle to `build/server.js`                       |
| `bun build/server.js`             | Start production bundle                           |
| `bun run typecheck`               | Strict TypeScript                                 |
| `bun run lint` / `lint:fix`       | ESLint checks/fixes                               |
| `bun run format` / `format:check` | Prettier write/check                              |
| `bun run test` / `test:watch`     | Tests without a running database                  |
| `bun run test:database`           | PostgreSQL repository and real Better Auth tests  |
| `bun run check`                   | Typecheck, lint, formatting and default tests     |
| `bun run db:generate`             | Generate migration after schema changes           |
| `bun run db:migrate`              | Apply committed migrations                        |
| `bun run db:push`                 | Direct schema sync for disposable development DBs |
| `bun run db:studio`               | Database browser                                  |

Commit generated SQL and migration metadata. Production migrations run as a separate release step, before starting the image. `db:push` is not a production migration strategy.

Services can explicitly orchestrate atomic mutations with `db.transaction(async tx => { const repository = createUserRepository(tx); /* domain operations */ })`. Repository factories accept the database or transaction; single reads do not start transactions.

## Tests and hooks

HTTP integration tests use `createApp().handle(new Request(...))`, without a port. `.env.test` contains disposable test-only settings. Default tests use small service/session stubs; PostgreSQL tests exercise real queries, signup, cookies and sessions.

```sh
# Use a dedicated disposable database, never production.
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/elysia_test NODE_ENV=test bun run db:migrate
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/elysia_test bun run test:database
```

Husky installs via `bun install`: pre-commit runs lint-staged only; pre-push runs typecheck and default tests. CI provisions PostgreSQL, runs migrations, all checks, database tests and the build. It does not deploy.

## Docker

`docker compose up --build` runs PostgreSQL plus the watched development API, installs dependencies and applies migrations. Database data persists in a named volume. Compose credentials are for local development only.

```sh
docker build -t elysia-api .
docker run --rm --env-file .env.production -p 3000:3000 elysia-api
```

Provide production HTTPS configuration and a reachable database. The multi-stage image contains the Bun bundle, runs as the `bun` user and excludes environment files. Secrets are supplied at runtime. SIGINT/SIGTERM stop HTTP and the PostgreSQL pool, with a 10-second shutdown deadline.

## Creating a new module

```text
src/modules/products/
  product.module.ts       HTTP routes, params/query/body, responses, session
  product.schema.ts       Elysia schemas and inferred input types
  product.service.ts      business logic, authorization, AppError
  product.repository.ts   parameterized Drizzle queries
```

Add tables under `infrastructure/database/schema`, export them in its index, generate a migration, and mount the module in `routes/index.ts`. Reuse `success()`, `successSchema()`, `pagination()` and the existing errors. Keep filtering parameterized and return only allowed fields. Test service behavior and one meaningful HTTP/database boundary. Small modules may use a single file; do not add empty layers.

OpenAPI uses the same Elysia schemas as validation; see the [OpenAPI plugin documentation](https://elysiajs.com/plugins/openapi).
