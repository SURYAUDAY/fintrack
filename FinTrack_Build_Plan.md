# FinTrack — SaaS Finance Analytics Dashboard
## Complete Build Plan (Phase-by-Phase)

> **How to use this document**
> Each phase = one chunk of work. Build it → test it → debug it → mark it done → move on.
> When a phase is complete, say "Phase X done" and we move to the next one together.
> Claude Code in VS Code is your primary building tool — each phase includes exact prompts to use.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (via Neon or Supabase free tier) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Data fetching | React Query (TanStack Query v5) |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| AI | OpenAI API (gpt-4o-mini) |
| Forms | React Hook Form + Zod |
| Deploy | Vercel (frontend + API routes) |
| Testing | Jest + React Testing Library |

---

## Project Folder Structure (Final)

```
fintrack/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx             ← sidebar + header shell
│   │   ├── dashboard/page.tsx
│   │   ├── revenue/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/
│   │   └── users/page.tsx
│   ├── pricing/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── dashboard/route.ts
│       ├── revenue/route.ts
│       ├── expenses/route.ts
│       ├── customers/route.ts
│       ├── reports/route.ts
│       ├── users/route.ts
│       └── ai/
│           ├── insights/route.ts
│           ├── query/route.ts
│           ├── anomaly/route.ts
│           └── report/route.ts
├── components/
│   ├── ui/                        ← reusable base components
│   ├── charts/                    ← chart components
│   ├── tables/                    ← table components
│   └── layout/                    ← sidebar, header, etc.
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── openai.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── hooks/                         ← custom React Query hooks
├── types/                         ← TypeScript interfaces
└── __tests__/                     ← Jest test files
```

---

## Phase Checklist Overview

| Phase | What you build | Est. time |
|---|---|---|
| Phase 1 | Project setup + folder structure | 1–2 sessions |
| Phase 2 | Database schema + seed data | 1 session |
| Phase 3 | Authentication (NextAuth) | 2 sessions |
| Phase 4 | Dashboard layout + sidebar | 1–2 sessions |
| Phase 5 | Dashboard page — KPIs + charts | 2 sessions |
| Phase 6 | Revenue page — transactions table | 2 sessions |
| Phase 7 | Expenses page — CRUD | 1–2 sessions |
| Phase 8 | Customers page | 1 session |
| Phase 9 | RBAC — roles + route guards | 1 session |
| Phase 10 | Admin users page | 1 session |
| Phase 11 | AI — insights + anomaly detection | 2 sessions |
| Phase 12 | AI — natural language query | 2 sessions |
| Phase 13 | AI — report generator | 1 session |
| Phase 14 | Settings + dark mode | 1 session |
| Phase 15 | Pricing page + feature gating | 1 session |
| Phase 16 | Performance + final polish | 1–2 sessions |
| Phase 17 | Deploy to Vercel | 1 session |

---

---

# PHASE 1 — Project Setup + Folder Structure

## What you are building
A working Next.js 14 project with TypeScript, Tailwind, Prisma, and all dependencies installed. Nothing visible yet — just a clean, runnable foundation.

## Claude Code prompts to run (in order)

```
1. "Create a new Next.js 14 project called fintrack using the App Router, TypeScript, and Tailwind CSS. Set up the complete folder structure with these directories: app/(auth), app/(dashboard), app/admin, app/api, components/ui, components/charts, components/tables, components/layout, lib, prisma, hooks, types, __tests__"

2. "Install these dependencies: @prisma/client prisma next-auth@beta @auth/prisma-adapter @tanstack/react-query @tanstack/react-table recharts react-hook-form @hookform/resolvers zod openai papaparse @types/papaparse"

3. "Create a lib/prisma.ts singleton, a lib/utils.ts with a cn() classname helper using clsx and tailwind-merge, and a lib/openai.ts that initialises the OpenAI client from environment variable OPENAI_API_KEY"

4. "Create a .env.local file template with these variables: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, OPENAI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
```

## What gets implemented
- Next.js 14 App Router project scaffold
- TypeScript configuration
- Tailwind CSS with dark mode set to `class`
- Prisma initialised (no schema yet)
- All npm dependencies installed
- Environment variable template
- Utility helpers: `cn()`, prisma singleton, openai client

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Dev server starts | Run `npm run dev` | Opens on localhost:3000 without errors |
| TypeScript compiles | Run `npx tsc --noEmit` | Zero type errors |
| Tailwind works | Add a `className="text-red-500"` to page.tsx | Text appears red |
| Imports resolve | Import `cn` from `lib/utils` in a component | No module not found error |

## Debugging checklist
- If `npm run dev` fails → check Node.js version is 18+
- If Tailwind classes don't apply → check `tailwind.config.ts` content array includes `./app/**/*.tsx` and `./components/**/*.tsx`
- If Prisma import fails → run `npx prisma generate` first
- If dark mode doesn't work → ensure `darkMode: 'class'` is set in `tailwind.config.ts`

## Definition of done (Phase 1)
- [ ] `npm run dev` runs without errors
- [ ] `npx tsc --noEmit` passes
- [ ] All folders exist as per structure above
- [ ] `.env.local` file exists with all variable names (values empty is fine)
- [ ] `lib/prisma.ts`, `lib/utils.ts`, `lib/openai.ts` created

---

---

# PHASE 2 — Database Schema + Seed Data

