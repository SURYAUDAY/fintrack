# FinTrack

**A production-grade SaaS finance analytics dashboard.** MRR / revenue / expense tracking, customer health, role-based access control, and an AI layer (insights, anomaly detection, natural-language query, monthly report generation).

🔗 **Live demo:** <https://fintrack-ashen-xi.vercel.app>

Built end-to-end as a portfolio project — real auth, real database, real OpenAI calls, real deployment.

---

## What this is, in plain English

Imagine you run a small SaaS business. Every month you have customers paying you, expenses going out, and a list of subscribers some of whom might cancel soon. **FinTrack is the dashboard that tells you what's happening, in one place, and answers questions in English.**

The product itself is a fully-working clone of the kind of internal tool you'd see at an early-stage SaaS company. It has:

- A **dashboard** with the headline numbers (recurring revenue, churn, profit) and three charts that update when you change the date range.
- A **transactions table** with 500 rows of real-feeling data — searchable, sortable, filterable, exportable to CSV, importable from CSV.
- An **expenses tracker** with a chart that compares spend against a monthly budget.
- A **customers view** with a churn-risk badge on each customer and a drawer showing their 6-month MRR history.
- An **admin section** where a workspace owner can add team members and change their roles.
- An **AI panel** where you can type *"show revenue from PRO customers in Q3"* and get a filtered chart back.

And underneath all of that:

- **Three user roles** — Admin, Manager, Viewer — with different permissions, enforced both in the UI and at the API.
- **Three pricing plans** — Free, Pro, Enterprise — that gate access to AI features.

---

## Try the demo (3-minute tour)

The live URL has the database pre-seeded. Three accounts are available:

| Role | Email | Password | What it can do |
|---|---|---|---|
| Admin   | `admin@fintrack.com`   | `Admin123!`   | Everything — including /admin/users |
| Manager | `manager@fintrack.com` | `Manager123!` | Read + write data, no user management |
| Viewer  | `viewer@fintrack.com`  | `Viewer123!`  | Read-only — every write button disappears |

### The 5 things worth clicking, in order

1. **Sign in as Admin** → land on Dashboard. The 6 KPI cards show real aggregates from the seed data. Change the date range (top-right) and watch every chart re-fetch.

2. **Click "Explain my data"** on the dashboard. The AI generates a 3-bullet plain-English summary of the current metrics. Notice the text **streams in word-by-word** — that's a real streaming OpenAI response, not a fake animation.

3. **Go to /reports** and try the **natural-language query bar**. Type `show revenue from PRO customers in Q3`. The AI converts that to a structured filter, queries the database, and renders a chart + table. Try the example chips below the bar too.

4. **Go to /revenue**. Sort the table by amount. Filter by category. Search by description. Export the filtered result as CSV. All of this is server-side — refreshing the page preserves the filter via URL.

5. **Sign out → sign in as Viewer.** Notice every Edit / Delete / Add button is gone. Try opening `/admin/users` directly — you'll be redirected. Open the browser DevTools and try POSTing to `/api/revenue` — you'll get `403 Forbidden`. **The UI hides the buttons; the API is the source of truth.**

---

## Feature list

| Area | What's built |
|---|---|
| **Dashboard** | 6 KPI cards (MRR, Revenue YTD, Expenses, Net Profit, Churn Rate, Active Customers), 12-month MRR line chart, revenue-vs-expenses bar chart, expense-category donut, date-range filter (7d / 30d / 90d / 12m) |
| **Revenue** | Server-paginated table for 500+ transactions with sort / search / category filter / type filter. CSV import via drag-and-drop (papaparse). CSV export of current filtered view. Add / edit / delete via modal forms |
| **Expenses** | Full CRUD with category pills, recurring-expense badges, monthly category totals, budget-vs-actual chart that reads the budget from user preferences |
| **Customers** | Customer table with color-coded plan badges (Free / Pro / Enterprise), churn-risk badges, click-through drawer showing per-customer 6-month MRR history |
| **AI features** | 4 distinct OpenAI integrations: (1) streamed dashboard insights, (2) anomaly detection on the MRR chart, (3) natural-language → structured filter → chart, (4) downloadable monthly report. All gated behind PRO plan |
| **Auth + RBAC** | NextAuth v5 with email/password (bcrypt) credentials. Edge-safe middleware. 3 roles × 6 permissions × 3 plans matrix enforced server-side via `canDo()` |
| **Admin** | `/admin/users` (admin-only): view all users, change roles, create new users with temp passwords, deactivate accounts |
| **Settings** | Profile edit, password change with current-password verification, monthly expense budget, dark/light theme |
| **Polish** | Toast notifications on every mutation, loading skeletons on every async surface, route-level error boundaries, dark mode, slow-query / slow-mutation logging in dev |

