# FinTrack — SaaS Finance Analytics Dashboard

A full-stack finance analytics dashboard for SaaS businesses: MRR / revenue / expense tracking, customer health, role-based access control, and an AI layer (insights, anomaly detection, natural-language query, monthly report generation).

> Built with **Next.js 14 (App Router) · TypeScript · Prisma · PostgreSQL · NextAuth v5 · TanStack Query/Table · Recharts · OpenAI `gpt-4o-mini`**.

---

## Live demo

| | |
|---|---|
| URL | <https://fintrack-ashen-xi.vercel.app> |
| Admin login   | `admin@fintrack.com / Admin123!`   |
| Manager login | `manager@fintrack.com / Manager123!` |
| Viewer login  | `viewer@fintrack.com / Viewer123!`  |

The Viewer account has read-only access — every write action is blocked at both the UI layer and the API layer (returns 403). Use it to verify the RBAC implementation.

---

## Features

- **Dashboard** — 6 KPI cards, MRR line chart (12 months), revenue-vs-expenses bar chart, expense-category donut, date-range filter
- **Revenue** — Server-paginated TanStack Table with sort/search/filter for 500+ rows, CSV import (papaparse) and CSV export
- **Expenses** — Full CRUD with budget-vs-actual chart and category totals
- **Customers** — Plan badges, churn-risk badges, per-customer MRR-history drawer
- **RBAC** — 3 roles (`ADMIN` / `MANAGER` / `VIEWER`) enforced on both the API and UI; admin-only `/admin/users` page with role changes, invite, and deactivate
- **AI features (Pro plan)**
  - `/api/ai/insights` — streamed 3-bullet plain-English summary of current metrics
  - `/api/ai/anomaly` — statistical + AI-flagged anomalies rendered as chart badges
  - `/api/ai/query` — natural-language → structured filter → live chart + table on `/reports`
  - `/api/ai/report` — generate a downloadable monthly business report
- **Plan gating** — Free / Pro / Enterprise with an upgrade modal on AI features
- **Polish** — Toast notifications, loading skeletons, route-level error boundaries, dark mode, slow-query logging in dev

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Co-located server + client code, RSC for data fetching |
| Auth | NextAuth.js v5 + Prisma adapter | Edge-safe middleware via split `auth.config.ts` / `auth.ts` |
| DB | PostgreSQL via Prisma | Type-safe queries, easy aggregations for KPI math |
| Data fetching | TanStack Query v5 | Cache + stale times + slow-query logging |
| Tables | TanStack Table v8 | Server-side pagination / sort / filter |
| Charts | Recharts | Declarative composition, responsive containers |
| Forms | React Hook Form + Zod | Single source of truth for client + server validation |
| AI | OpenAI `gpt-4o-mini` | Cheap, fast, sufficient for the demo scope |
| Tests | Jest + Testing Library | Unit tests for utils, permissions, KPI card |

---

## Project structure

```
app/                       — Next.js App Router (route groups: (auth), (dashboard), admin)
  api/                     — REST handlers; all writes go through canDo() permission check
  api/ai/                  — insights · anomaly · query · report
components/
  ai/                      — InsightsPanel · QueryBar · QueryResult · ReportGenerator
  charts/                  — MRRLineChart · RevenueExpensesBarChart · ExpenseDonutChart · BudgetVsActualChart
  layout/                  — Sidebar · Header · AppShell · ThemeProvider
  tables/                  — TransactionsTable · TableFilters
  ui/                      — Reusable primitives (KPICard, Modal, PlanGate, Skeleton, …)
lib/
  auth.ts / auth.config.ts — Split config: full vs edge-safe (for middleware)
  permissions.ts           — Role + plan permission matrix (canDo)
  rate-limit.ts            — In-memory rate limiter for AI endpoints
  query-logger.ts          — Dev-only slow-query / slow-mutation console warnings
prisma/
  schema.prisma            — User · Transaction · Expense · Customer · CustomerMrr · AuditLog
  seed.ts                  — Seeds 3 users · 500 transactions · 100 expenses · 50 customers (with a planted spike month)
__tests__/                 — Jest + RTL smoke tests
```

---

## Run locally

```bash
# 1. Install
npm install

# 2. Environment
cp .env.local.example .env.local
# Fill in: DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY
# (Google OAuth keys are optional)

# 3. Database
npx prisma migrate dev
npx prisma db seed

# 4. Dev server
npm run dev      # http://localhost:3000
```

### Useful scripts

| Command | What it does |
|---|---|
| `npm run dev`       | Next.js dev server with Turbopack |
| `npm run build`     | `prisma generate && next build` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test`          | Jest + RTL |
| `npm run prisma:studio` | Open Prisma Studio at `localhost:5555` |
| `npm run db:seed`   | Re-run `prisma/seed.ts` |

---

## Deploy to Vercel

1. Push to GitHub.
2. **Provision a Postgres** (Neon free tier or Vercel Postgres). Copy the *pooled* connection string.
3. **Import the repo** at <https://vercel.com/new>.
4. **Set environment variables** in the Vercel project settings:
   - `DATABASE_URL` — pooled Postgres URL
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — full HTTPS URL of the deployment
   - `OPENAI_API_KEY`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` *(optional)*
5. The first deploy runs `prisma generate && prisma migrate deploy && next build` (see [vercel.json](vercel.json)).
6. **Seed once** against the production DB from your local machine:
   ```bash
   DATABASE_URL="<prod url>" npx prisma db seed
   ```
7. If using Google OAuth, add `<NEXTAUTH_URL>/api/auth/callback/google` to the authorized redirect URIs in Google Cloud Console.

---

## Architecture notes worth calling out

- **Edge-safe auth** — `middleware.ts` runs in the Edge Runtime, which cannot use bcrypt or the Prisma adapter. `lib/auth.config.ts` is a Credentials-free, adapter-free config used only by middleware; `lib/auth.ts` extends it with the full Prisma adapter + bcrypt credentials provider for the Node runtime.
- **Two-layer RBAC** — `lib/permissions.ts` defines a matrix of `(role × permission × plan)`. Every write API route calls `canDo()` *before* hitting Prisma; the matching `usePermission()` hook hides UI elements in the same shape. The API is the source of truth — the UI is a hint.
- **AI API key never leaves the server** — All `/api/ai/*` routes are server route handlers; the OpenAI SDK is imported only in `lib/openai.ts`. Verify in DevTools → Network: the key never appears.
- **Rate limit** — `lib/rate-limit.ts` caps AI calls at 10/user/hour in-memory. For multi-instance production this would be moved to Redis.
- **Slow-query logging** — `lib/query-logger.ts` attaches subscribers to the React Query cache and logs any query/mutation taking >1s in development.

---

## License

MIT — built as a portfolio project by Suryauday Prakash Mishra.