## What you are building
The complete PostgreSQL schema with 5 tables: User, Transaction, Expense, Customer, and AuditLog. Plus a seed script that fills the database with realistic-looking mock data so the dashboard never looks empty.

## Claude Code prompts to run

```
1. "Create the Prisma schema in prisma/schema.prisma with these models: User (id, email, name, password, role enum [ADMIN, MANAGER, VIEWER], createdAt), Transaction (id, date, description, amount, category, type [INCOME/EXPENSE], userId), Expense (id, date, description, amount, category, recurring, userId), Customer (id, name, email, plan enum [FREE, PRO, ENTERPRISE], mrr, status, churnRisk, joinedAt, userId), AuditLog (id, action, entity, entityId, userId, createdAt). Set up PostgreSQL provider."

2. "Run prisma migrate dev --name init to create the database tables"

3. "Create prisma/seed.ts that inserts: 3 users (1 admin, 1 manager, 1 viewer), 500 transactions spread across 12 months with realistic revenue amounts, 100 expense entries across categories (Payroll, Infrastructure, Marketing, SaaS Tools, Other), 50 customers with mixed plans and MRR values between $29 and $999, and realistic MRR growth from $8000 to $24800 over 12 months"

4. "Add seed script to package.json and run npx prisma db seed"
```

## What gets implemented
- 5 database tables with relationships
- Role enum (ADMIN / MANAGER / VIEWER)
- 500+ rows of seed data
- MRR history calculable from transaction data
- Realistic churn risk flags on some customers

## Data shape to verify after seeding

```
Users:       3 rows  (admin@fintrack.com / manager@fintrack.com / viewer@fintrack.com)
Transactions: 500 rows  (mix of INCOME and EXPENSE types)
Expenses:    100 rows  (5 categories)
Customers:    50 rows  (mix of FREE/PRO/ENTERPRISE plans)
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Schema migrates | `npx prisma migrate dev` | No errors, tables created |
| Seed runs | `npx prisma db seed` | "Seeding complete" log |
| Data exists | Open Prisma Studio `npx prisma studio` | All tables have rows |
| Relations work | Query a transaction with its user | User object nested correctly |
| MRR totals | Sum customer.mrr in Prisma Studio | Should be ~$24,800 |

## Debugging checklist
- If migration fails → check DATABASE_URL in .env.local is correct format: `postgresql://user:password@host:5432/dbname`
- If seed fails with type error → ensure seed.ts has `import { PrismaClient } from '@prisma/client'`
- If Prisma Studio is blank → run `npx prisma generate` then retry
- If password hashing needed → install bcryptjs and hash the seed passwords

## Definition of done (Phase 2)
- [ ] `npx prisma migrate dev` completes with no errors
- [ ] `npx prisma db seed` completes with no errors
- [ ] Prisma Studio shows data in all 5 tables
- [ ] Correct row counts match the table above
- [ ] Relations between tables work (transaction → user, customer → user)

---

---

# PHASE 3 — Authentication (NextAuth.js v5)

## What you are building
Login and register pages with email/password auth and Google OAuth. Protected routes that redirect unauthenticated users to /login. Session available throughout the app.

## Claude Code prompts to run

```
1. "Set up NextAuth.js v5 in lib/auth.ts with Prisma adapter, credentials provider (email + bcrypt password), and Google OAuth provider. Export auth, signIn, signOut helpers."

2. "Create app/api/auth/[...nextauth]/route.ts that exports GET and POST handlers from the auth config"

3. "Create app/(auth)/login/page.tsx with a clean login form using React Hook Form + Zod validation. Fields: email, password. Show error messages inline. Include a Google Sign In button. Link to /register."

4. "Create app/(auth)/register/page.tsx with register form: name, email, password, confirm password. Hash password with bcryptjs before saving to database via a POST /api/auth/register endpoint."

5. "Create middleware.ts at the project root that protects all /dashboard, /revenue, /expenses, /customers, /reports, /settings, /admin routes — redirect to /login if no session"

6. "Create a useSession hook wrapper and add session provider to app/layout.tsx"
```