---

## Tech stack & why

| Layer | Choice | Why this and not something else |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Server-side data fetching co-located with the route. Route groups for auth vs dashboard layouts. Edge middleware. |
| **Language** | TypeScript (strict) | Catches the entire class of "I forgot a field" bugs at build time, especially across Prisma ↔ API ↔ UI |
| **Database** | PostgreSQL via Prisma | Type-safe queries, schema migrations, painless aggregations for KPI math (`groupBy + _sum`) |
| **Auth** | NextAuth.js v5 + Prisma adapter | Split into edge-safe `auth.config.ts` and full Node `auth.ts` — required because middleware runs in Edge Runtime and can't bundle bcrypt |
| **Data fetching** | TanStack Query v5 | Stale-while-revalidate caching, query invalidation after mutations, query-cache subscribers for slow-query logging |
| **Tables** | TanStack Table v8 | Server-side pagination / sort / filter — the table doesn't load 500 rows into the client at once |
| **Charts** | Recharts | Declarative composition, accessible legends, responsive containers — and it dark-mode-themes cleanly |
| **Forms** | React Hook Form + Zod | One Zod schema validates both client form input *and* the API route payload — single source of truth |
| **AI** | OpenAI `gpt-4o-mini` | Cheapest GPT-4 family model. Plenty smart enough for the four features. Rate-limited to 10 calls / user / hour |
| **Hosting** | Vercel + Neon (Postgres) | Both have free tiers; serverless DB autoscales to zero when idle |
| **Tests** | Jest + Testing Library | Smoke tests on permissions matrix, currency formatting, KPI card render |

---

## Architecture decisions worth discussing in an interview

These are the parts I'd be asked about, and what I'd say:

### 1. Two-file auth setup (`auth.config.ts` + `auth.ts`)

Next.js middleware runs in the **Edge Runtime**, which can't use Node-only modules like `bcrypt` or the Prisma adapter. If you put the full NextAuth config in `lib/auth.ts` and import it from `middleware.ts`, the build fails because Vercel tries to bundle bcrypt into an edge function.

The fix: a slim, provider-less `auth.config.ts` that only knows about *routing* (which paths require auth). Middleware imports this. The full config in `auth.ts` — Prisma adapter, credentials provider, bcrypt — is imported only by API route handlers, which run in the Node runtime.

### 2. RBAC is a matrix, not a tree

A common mistake is hard-coding role checks inside each route handler (`if (session.role !== 'ADMIN') return 403`). That scatters the authorization logic across every endpoint and makes it impossible to audit.

Instead, `lib/permissions.ts` exports a `canDo(role, permission, plan)` function that consults a single `(role × permission × plan)` matrix. Every write endpoint calls `canDo()` before touching the database. The matching `usePermission()` hook on the client reads the same matrix to hide / disable UI elements. **The API is the source of truth, the UI is a hint.** If a recruiter opens DevTools and POSTs as a Viewer, the API still says 403.

### 3. OpenAI key never reaches the browser

All four AI features are server route handlers (`app/api/ai/*`). The OpenAI SDK is imported only from `lib/openai.ts`, which is never imported into a client component. Verifiable: open the live site's DevTools → Network → search for `sk-` — nothing.

### 4. Rate-limiting AI endpoints

`lib/rate-limit.ts` keeps an in-memory counter that caps each user at 10 AI calls per hour. Past that, the endpoint returns 429. In a single-instance production deploy this is fine; multi-region would need Redis (Upstash, Redis Cloud). The contract stays the same.

### 5. Slow-query logger as a React Query cache subscriber

`lib/query-logger.ts` attaches to the `QueryCache` and `MutationCache` and logs any query or mutation that takes >1s. Logger is attached only in development (`process.env.NODE_ENV !== "production"`). Helped catch a missing Prisma index during development.

