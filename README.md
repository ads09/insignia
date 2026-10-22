# Insignia Crypto Wallet

Full stack technical test: a crypto wallet REST API (NestJS, PostgreSQL, Prisma) and a
React.js admin dashboard that consumes it.

```
.
├── backend/    NestJS + Prisma + PostgreSQL REST API
├── frontend/   React.js admin dashboard
└── docs/spec/  original OpenAPI specification of the assignment
```

## Getting started

Requirements: Node.js 22+ (npm 11) and Docker.

```bash
# PostgreSQL (databases `insignia` and `insignia_test`)
docker compose up -d

# Backend: http://localhost:3000, Swagger UI at http://localhost:3000/docs
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

Seeded logins: `admin` / `admin12345` (administrator), and `alice` … `laura` /
`password123` (users).

| | |
|---|---|
| Backend details, tests, architecture | [backend/README.md](backend/README.md) |

## API

All six endpoints from the [assignment specification](docs/spec/backend-openapi.yml) are
implemented exactly as specified (paths, field names, status codes). Interactive documentation
of every endpoint is served by Swagger at `/docs`.

| Method | Path | Auth | Source |
|---|---|---|---|
| `POST` | `/user` | – | spec |
| `POST` | `/topup` | token | spec |
| `GET` | `/balance` | token | spec |
| `POST` | `/transfer` | token | spec |
| `GET` | `/top_transactions_per_user` | token | spec |
| `GET` | `/top_users` | token | spec |
| `POST` | `/login` | – | extension |
| `GET` | `/me` | token | extension |
| `GET` | `/transactions` | token | extension |
| `GET` | `/admin/transactions` | token, `ADMIN` | extension |

The token is sent as `Authorization: <token>`. `Authorization: Bearer <token>` is accepted too.

### Extensions

The frontend brief asks for things the backend specification does not cover. The following
additions provide them. They are backward compatible, and none of them changes the behaviour
of a specified endpoint.

| Change | Why |
|---|---|
| `POST /user` accepts an optional `password` | The dashboard requires login with username **and** password. `{ "username": "..." }` alone is still valid and still returns `201 { token }`. |
| `POST /login` | Exchanges username + password for a token: `200 { token }`, or `401` on invalid credentials. |
| `GET /me` | Returns `{ username, role }` so the dashboard can adapt to the user's role. |
| `GET /transactions` | Paginated list of the current user's transactions with search, filters and sorting, as required by the dashboard. |
| `GET /admin/transactions` | Paginated list of all users' transactions for administrators. Non-admins get `403`. |
| Roles `USER` / `ADMIN` | The dashboard is an *admin* dashboard. Public registration always creates a `USER`. The admin account is created by the database seed. |

### Interpretation of the specification

| Topic | Interpretation |
|---|---|
| `username` in `/top_transactions_per_user` | The counterparty: the receiver for debits, the sender for credits. |
| Top-ups | Not counted as transactions in `/top_transactions_per_user` and `/top_users`, because both are defined in terms of transfers. Top-ups are still recorded and listed in `/transactions`. |
| Top-up amount | Must satisfy `0 < amount < 10000000`. Otherwise the response is `400`. |
| Transfer amount | Must be greater than `0`. Transfers to oneself are rejected with `400`. |
| Transfer error precedence | `401` → `400` invalid body → `404` unknown destination → `400` insufficient balance. |
| Users without debits in `/top_users` | Listed with `transacted_value: 0` if fewer than ten users have debits, as in the specification example. |
| Money precision | Stored as `DECIMAL`, never floating point, and serialised as JSON numbers. |
| Concurrent transfers | The debit is one conditional `UPDATE ... WHERE balance >= amount` inside a database transaction, so the balance can never go below zero. A `CHECK (balance >= 0)` constraint backs this up. |