## What gets implemented
- NextAuth.js v5 with Prisma adapter
- Email + password login with bcrypt
- Google OAuth login
- Register page with API route
- Middleware route protection
- Session context available app-wide
- Zod validation on both forms
- Inline error messages

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Login with valid credentials | Use admin@fintrack.com + seeded password | Redirects to /dashboard |
| Login with wrong password | Enter wrong password | "Invalid credentials" error shown inline |
| Login with unknown email | Enter random email | "Invalid credentials" error (don't reveal if email exists) |
| Empty form submit | Click login with empty fields | Zod validation errors shown |
| Protected route redirect | Visit /dashboard while logged out | Redirects to /login |
| Session persists | Login → refresh page | Still logged in |
| Logout | Click logout | Redirects to /login, session cleared |
| Register new user | Fill register form | User created, redirected to /dashboard |
| Duplicate email register | Register with existing email | "Email already in use" error |

## Debugging checklist
- If Google OAuth fails → check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local, ensure redirect URI `http://localhost:3000/api/auth/callback/google` is added in Google Console
- If session is undefined → ensure SessionProvider wraps the app in layout.tsx
- If middleware redirects logged-in users → check matcher pattern excludes `/api/auth`
- If bcrypt compare fails → ensure password was hashed with same rounds (10) during registration
- If "prisma adapter" error → run `npx prisma generate` and restart dev server

## Definition of done (Phase 3)
- [ ] Login with seeded admin account works
- [ ] Wrong password shows inline error
- [ ] Visiting /dashboard while logged out redirects to /login
- [ ] Register creates a new user in database (verify in Prisma Studio)
- [ ] Session persists across page refresh
- [ ] Logout clears session

---

---

# PHASE 4 — Dashboard Layout + Sidebar

## What you are building
The main shell that wraps all authenticated pages: a collapsible sidebar with navigation links, a top header with user avatar + logout, and a responsive layout that collapses to a hamburger menu on mobile.

## Claude Code prompts to run

```
1. "Create components/layout/Sidebar.tsx with navigation links to: Dashboard, Revenue, Expenses, Customers, Reports, Settings. Show active link with highlight. Include FinTrack logo at top. Make it collapsible — store collapsed state in localStorage."

2. "Create components/layout/Header.tsx with: page title (dynamic), user avatar showing initials, dropdown menu with Profile and Logout options, and a dark mode toggle button."

3. "Create app/(dashboard)/layout.tsx that combines Sidebar + Header and wraps all dashboard pages. On mobile (< 768px), sidebar should be a drawer triggered by hamburger icon."

4. "Add a Loading skeleton component and an ErrorBoundary component that show when pages are loading or errored."
```

## What gets implemented
- Sidebar with all 6 nav links + active state
- Collapsible sidebar (desktop) + drawer (mobile)
- Header with user info + logout dropdown
- Dark mode toggle (applies `dark` class to `<html>`)
- Responsive layout breakpoints
- Loading and error states

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Sidebar renders | Visit /dashboard | All 6 nav links visible |
| Active link highlights | Visit /revenue | Revenue link is visually highlighted |
| Collapse sidebar | Click collapse button | Sidebar narrows to icon-only width |
| Collapse persists | Collapse → refresh | Still collapsed after refresh |
| Mobile layout | Resize window to 375px | Sidebar hidden, hamburger visible |
| Hamburger opens drawer | Click hamburger on mobile | Sidebar slides in as overlay |
| Dark mode toggle | Click toggle | Page switches to dark theme |
| Dark mode persists | Toggle dark → refresh | Still dark after refresh |
| Logout works | Click logout in dropdown | Redirected to /login |
| User initials | Logged in as "John Doe" | Avatar shows "JD" |

## Debugging checklist
- If sidebar links don't highlight → check you're using `usePathname()` from next/navigation to compare current path
- If dark mode flashes on load → add `suppressHydrationWarning` to `<html>` tag and set initial theme in a script tag before React loads
- If mobile drawer overlaps content → check z-index and that a backdrop overlay closes it on click
- If layout breaks on small screens → check `overflow-hidden` on the outer wrapper div

## Definition of done (Phase 4)
- [ ] All nav links work and correct one is highlighted
- [ ] Sidebar collapses/expands on desktop
- [ ] Mobile hamburger + drawer works at 375px
- [ ] Dark mode toggles and persists across refresh
- [ ] User name/initials shows in header
- [ ] Logout from header dropdown works

---

---

# PHASE 5 — Dashboard Page (KPIs + Charts)

## What you are building
The main /dashboard page with 6 KPI metric cards, a 12-month MRR line chart, a revenue vs expenses bar chart, and an expense breakdown donut chart. All data comes from the database via API routes + React Query.

## Claude Code prompts to run

```
1. "Create app/api/dashboard/route.ts that returns: total MRR (sum of customer.mrr), total revenue YTD, total expenses this month, net profit, churn rate, active customer count, MRR by month for last 12 months (for line chart), revenue vs expenses by month (for bar chart), expense breakdown by category (for donut chart). Use Prisma aggregation queries. Protect route with auth session check."

2. "Create hooks/useDashboard.ts using React Query that fetches from /api/dashboard with a staleTime of 60 seconds."

3. "Create components/charts/MRRLineChart.tsx using Recharts LineChart. Show 12 months on x-axis, MRR value on y-axis. Show tooltip with formatted dollar value on hover."

4. "Create components/charts/RevenueExpensesBarChart.tsx using Recharts BarChart with two bars per month — Revenue (green) and Expenses (red)."

5. "Create components/charts/ExpenseDonutChart.tsx using Recharts PieChart showing expense categories as donut segments with legend."

6. "Create components/ui/KPICard.tsx that accepts: label, value, change (percentage vs last month), and trend direction. Show green up arrow for positive change, red down arrow for negative."

7. "Create app/(dashboard)/dashboard/page.tsx that uses useDashboard hook and composes KPICard × 6 + all 3 charts. Add date range filter (7d / 30d / 90d) that refetches data with query params."
```

## What gets implemented
- GET /api/dashboard with 8+ aggregated data points
- 6 KPI cards: MRR, Revenue YTD, Expenses, Net Profit, Churn Rate, Active Customers
- MRR line chart — 12 months
- Revenue vs expenses grouped bar chart
- Expense breakdown donut chart
- Date range filter with query param refetch
- Loading skeletons while data fetches
- All dollar values formatted as `$XX,XXX`

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| KPIs load | Visit /dashboard | 6 cards show real values from DB |
| MRR value correct | Compare card to `SELECT SUM(mrr) FROM customers` | Values match |
| Line chart renders | Check dashboard | 12 data points on x-axis |
| Bar chart renders | Check dashboard | Grouped bars for each month |
| Donut chart renders | Check dashboard | Slices with category labels |
| Date filter 7d | Click "7 days" | Charts rerender with filtered data |
| Date filter 30d | Click "30 days" | Charts rerender with filtered data |
| Loading state | Throttle network in DevTools | Skeleton cards show during load |
| No data state | Query returns 0 rows | Empty state message shown |
| Responsive charts | Resize to mobile | Charts resize without overflow |

## Debugging checklist
- If charts show nothing → check Recharts `ResponsiveContainer` has a parent with explicit height (e.g., `h-64`)
- If MRR value is wrong → check Prisma aggregation uses `_sum: { mrr: true }` not `count`
- If React Query fetches on every render → ensure `queryKey` includes the date range param
- If API returns 401 → check `getServerSession` is called correctly in the route handler
- If date filter doesn't refetch → ensure the filter value is in the `queryKey` array

## Definition of done (Phase 5)
- [ ] All 6 KPI cards show correct values (verify against Prisma Studio)
- [ ] All 3 charts render with real data
- [ ] Date range filter changes chart data
- [ ] Loading skeleton visible when network is slow
- [ ] Page works in dark mode
- [ ] Mobile layout — charts don't overflow

---

---

# PHASE 6 — Revenue Page (Transactions Table)

## What you are building
A full data table of all transactions with sorting, filtering, search, and CSV upload. The table handles 500+ rows smoothly using TanStack Table virtualisation.

## Claude Code prompts to run

```
1. "Create app/api/revenue/route.ts with GET (paginated transactions with search/filter/sort query params) and POST (create new transaction). Protect with auth."

2. "Create components/tables/TransactionsTable.tsx using TanStack Table v8 with: columns for Date, Description, Category, Type, Amount. Enable column sorting on all columns. Add search input that filters by description. Add category filter dropdown. Add type filter (Income/Expense). Show row count."

3. "Add pagination to the table — show 50 rows per page with Previous/Next buttons and page indicator."

4. "Create a CSVUpload component that accepts drag-and-drop or file picker for .csv files. Parse with papaparse. Show a preview of first 5 rows. On confirm, POST to /api/revenue/bulk with the parsed rows."

5. "Add an Export CSV button that downloads the current filtered/sorted data as a .csv file."

6. "Create app/(dashboard)/revenue/page.tsx combining the table, CSV upload, and an Add Transaction button that opens a modal form."
```

## What gets implemented
- Paginated transaction table (50 rows/page)
- Sort by any column (asc/desc toggle)
- Text search on description
- Filter by category and type
- CSV drag-and-drop upload with preview
- Bulk import API route
- Export filtered data as CSV
- Add transaction modal with form validation
- Row count display

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Table loads | Visit /revenue | 500 transactions shown, paginated |
| Sort by date | Click Date column header | Rows reorder by date |
| Sort by amount | Click Amount column header | Rows reorder by amount |
| Search works | Type "subscription" in search | Only matching rows shown |
| Category filter | Select "Marketing" | Only Marketing transactions shown |
| Pagination | Click Next page | Next 50 rows shown |
| CSV upload | Drop a valid CSV | Preview shown before import |
| CSV import | Confirm CSV upload | New rows appear in table |
| CSV invalid | Drop a non-CSV file | Error message shown |
| Export CSV | Click Export | Browser downloads .csv file with current data |
| Add transaction | Click Add → fill form → save | New row appears in table |
| Form validation | Submit empty form | Zod error messages shown |

## Debugging checklist
- If table sorts client-side only → make sure sort params are sent to API via query string for server-side sort
- If CSV parse fails → check papaparse config has `header: true` and `skipEmptyLines: true`
- If bulk insert is slow → use `prisma.transaction.createMany()` instead of a loop
- If export downloads empty file → check you're passing the filtered dataset, not the raw API response
- If pagination resets on filter change → reset `pageIndex` to 0 whenever a filter changes

## Definition of done (Phase 6)
- [ ] Table shows 500 transactions paginated correctly
- [ ] Sort, search, and filter all work
- [ ] CSV upload previews and imports correctly
- [ ] Export downloads a valid .csv
- [ ] Add transaction form works with validation
- [ ] Page works in dark mode

---

---

# PHASE 7 — Expenses Page (CRUD)

## What you are building
A page to view, add, edit, and delete expense entries. Includes a monthly budget vs actual bar chart and category breakdown.

## Claude Code prompts to run

```
1. "Create app/api/expenses/route.ts with full CRUD: GET (all expenses, filterable by month/category), POST (create), PUT (update by id), DELETE (delete by id). Auth protected."

2. "Create app/(dashboard)/expenses/page.tsx with: an expenses table (Date, Description, Category, Amount, Recurring badge), an Add Expense button, Edit and Delete buttons per row."

3. "Create an ExpenseForm component (used in both Add and Edit modals) with React Hook Form + Zod: date picker, description, amount, category select, recurring checkbox."

4. "Add a monthly budget vs actual bar chart above the table using Recharts. Budget line is a fixed target (set in settings later), actual is the real expense total."

5. "Add a category summary row below the table showing total per category this month."
```

## What gets implemented
- Full CRUD for expenses (create, read, update, delete)
- Inline edit and delete per row
- Recurring expense badge
- Budget vs actual chart
- Category monthly totals summary
- Form validation with Zod

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Expenses load | Visit /expenses | All expense rows shown |
| Add expense | Click Add → fill form | New row appears, DB updated |
| Edit expense | Click Edit on a row | Form pre-fills, save updates row |
| Delete expense | Click Delete | Row removed with confirmation dialog |
| Recurring badge | View a recurring expense row | "Recurring" badge visible |
| Category filter | Filter by "Payroll" | Only payroll expenses shown |
| Budget chart renders | View page | Bar chart shows budget vs actual |
| Category totals | View bottom summary | Totals match sum of filtered rows |

## Debugging checklist
- If edit form doesn't pre-fill → check you're passing the selected row's data to the form `defaultValues`
- If delete doesn't remove row → check the DELETE route uses `params.id` correctly and React Query `invalidateQueries` is called after
- If recurring filter breaks → check the boolean is stored correctly in Postgres (not as string "true")

## Definition of done (Phase 7)
- [ ] Can add, edit, delete expenses
- [ ] Recurring badge shows correctly
- [ ] Budget vs actual chart renders
- [ ] Category totals are accurate
- [ ] All changes persist after page refresh

---

---

# PHASE 8 — Customers Page

## What you are building
A customer list showing plan, MRR contribution, status, and an AI-flagged churn risk badge. Clicking a customer opens a detail modal with their MRR history chart.

## Claude Code prompts to run

```
1. "Create app/api/customers/route.ts with GET (all customers with optional plan/status filter) and POST (create customer)."

2. "Create app/(dashboard)/customers/page.tsx with a table: Name, Email, Plan badge (color-coded: FREE=gray, PRO=blue, ENTERPRISE=purple), MRR, Status, Churn Risk badge."

3. "Create a CustomerDetailModal that opens on row click showing: customer info, their MRR over last 6 months as a small line chart, payment history."

4. "Add plan filter (All / Free / Pro / Enterprise) and status filter (Active / Churned) above the table."
```

## What gets implemented
- Customer table with color-coded plan badges
- Churn risk badge (pre-set in seed data, AI-powered in Phase 11)
- Customer detail modal with MRR history chart
- Plan and status filters

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Customers load | Visit /customers | All 50 customers shown |
| Plan badges | View table | FREE=gray, PRO=blue, ENTERPRISE=purple |
| Churn risk badge | Check seeded data | Some customers have "At Risk" badge |
| Filter by plan | Select PRO | Only PRO customers shown |
| Customer detail | Click a row | Modal opens with customer info + chart |
| MRR history chart | Open any customer modal | Line chart shows last 6 months |

## Debugging checklist
- If modal doesn't open → check `useState` for selected customer is properly set on row click
- If plan badge color is wrong → ensure Tailwind classes for dynamic colors are in the safelist (Tailwind purges dynamic classes)

## Definition of done (Phase 8)
- [ ] All 50 customers visible with correct plan badges
- [ ] Plan and status filters work
- [ ] Clicking a row opens the detail modal
- [ ] MRR history chart renders inside modal

---

---

# PHASE 9 — RBAC (Role-Based Access Control)

## What you are building
Three user roles with different permissions enforced on both the frontend (hide UI elements) and backend (API route guards). This is one of the most important things to explain in interviews.

## Permissions Matrix

| Feature | Admin | Manager | Viewer |
|---|---|---|---|
| View all pages | Yes | Yes | Yes |
| Add/Edit/Delete transactions | Yes | Yes | No |
| Add/Edit/Delete expenses | Yes | Yes | No |
| Add/Edit/Delete customers | Yes | Yes | No |
| Access /admin/users | Yes | No | No |
| Export CSV | Yes | Yes | No |
| Use AI features | Yes | Yes | No |
| Change user roles | Yes | No | No |

## Claude Code prompts to run

```
1. "Create lib/permissions.ts that exports a canDo(session, action) function checking role permissions for actions: WRITE_DATA, DELETE_DATA, EXPORT_DATA, USE_AI, MANAGE_USERS."

2. "Update all API routes to check permissions using canDo() — return 403 Forbidden for unauthorised roles."

3. "Create a withPermission HOC and a usePermission hook that components can use to conditionally render buttons (e.g. hide Delete button for Viewer role)."

4. "Update the sidebar to hide the /admin/users link for non-Admin users."

5. "For AI feature buttons — show them to all users but display an upgrade/permission modal when Viewer clicks them."
```

## What gets implemented
- `canDo()` server-side permission checker
- `usePermission()` client-side hook
- All write API routes return 403 for Viewer
- Delete and Edit buttons hidden for Viewer in UI
- Admin-only /admin/users link in sidebar
- Permission-denied modal for restricted actions

## Test cases

| Test | Log in as | Expected result |
|---|---|---|
| Viewer sees no delete buttons | viewer@fintrack.com | Delete buttons not visible in tables |
| Viewer cannot POST transaction | viewer — API call | Returns 403 Forbidden |
| Viewer sees no admin link | viewer@fintrack.com | No "Users" link in sidebar |
| Manager can add transaction | manager@fintrack.com | Add Transaction works |
| Manager cannot access admin | Visit /admin/users as manager | Redirected away |
| Admin has full access | admin@fintrack.com | All buttons and pages accessible |

## Debugging checklist
- If 403 still reaches the database → ensure `canDo()` is called BEFORE the Prisma query in the route handler
- If Viewer can still see buttons → check `usePermission()` is correctly reading the session role, not a hardcoded value
- If admin link flickers → use `useSession()` to check role before rendering, add a loading state

## Definition of done (Phase 9)
- [ ] Login as viewer → no delete/edit/export buttons visible
- [ ] API call as viewer (via Postman or DevTools) returns 403
- [ ] Viewer cannot reach /admin/users
- [ ] Admin has complete access
- [ ] All 3 test accounts work correctly

---

---

# PHASE 10 — Admin Users Page

## What you are building
An admin-only page to view all users, change their roles, invite new users by email, and deactivate accounts.

## Claude Code prompts to run

```
1. "Create app/api/users/route.ts with: GET all users (admin only), POST invite user (send email), PATCH change role, DELETE deactivate account."

2. "Create app/admin/users/page.tsx with a users table: Name, Email, Role badge, Status, Last Login, Actions (Change Role dropdown, Deactivate button)."

3. "Add an Invite User button that opens a modal with email input. On submit, create a user record with a temporary password and show it once."
```

## What gets implemented
- Users table with role badges
- Change role dropdown (Admin only)
- Invite by email modal
- Deactivate account (soft delete — sets status to INACTIVE)
- Page protected: non-admins redirected

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Page loads for admin | Login as admin, visit /admin/users | 3 users shown |
| Page blocked for manager | Login as manager, visit /admin/users | Redirected |
| Change role | Change viewer to manager | Role badge updates, user now has manager permissions |
| Invite user | Enter new email | User record created, temp password shown |
| Deactivate user | Click Deactivate | User status changes, they can no longer login |

## Debugging checklist
- If role change doesn't affect permissions immediately → make sure the session is reloaded after role update (NextAuth `update()` trigger)
- If deactivated user can still login → add a status check in the credentials provider

## Definition of done (Phase 10)
- [ ] /admin/users shows all users
- [ ] Non-admin cannot access the page
- [ ] Role change works and new role is enforced
- [ ] Invite user creates a record
- [ ] Deactivated user cannot login

---

---

# PHASE 11 — AI Features: Insights + Anomaly Detection

## What you are building
Two AI features on the dashboard: a "Explain my data" button that summarises the current metrics in plain English, and automatic anomaly badges that flag unusual spikes or drops on charts.

## Claude Code prompts to run

```
1. "Create app/api/ai/insights/route.ts that accepts the current dashboard metrics as JSON, sends them to gpt-4o-mini with a system prompt asking for a 3-bullet plain English summary for a business owner, and streams the response back."

2. "Add an 'Explain my data' button to the dashboard page that calls this endpoint and shows the AI response in a slide-in panel. Stream the text as it arrives."

3. "Create app/api/ai/anomaly/route.ts that accepts a monthly data series, calculates mean and standard deviation, identifies months where value is more than 2 standard deviations from the mean, and returns flagged months with a short explanation."

4. "Add anomaly detection to the MRR and Revenue charts — call the anomaly endpoint on page load and add a warning badge (!) on flagged data points in the chart."
```

## What gets implemented
- POST /api/ai/insights — takes metrics JSON, returns streamed 3-bullet summary
- Streaming response rendered in real time in the UI
- POST /api/ai/anomaly — statistical + AI-flagged anomalies
- Visual anomaly badges on chart data points
- API key read from environment variable (never exposed to client)
- Rate limiting: max 10 AI calls per user per hour (via a simple in-memory counter)

## System prompts used

**Insights prompt:**
```
You are a financial analyst assistant. Given these business metrics, write exactly 3 bullet points in plain English for a non-technical business owner. Be specific with numbers. Be concise — max 20 words per bullet.
```

**Anomaly prompt:**
```
You are a data analyst. Given monthly financial data, identify any months with unusual values and explain why they stand out. Return a JSON array of {month, reason} objects.
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Insights button triggers API | Click "Explain my data" | Loading spinner then streamed text |
| Response is streamed | Watch the panel | Text appears word by word |
| Response has 3 bullets | Read the response | Exactly 3 bullet points |
| Anomaly detected | Seed data has a spike month | That month's chart point has a badge |
| No anomaly on flat data | Replace seed data with flat values | No badges appear |
| API key not exposed | Check browser network tab | OpenAI key never visible in responses |
| Rate limit enforced | Call insights 11 times fast | 11th call returns 429 error |

## Debugging checklist
- If streaming doesn't work → ensure the route uses `new Response(stream)` with proper headers, not `NextResponse.json()`
- If OpenAI times out → add `timeout: 30000` to the OpenAI client config
- If anomaly badges don't appear on chart → Recharts custom dot needs to check the anomaly list by month index
- If API key appears in client bundle → ensure the API route is a SERVER route (no `'use client'` directive)

## Definition of done (Phase 11)
- [ ] "Explain my data" button works and streams real AI text
- [ ] Response consistently returns 3 bullets with real metric values
- [ ] At least one chart data point shows an anomaly badge (verify with seeded spike data)
- [ ] OpenAI API key is NOT visible in browser DevTools Network tab
- [ ] Works in dark mode

---

---

# PHASE 12 — AI: Natural Language Query

## What you are building
A query bar on the /reports page where users can type plain English like "show revenue from PRO customers in Q3" and get a filtered chart rendered automatically. This is the most impressive demo feature.

## Claude Code prompts to run

```
1. "Create app/api/ai/query/route.ts that accepts a natural language query string, sends it to gpt-4o-mini with a system prompt describing the available data schema (transactions, customers, dates, categories, plans), and asks it to return a structured JSON filter object like {dateFrom, dateTo, type, category, plan, groupBy}."

2. "Create app/(dashboard)/reports/page.tsx with a large search bar at the top: 'Ask anything about your data...'. Below it, show the interpreted filter as a human-readable sentence (e.g. 'Showing PRO customer revenue from July to September 2024'). Then render a chart and table with the filtered results."

3. "Add 4 example query chips below the search bar that auto-fill common queries: 'Show MRR growth this year', 'Top 5 expense categories', 'Customers who joined last month', 'Revenue vs expenses Q3'"
```

## What gets implemented
- Natural language → structured filter JSON (via GPT)
- Filter applied to real database query
- Results rendered as chart + table
- Interpreted filter shown in plain English
- 4 example query chips
- Error handling: if AI returns invalid JSON, show "couldn't understand your query"

## Example flow

```
User types: "show expenses over $1000 in the last 3 months"
                       ↓
GPT returns: { "type": "EXPENSE", "amountMin": 1000, "dateFrom": "2024-09-01", "dateTo": "2024-11-30" }
                       ↓
Prisma query runs with those filters
                       ↓
"Showing 23 expenses over $1,000 from September to November 2024"
Chart + table renders
```

## Test cases

| Test | Query to type | Expected result |
|---|---|---|
| Date range query | "show revenue from last month" | Filters to previous month's data |
| Amount filter | "expenses over $500" | Only rows with amount > 500 |
| Plan filter | "enterprise customers" | Only ENTERPRISE plan customers |
| Category filter | "marketing expenses" | Only Marketing category |
| Example chip | Click "Top 5 expense categories" | Expense breakdown chart renders |
| Invalid query | Type "xkdj fdsf" | "Couldn't understand your query" shown |
| Empty query | Submit empty search | No API call made |

## Debugging checklist
- If GPT returns invalid JSON → wrap JSON.parse in try/catch, fall back to error message
- If filter doesn't apply → log the structured filter object and verify Prisma where clause is constructed correctly from it
- If chart doesn't update → check React Query `queryKey` includes the filter object

## Definition of done (Phase 12)
- [ ] "show revenue last month" returns correct filtered data
- [ ] Filter interpretation sentence shown above results
- [ ] Example chips work
- [ ] Invalid query shows friendly error message
- [ ] Results chart and table both update

---

---

# PHASE 13 — AI: Report Generator

## What you are building
A "Generate Report" button on the reports page that creates a full formatted weekly/monthly summary report using AI, then lets the user download it.

## Claude Code prompts to run

```
1. "Create app/api/ai/report/route.ts that: fetches this month's key metrics from the database, sends them to gpt-4o-mini asking for a structured monthly business report with sections: Executive Summary, Revenue Analysis, Expense Analysis, Customer Highlights, Key Risks, Recommendations. Return as formatted markdown."

2. "Add a 'Generate Monthly Report' button on /reports. On click, show a loading spinner, then render the AI markdown report in a preview panel with proper formatting."

3. "Add a Download as Text button that saves the rendered report as a .txt file named 'FinTrack-Report-[Month]-[Year].txt'"
```

## What gets implemented
- Full monthly report generated by AI with real data
- Markdown rendered in a styled preview panel
- Download as .txt
- Report sections: Summary, Revenue, Expenses, Customers, Risks, Recommendations

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Generate report | Click button | Loading spinner → report appears |
| Report has all sections | Read report | All 6 sections present |
| Report has real numbers | Check numbers in report | Match current DB values |
| Download works | Click Download | .txt file downloads with correct name |
| Report changes month to month | Change date range | Report reflects selected period |

## Debugging checklist
- If report is too generic → improve the system prompt to include specific metric values in the user message
- If markdown doesn't render → install and use `react-markdown` library
- If download fails → use `URL.createObjectURL(new Blob([text]))` pattern

## Definition of done (Phase 13)
- [ ] Report generates with real data values
- [ ] All 6 sections present in output
- [ ] Download saves a readable .txt file
- [ ] Works in dark mode

---

---

# PHASE 14 — Settings + Dark Mode

## What you are building
A settings page where users can update their profile, change password, toggle dark mode, and set a monthly expense budget.

## Claude Code prompts to run

```
1. "Create app/(dashboard)/settings/page.tsx with three sections: Profile (name, email), Security (change password form), Preferences (dark mode toggle, monthly expense budget input, currency selector)."

2. "Create app/api/settings/route.ts with PATCH endpoint to update user profile and preferences. Store preferences in a JSON column on the User model."

3. "Make the dark mode toggle on settings AND the header toggle stay in sync — both should read/write the same state (use localStorage + a context)."
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Update name | Change name, save | Header avatar initials update |
| Change password | Enter current + new password | Password updated, can login with new one |
| Wrong current password | Enter wrong current password | Error shown |
| Dark mode sync | Toggle in header | Settings toggle also flips |
| Budget saved | Set budget to $50,000 | Expenses page budget line updates |

## Definition of done (Phase 14)
- [ ] Profile update works
- [ ] Password change works with validation
- [ ] Dark mode toggle synced between header and settings
- [ ] Budget setting reflected on expenses chart

---

---

# PHASE 15 — Pricing Page + Feature Gating

## What you are building
A public-facing pricing page with 3 plans, and feature gating that locks AI features behind the Pro plan with an upgrade modal.

## Claude Code prompts to run

```
1. "Create app/pricing/page.tsx (public, no auth required) with 3 pricing cards: Free ($0/mo — 100 transactions, basic charts, no AI), Pro ($29/mo — unlimited transactions, all charts, AI insights), Enterprise ($99/mo — everything + priority support + custom reports). Highlight Pro as recommended."

2. "Add a userPlan field to the User model (FREE/PRO/ENTERPRISE, default FREE). For seeded admin user set to PRO."

3. "Create a PlanGate component that wraps AI feature buttons — if user is on FREE plan, clicking shows an upgrade modal linking to /pricing instead of calling the AI API."
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Pricing page loads | Visit /pricing (logged out) | 3 plan cards render |
| Pro card highlighted | View pricing | Pro card has distinct border/badge |
| Free user clicks AI | Login with Free-plan user | Upgrade modal appears |
| Pro user clicks AI | Login with Pro-plan user | AI feature works normally |

## Definition of done (Phase 15)
- [ ] Pricing page renders correctly at /pricing
- [ ] Free plan user sees upgrade modal on AI features
- [ ] Pro plan user can use all AI features

---

---

# PHASE 16 — Performance + Final Polish

## What you are building
Optimisations and polish that let you quote real metrics in your resume and make the app feel production-quality.

## Claude Code prompts to run

```
1. "Add React Query caching strategy: staleTime 60s for dashboard data, 30s for transactions. Add loading skeletons for all tables and charts."

2. "Add error boundaries to each page so one failing component doesn't crash the whole page."

3. "Run Lighthouse in Chrome DevTools on the deployed Vercel URL. Fix any performance issues to get score above 85."

4. "Add an Axios-style request interceptor in React Query's queryClient that logs slow requests (> 1s) to the console with timing."

5. "Add a toast notification system (use react-hot-toast) for all success and error actions (saved, deleted, exported, etc.)"
```

## Performance targets (for your resume)

| Metric | Target |
|---|---|
| Lighthouse Performance | > 85 |
| First Contentful Paint | < 2s |
| Dashboard API response | < 500ms |
| Table render (500 rows) | < 300ms |
| AI insight response | < 5s |

## Definition of done (Phase 16)
- [ ] Lighthouse score > 85 on Vercel deploy
- [ ] Loading skeletons on all async content
- [ ] Toast notifications on all mutations
- [ ] No unhandled promise rejections in console
- [ ] Error boundaries catch and display errors gracefully

---

---

# PHASE 17 — Deploy to Vercel

## What you are building
A live, publicly accessible URL for your portfolio. This is non-negotiable — projects without a live demo get ignored.

## Steps

```
1. Push code to GitHub (public repo)

2. Go to vercel.com → Import project → Select your GitHub repo

3. Add all environment variables in Vercel dashboard:
   DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL (your vercel URL), 
   OPENAI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

4. Set NEXTAUTH_URL to your actual Vercel URL (e.g. https://fintrack-demo.vercel.app)

5. Run prisma migrate deploy (not dev) via Vercel build command or manually

6. Run the seed script once on the production database

7. Update Google OAuth redirect URI to include your Vercel domain
```

## Post-deploy checklist

| Check | Expected |
|---|---|
| Homepage loads | No 500 errors |
| Login works | Can login with seeded accounts |
| Dashboard data shows | Real data from production DB |
| AI features work | OpenAI API responds correctly |
| HTTPS | padlock icon in browser |
| Google OAuth | Works with production redirect URI |

## Definition of done (Phase 17)
- [ ] Live URL is accessible publicly
- [ ] Login with admin@fintrack.com works
- [ ] Dashboard shows real data
- [ ] AI features work on production
- [ ] URL added to GitHub README and your resume

---

---

# Overall Resume Metric Targets

By the time all phases are done, you should be able to write:

> "Built FinTrack, a full-stack SaaS finance analytics dashboard using Next.js 14 App Router, TypeScript, Prisma + PostgreSQL, and NextAuth with 3-tier RBAC. Features include virtualised TanStack Table rendering 500+ transactions, Recharts dashboards with real-time date filtering, and an AI layer (GPT-4o-mini) with natural language data queries, anomaly detection, and automated monthly report generation. Achieved Lighthouse score 88+, dashboard API response < 500ms, and deployed on Vercel."

---

# What else to do after phases are complete

These are the things that make the difference between a portfolio project and a believable product:

1. **README.md** — Include: what the project does, tech stack badges, live URL, screenshots of the dashboard, and instructions to run locally. This is the first thing a recruiter sees.

2. **Demo credentials** — Add `admin@fintrack.com / password123` visibly on the login page so anyone can try it without registering.

3. **Seed data quality** — Make sure the seeded data tells a story: MRR growing month over month, one month with a suspicious spike (for anomaly detection demo), a mix of plan types.

4. **Screenshots in README** — Take 3-4 screenshots: dashboard overview, AI insights panel, natural language query result, customers table. Put them in the README on GitHub.

5. **Prepare your explanation** — For every AI feature, be ready to explain: what prompt you used, how you structured the API route, how you prevented the API key from leaking to the client, and what you'd do differently at scale.

---

*Document generated for Suryauday Prakash Mishra — FinTrack SaaS Project Plan*