---

## Project structure

```
app/                          Next.js App Router
  (auth)/                     Login + register (own layout, redirects authed users away)
  (dashboard)/                Sidebar layout — Dashboard, Revenue, Expenses, Customers, Reports, Settings
  admin/                      Admin-only — User management
  api/                        REST handlers — all writes pass through canDo()
    ai/                       insights · anomaly · query · report
  pricing/                    Public pricing page (no auth)
  icon.svg                    Favicon
components/
  ai/                         InsightsPanel · QueryBar · QueryResult · ReportGenerator
  charts/                     MRRLineChart · RevenueExpensesBarChart · ExpenseDonutChart · BudgetVsActualChart
  layout/                     Sidebar · Header · AppShell · ThemeProvider
  tables/                     TransactionsTable · TableFilters
  ui/                         Reusable primitives (KPICard, Modal, PlanGate, Skeleton, etc.)
  forms/                      TransactionForm · ExpenseForm
lib/
  auth.ts / auth.config.ts    Split config: full vs edge-safe (for middleware)
  permissions.ts              canDo() — single source of authorization truth
  rate-limit.ts               In-memory rate limiter for AI endpoints
  query-logger.ts             Dev-only slow-query / slow-mutation console warnings
  prisma.ts                   Singleton Prisma client
  openai.ts                   Singleton OpenAI client
  utils.ts                    cn, formatCurrency, getInitials, …
hooks/                        useDashboard · useRevenue · useExpenses · useCustomers · useUsers · usePermission · useAnomalies · usePreferences
prisma/
  schema.prisma               User · Account · Session · Transaction · Expense · Customer · CustomerMrr · AuditLog
  seed.ts                     3 users · 500 transactions · 100 expenses · 50 customers (with a planted anomaly month)
__tests__/                    Jest + RTL smoke tests
middleware.ts                 NextAuth-powered route protection
vercel.json                   Build command incl. prisma migrate deploy
```

---

## Run locally

```bash
# 1. Clone
git clone https://github.com/SURYAUDAY/fintrack.git
cd fintrack
npm install

# 2. Environment
cp .env.local.example .env.local
# Required: DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY
# Optional: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# 3. Database (needs a running Postgres — local Docker, Neon, or Supabase)
npx prisma migrate dev
npx prisma db seed

# 4. Dev server
npm run dev      # http://localhost:3000
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev`           | Next.js dev server |
| `npm run build`         | `prisma generate && next build` |
| `npm run typecheck`     | `tsc --noEmit` |
| `npm test`              | Jest + RTL test suite |
| `npm run prisma:studio` | Open Prisma Studio (`localhost:5555`) |
| `npm run db:seed`       | Re-run `prisma/seed.ts` |

---

## Deploy to Vercel

1. Push to GitHub.
2. **Provision a Postgres** — Neon free tier is easiest. Copy the connection string.
3. **Import the repo** at <https://vercel.com/new>.
4. **Set environment variables** in the Vercel project settings:
   - `DATABASE_URL` — Postgres URL
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — the full HTTPS URL of the deployment
   - `OPENAI_API_KEY`
5. The first deploy runs `prisma generate && prisma migrate deploy && next build` (see [`vercel.json`](vercel.json)) — Postgres tables are created automatically.
6. **Seed the production DB once** from your local machine:
   ```bash
   DATABASE_URL="<prod url>" npx prisma db seed
   ```

---

## About

Built end-to-end by **Suryauday Prakash Mishra** as a portfolio project to demonstrate full-stack engineering across:

- Next.js App Router with mixed server/client components
- Production-grade authentication and authorization
- AI integration that's safe, rate-limited, and demonstrably useful
- Database schema design and aggregation queries
- Deployment, env-var management, and migration on Vercel + Neon

The whole project — schema, seed, 17 routes, 4 AI features, RBAC, deploy — was built in 17 phases following a self-written plan. The plan files are checked into the repo if you're curious how I structured the work: [FinTrack_Build_Plan.md](FinTrack_Build_Plan.md) and [FinTrack_Build_Plan_v2_with_Stitch.md](FinTrack_Build_Plan_v2_with_Stitch.md).

## License

MIT.
