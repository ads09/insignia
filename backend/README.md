# Insignia Wallet — Backend

Crypto wallet REST API built with **NestJS**, **PostgreSQL** and **Prisma**.
See the [root README](../README.md) for the API overview, the extensions and how the
specification was interpreted.

## Requirements

- Node.js 22 or later (developed on Node.js 26), npm 11
- Docker, or a PostgreSQL 15+ server

## Setup

```bash
# from the repository root: PostgreSQL with the `insignia` and `insignia_test` databases
docker compose up -d

cd backend
cp .env.example .env    # adjust if needed
npm install             # also generates the Prisma client
npm run db:migrate      # apply the migrations
npm run db:seed         # admin account + demo users and transactions
```

## Running

```bash
npm run start:dev       # watch mode on http://localhost:3000
# or
npm run build && npm run start:prod
```

Swagger UI with every endpoint is served at **http://localhost:3000/docs**.

### Seeded accounts

| Username | Password | Role |
|---|---|---|
| `admin` (`ADMIN_USERNAME`) | `admin12345` (`ADMIN_PASSWORD`) | `ADMIN` |
| `alice`, `bob`, `charlie`, … `laura` | `password123` | `USER` |

Running the seed again updates the administrator and leaves the demo data untouched.

## Testing

```bash
npm test                # unit tests
npm run test:cov        # unit tests with coverage
npm run test:e2e        # end-to-end tests against the `insignia_test` database
```

The end-to-end tests apply the migrations to `insignia_test` (created by
`docker compose`) and truncate its tables between tests. Set `TEST_DATABASE_URL` to use
another database. **Do not point it at a database whose data you need.**

Other checks: `npm run typecheck`, `npm run lint`, `npm run format:check`.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated origins allowed by CORS |
| `DATABASE_URL` | – | PostgreSQL connection string |
| `JWT_SECRET` | – | Secret used to sign tokens (at least 16 characters) |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime, e.g. `1h`, `7d` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | – | Administrator account created by `npm run db:seed` |

The configuration is validated at startup, and the application refuses to start if it is invalid.

## Architecture

The code follows a clean architecture. Each feature module is split into four layers,
and dependencies only point inwards:

```
presentation ──► application ──► domain
     │                ▲
     └─ infrastructure┘   (implements the application ports)
```

| Layer | Contains | Depends on |
|---|---|---|
| `domain` | Business types, value objects (`Amount`) and domain errors | nothing (plain TypeScript) |
| `application` | One use case per operation, plus **ports**: abstract classes such as `UserRepository`, `TokenService` | domain |
| `infrastructure` | Port implementations: Prisma repositories, JWT, bcrypt | application, Prisma |
| `presentation` | Controllers, request validation (DTOs), response mapping, guards | application |

Use cases never know about HTTP or Prisma. They throw domain errors, which a single
`DomainErrorFilter` maps to status codes. Use cases are unit tested with mocked ports,
and infrastructure and controllers are covered by the end-to-end tests.

```
src/
├── main.ts / app.module.ts / app.setup.ts
├── config/                 environment validation
├── shared/                 Amount, DomainError, pagination, Prisma service, error filter
└── modules/
    ├── users/              User entity and repository
    ├── auth/               POST /user, POST /login, GET /me, token & password ports, guards
    ├── wallet/             POST /topup, GET /balance, POST /transfer
    └── transactions/       GET /top_transactions_per_user, /top_users, /transactions,
                            /admin/transactions (read side)
```

### Correctness notes

- **Money** is stored as `DECIMAL(20, 8)` and all arithmetic happens in PostgreSQL, so
  there are no floating-point errors. Amounts are limited to 8 decimal places.
- **Transfers** run in one database transaction. Both wallets are locked in a fixed
  order, which prevents deadlocks between opposite transfers. The debit is a
  conditional `UPDATE … WHERE balance >= amount`, so the balance can never go
  negative, even under concurrent requests.
- **Database constraints** back up the rules above: `balance >= 0`, `amount > 0`, and a
  top-up has no sender while a transfer has a sender other than its receiver.
- **Usernames** are unique through a unique index. A duplicate is detected from the
  constraint violation, which avoids a check-then-insert race.
- **Authentication** is required on every route by default, and routes opt out with
  `@Public()`. The guard reloads the user on every request, so tokens of deleted users
  stop working and role changes take effect immediately.
