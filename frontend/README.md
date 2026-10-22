# Insignia Wallet — Frontend

Admin dashboard for the crypto wallet API, built with **React**, **Vite** and
**TypeScript**. It talks to the [backend](../backend/README.md) through **Axios** and draws
its charts with **Chart.js**.

## Requirements

- Node.js 22 or later, npm 11
- The backend running (by default on `http://localhost:3000`)

## Setup and running

```bash
cd frontend
cp .env.example .env    # VITE_API_BASE_URL, the address of the backend
npm install
npm run dev             # http://localhost:5173
```

Production build: `npm run build`, then `npm run preview` (or serve `dist/` with any static
server, falling back to `index.html` for client-side routes).

Sign in with an account created by the backend seed (`admin` / `admin12345`, or `alice` /
`password123`), or create a new account on the registration page.

## Testing

```bash
npm test                # Vitest + React Testing Library, API mocked with MSW
npm run test:cov        # with coverage
```

Other checks: `npm run typecheck`, `npm run lint` (oxlint), `npm run format:check` (Prettier).

## Pages

| Route                 | Who       | Content                                                                                                                                                                  | API                                                                                                                      |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `/login`              | everyone  | Sign in with username and password                                                                                                                                       | `POST /login`                                                                                                            |
| `/register`           | everyone  | Create an account, then sign in with the returned token                                                                                                                  | `POST /user`                                                                                                             |
| `/`                   | signed in | Balance with 30-day summary, balance over the last 30 days, top 10 own transactions (money in vs. out), top 10 users, latest transactions; topup and transfer in dialogs | `GET /balance`, `GET /transactions`, `GET /top_transactions_per_user`, `GET /top_users`, `POST /topup`, `POST /transfer` |
| `/wallet`             | signed in | Balance, topup (with quick amounts) or transfer in one card, latest transactions                                                                                         | `GET /balance`, `POST /topup`, `POST /transfer`, `GET /transactions`                                                     |
| `/transactions`       | signed in | Own transactions: pagination, search, filters, sorting                                                                                                                   | `GET /transactions`                                                                                                      |
| `/admin/transactions` | `ADMIN`   | Transactions of all users, with the same tools                                                                                                                           | `GET /admin/transactions`                                                                                                |

The current user and role come from `GET /me`.

## Architecture

```
src/
├── app/            providers, routes, layout (sidebar, top bar)
├── features/       one folder per feature
│   ├── auth/           session, login/register forms, ProtectedRoute, RoleRoute
│   ├── wallet/         balance, topup and transfer
│   ├── dashboard/      balance history, 30-day summary, charts
│   └── transactions/   lists, filters kept in the URL
├── shared/         code without feature knowledge
│   ├── api/            Axios instance, error mapping, query keys
│   ├── components/     Button, fields, Panel, Dialog, Pagination, states
│   ├── hooks/ lib/ config/
└── test/           test setup, MSW server, render helpers
```

- **Dependency rule:** `app` → `features` → `shared`. A feature uses another feature only
  through its `index.ts`, and `shared` never imports a feature.
- **Each feature** has `api/` (plain functions over the Axios instance), `hooks/` (TanStack
  Query queries and mutations), `components/` and `pages/`.
- **Server state** lives in TanStack Query. After a topup or transfer, the balance,
  the statistics and the transaction lists are invalidated, so every page is up to date.
- **Session:** the token is kept in `localStorage` and sent as
  `Authorization: Bearer <token>`. When a request made with the token gets `401`, the
  user is signed out and sent to the login page. Pages for administrators show
  "Akses ditolak" to other users.
- **Errors** are mapped from the `code` field of the API's error body to messages in
  Indonesian, for example `InsufficientBalanceError` → "Saldo tidak mencukupi."
- **Filters** of the lists live in the URL query string, so a filtered page survives a
  refresh and can be shared. Text filters are debounced, and changing a filter goes back
  to page 1.
- **Forms** use React Hook Form with Zod schemas that mirror the API rules (topup
  `0 < amount < 10.000.000`, at most 8 decimals, password 8–72 characters).
- **Responsive** from 360 px phones upwards, and full width on large screens: the
  sidebar becomes a drawer, the date and amount filters sit behind a "Filter" button,
  and the tables drop to three columns on narrow screens (the transaction type becomes
  an icon, and the administrator list shows "from → to" in one cell), so no page
  scrolls sideways.
- **Design:** light and dark themes from one set of design tokens (`src/index.css`),
  following the system or pinned with the switcher in the top bar. Type is set in
  Plus Jakarta Sans, icons come from Lucide, and dialogs use the native `<dialog>`
  element (focus trap, Escape to close).
- **Balance over time:** the API has no balance history, so the dashboard rebuilds it
  from the current balance and the transactions of the last 30 days
  (`features/dashboard/lib/activity.ts`, unit tested).
- **Charts** come with a table view of the same data and follow the theme. The pages
  behind the login are loaded on demand, so Chart.js is not part of the login bundle.
