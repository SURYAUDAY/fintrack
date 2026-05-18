# FinTrack — SaaS Finance Analytics Dashboard
## Complete Build Plan (Phase-by-Phase) — with Stitch UI Prompts

> **How to use this document**
> Each phase = one chunk of work. Build it → design it in Stitch → convert to code → test → debug → mark done.
> When a phase is complete, say "Phase X done" and we move to the next one together.
> Claude Code in VS Code is your primary building tool — each phase includes exact prompts to use.

---

## How Stitch fits into your workflow

Stitch (stitch.withgoogle.com) generates **HTML + Tailwind CSS** from a text prompt. Your job after each Stitch export is to:

1. Go to stitch.withgoogle.com → sign in with Google account
2. Select **Web** layout → use **Experimental mode** (higher quality, uses Gemini 2.5 Pro)
3. Paste the Stitch prompt for the phase → generate → iterate with follow-up prompts
4. Click **View Code** → copy the HTML + Tailwind output
5. Give the copied code to Claude Code: *"Convert this HTML/Tailwind to a Next.js React component using TypeScript. Keep all class names. Replace static data with the props interface I describe."*
6. Wire the converted component to real data via React Query hooks

> **Important:** Stitch is a starting point, not the final code. Treat it like a very fast wireframe-to-HTML tool. Always convert to `.tsx` and connect real data through Claude Code.

---

## SaaS UI Design Principles (what your Stitch prompts will follow)

These are baked into every Stitch prompt below so your UI looks professional:

- **Color palette:** One primary brand color (slate blue `#3B5BDB`) + neutral grays. No rainbow dashboards.
- **Typography:** Inter font, 14px base, clear hierarchy (28px headings → 16px body → 12px labels)
- **Spacing:** 24px section gaps, 16px card padding — generous whitespace
- **Cards:** White background, 1px `#E2E8F0` border, 8px border radius, subtle shadow
- **Sidebar:** 240px fixed width, white background, icons + labels, active state with blue left border
- **Data density:** Never show more than 6 KPI cards on one row. Charts always have titles and axis labels.
- **Empty states:** Every table and chart has a friendly empty state illustration + message
- **Mobile breakpoints:** Sidebar collapses at 768px. Cards stack at 640px. Charts full-width at 480px.
- **WCAG AA compliance:** All text contrast ratios meet 4.5:1 minimum

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
| Deploy | Vercel |
| Testing | Jest + React Testing Library |

---

## Project Folder Structure

```
fintrack/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── revenue/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/users/page.tsx
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
│   ├── ui/
│   ├── charts/
│   ├── tables/
│   └── layout/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── openai.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── hooks/
├── types/
└── __tests__/
```

---

## Phase Checklist Overview

| Phase | What you build | Stitch screens to design |
|---|---|---|
| Phase 1 | Project setup | None |
| Phase 2 | Database + seed | None |
| Phase 3 | Authentication | Login + Register pages |
| Phase 4 | Dashboard layout | Sidebar + Header shell |
| Phase 5 | Dashboard KPIs + charts | Full dashboard page |
| Phase 6 | Revenue transactions table | Revenue page |
| Phase 7 | Expenses CRUD | Expenses page + modals |
| Phase 8 | Customers page | Customers page + detail modal |
| Phase 9 | RBAC | No new screens |
| Phase 10 | Admin users page | Admin users page |
| Phase 11 | AI insights + anomaly | AI panel component |
| Phase 12 | AI natural language query | Reports page |
| Phase 13 | AI report generator | Report preview panel |
| Phase 14 | Settings | Settings page |
| Phase 15 | Pricing page | Pricing page |
| Phase 16 | Polish + performance | Empty states + skeletons |
| Phase 17 | Deploy | None |

---
---

# PHASE 1 — Project Setup + Folder Structure

## What you are building
A working Next.js 14 project with TypeScript, Tailwind, Prisma, and all dependencies installed.

> No Stitch work in this phase — nothing to design yet.

## Claude Code prompts to run

```
1. "Create a new Next.js 14 project called fintrack using the App Router, TypeScript, and Tailwind CSS. Set darkMode to 'class' in tailwind.config.ts. Set up the complete folder structure with these directories: app/(auth), app/(dashboard), app/admin, app/api, components/ui, components/charts, components/tables, components/layout, lib, prisma, hooks, types, __tests__"

2. "Install these dependencies: @prisma/client prisma next-auth@beta @auth/prisma-adapter @tanstack/react-query @tanstack/react-table recharts react-hook-form @hookform/resolvers zod openai papaparse @types/papaparse clsx tailwind-merge"

3. "Create lib/prisma.ts singleton, lib/utils.ts with cn() helper using clsx and tailwind-merge, and lib/openai.ts that initialises the OpenAI client from OPENAI_API_KEY environment variable"

4. "Create .env.local with these variable names (values empty): DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, OPENAI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Dev server starts | Run `npm run dev` | Opens on localhost:3000 |
| TypeScript compiles | Run `npx tsc --noEmit` | Zero errors |
| Tailwind works | Add `className="text-red-500"` to page.tsx | Text is red |
| Dark mode configured | Check tailwind.config.ts | `darkMode: 'class'` present |

## Debugging checklist
- If `npm run dev` fails → check Node.js is version 18+
- If Tailwind classes don't apply → check content array in `tailwind.config.ts` includes `./app/**/*.tsx` and `./components/**/*.tsx`
- If Prisma import fails → run `npx prisma generate`

## Definition of done (Phase 1)
- [ ] `npm run dev` runs without errors
- [ ] `npx tsc --noEmit` passes
- [ ] All folders exist per structure above
- [ ] `.env.local` file exists with all variable names

---
---

# PHASE 2 — Database Schema + Seed Data

## What you are building
Complete PostgreSQL schema with 5 tables and a seed script with 500+ realistic rows.

> No Stitch work in this phase.

## Claude Code prompts to run

```
1. "Create the Prisma schema in prisma/schema.prisma with these models: User (id, email, name, password, role enum [ADMIN, MANAGER, VIEWER], plan enum [FREE, PRO, ENTERPRISE], createdAt), Transaction (id, date, description, amount, category, type [INCOME/EXPENSE], userId), Expense (id, date, description, amount, category, recurring, userId), Customer (id, name, email, plan, mrr, status, churnRisk, joinedAt), AuditLog (id, action, entity, entityId, userId, createdAt). PostgreSQL provider."

2. "Run: npx prisma migrate dev --name init"

3. "Create prisma/seed.ts that inserts: 3 users (admin@fintrack.com/Admin123!, manager@fintrack.com/Manager123!, viewer@fintrack.com/Viewer123! — hash passwords with bcryptjs), 500 transactions across 12 months with realistic SaaS revenue amounts ($500–$5000) and expense amounts ($100–$2000), 100 expense entries across 5 categories, 50 customers with mixed plans (20 FREE, 20 PRO, 10 ENTERPRISE), MRR growing from $8000 to $24800 over 12 months, and one month (month 8) with a revenue spike for anomaly detection demo."

4. "Add prisma seed script to package.json and run: npx prisma db seed"
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Migration runs | `npx prisma migrate dev` | No errors |
| Seed runs | `npx prisma db seed` | "Seeding complete" log |
| Data exists | `npx prisma studio` | All tables have rows |
| MRR total | Sum customer.mrr in Prisma Studio | ~$24,800 |
| Spike exists | View transactions month 8 | Noticeably higher values |

## Debugging checklist
- If migration fails → check DATABASE_URL format: `postgresql://user:pass@host:5432/dbname`
- If seed fails → ensure bcryptjs is installed: `npm install bcryptjs @types/bcryptjs`
- If Prisma Studio is blank → run `npx prisma generate` then retry

## Definition of done (Phase 2)
- [ ] All 5 tables created in database
- [ ] Seed data: 3 users, 500 transactions, 100 expenses, 50 customers
- [ ] All 3 login accounts work (verified in Prisma Studio — passwords hashed)
- [ ] Month 8 spike visible in transaction data

---
---

# PHASE 3 — Authentication

## What you are building
Login + register pages with full auth flow, Google OAuth, and route protection middleware.

---

## Stitch UI — Phase 3

### Screen 1: Login page

**Stitch prompt (use Experimental mode, Web layout):**
```
Design a professional SaaS login page for a finance analytics platform called FinTrack.

Layout: Centered card on a light gray (#F8FAFC) background. Card is white, 400px wide, 
rounded-xl, subtle box shadow.

Card contents (top to bottom):
- FinTrack logo: a small square icon in slate blue (#3B5BDB) with white "FT" initials, 
  followed by "FinTrack" in 24px semibold dark gray (#1E293B) text, centered
- 8px gap
- "Welcome back" in 20px medium gray (#475569), centered
- 32px gap
- "Continue with Google" button: full width, white background, 1px gray border, 
  Google multicolor G icon on left, "Continue with Google" text, hover state light gray
- "or" divider with lines on both sides, 16px text in muted gray
- Email input field: full width, label "Email address" above, placeholder 
  "you@company.com", 40px height, rounded-lg, 1px border
- Password input field: label "Password" above, show/hide toggle icon on right, 
  40px height
- "Forgot password?" link right-aligned in slate blue, 13px
- "Sign in" button: full width, solid slate blue (#3B5BDB), white text, 40px height, 
  rounded-lg, hover darkens slightly
- 24px gap
- "Don't have an account? Sign up" centered, "Sign up" in slate blue

No background illustrations. Clean, minimal, professional. Inter font throughout.
WCAG AA compliant contrast on all text.
```

**Follow-up refinement prompt if needed:**
```
Make the card have more breathing room — increase internal padding to 40px. 
Make the "Sign in" button slightly more rounded (rounded-xl). 
Add a subtle focus ring in slate blue on the input fields when focused.
```

---

### Screen 2: Register page

**Stitch prompt:**
```
Design a SaaS registration page for FinTrack finance analytics.

Same centered card layout as login page (white card, light gray background, 400px wide).

Card contents:
- FinTrack logo (same as login page — FT icon + FinTrack text, centered)
- "Create your account" in 20px medium gray, centered
- 32px gap
- Full name input field (label: "Full name", placeholder: "John Doe")
- Email input (label: "Work email", placeholder: "you@company.com")
- Password input with strength indicator bar below it 
  (4 segments: red=weak, orange=fair, yellow=good, green=strong)
- Confirm password input
- "Create account" full-width slate blue button
- "By creating an account you agree to our Terms of Service" in 12px muted gray, centered
- 24px gap
- "Already have an account? Sign in" centered

Same style as login: Inter font, WCAG AA, no illustrations.
```

---

### Claude Code conversion prompt (after Stitch export)

```
"Here is the HTML/Tailwind code exported from Stitch for the login page: [paste code].
Convert this to a Next.js TypeScript component at app/(auth)/login/page.tsx.
- Replace the form with React Hook Form + Zod validation
- Email field: required, valid email format
- Password field: required, min 8 characters  
- Show inline error messages below each field in red-500
- The Google button should call signIn('google') from next-auth/react
- The Sign in button should call signIn('credentials') with email and password
- Show a loading spinner on the button during submission
- On success redirect to /dashboard
- On error show 'Invalid email or password' above the form in a red alert box"
```

---

## Backend Claude Code prompts

```
1. "Set up NextAuth.js v5 in lib/auth.ts with Prisma adapter, credentials provider (email + bcrypt password check), and Google OAuth provider. Export auth, signIn, signOut."

2. "Create app/api/auth/[...nextauth]/route.ts exporting GET and POST handlers."

3. "Create app/api/auth/register/route.ts: POST endpoint that validates email uniqueness, hashes password with bcryptjs (10 rounds), creates user with FREE plan and VIEWER role, returns success."

4. "Create middleware.ts at project root protecting routes: /dashboard, /revenue, /expenses, /customers, /reports, /settings, /admin. Redirect to /login if no session. Allow /pricing and /api/auth/* through."

5. "Wrap app/layout.tsx with SessionProvider from next-auth/react."
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Login valid credentials | admin@fintrack.com + Admin123! | Redirects to /dashboard |
| Login wrong password | Wrong password | Inline "Invalid email or password" error |
| Empty form submit | Click Sign in with empty fields | Zod errors shown per field |
| Protected route | Visit /dashboard logged out | Redirects to /login |
| Session persists | Login → refresh | Still logged in |
| Register new user | Fill all fields | Redirected to /dashboard |
| Duplicate email | Register existing email | "Email already in use" error |
| Google button present | View login page | Google OAuth button visible |

## Debugging checklist
- If Google OAuth fails → add `http://localhost:3000/api/auth/callback/google` as authorized redirect URI in Google Console
- If session undefined → ensure SessionProvider wraps layout.tsx
- If bcrypt compare fails → ensure same salt rounds (10) in register and login
- If middleware redirects logged-in users → exclude `/api/auth` from the matcher

## Definition of done (Phase 3)
- [ ] Stitch designs exported and converted to Next.js components
- [ ] Login page looks clean and professional at 375px and 1280px
- [ ] Login with admin@fintrack.com works
- [ ] Wrong password shows inline error
- [ ] /dashboard while logged out redirects to /login
- [ ] Register creates user in database

---
---

# PHASE 4 — Dashboard Layout + Sidebar

## What you are building
The main shell: sidebar navigation, top header, responsive layout for all authenticated pages.

---

## Stitch UI — Phase 4

### Screen: App shell (sidebar + header + content area)

**Stitch prompt:**
```
Design the main application shell for FinTrack, a B2B SaaS finance analytics dashboard.

Overall layout: Two-column. Fixed sidebar on left (240px wide), main content on right.
Background: #F8FAFC (very light gray) for content area. White for sidebar.

SIDEBAR (240px, full height, white, 1px right border #E2E8F0):
- Top: FinTrack logo — blue square icon "FT" + "FinTrack" text in 16px semibold, 
  24px padding, 64px tall header area
- Navigation section label "MAIN MENU" in 11px uppercase tracking-widest muted gray, 
  16px left padding
- Nav items (48px tall each, 12px horizontal padding, 8px border-radius):
  - Dashboard (grid icon)
  - Revenue (trending-up icon)
  - Expenses (credit-card icon)
  - Customers (users icon)
  - Reports (bar-chart-2 icon)
  - Settings (settings icon)
  Each nav item: icon (20px, slate gray) + label (14px, slate gray)
  ACTIVE STATE: slate blue left border (3px), blue-50 background, icon and text in slate blue
- Bottom of sidebar: user avatar section — circular avatar with initials "JD", 
  name "John Doe" in 14px semibold, role "Admin" in 12px muted, 
  small logout icon on far right

HEADER (top of content area, 64px tall, white, 1px bottom border #E2E8F0):
- Left: Current page title "Dashboard" in 20px semibold #1E293B
- Right: dark mode toggle icon (sun/moon), notification bell with red badge "3", 
  user avatar circle with "JD" initials

CONTENT AREA PLACEHOLDER:
- Show a simple gray rectangle placeholder area with "Page content here" to 
  demonstrate the layout. Light gray background #F8FAFC.

RESPONSIVE NOTE in prompt: show a subtle hamburger menu icon in the header left side 
for when the sidebar collapses on mobile.

Style: Professional B2B SaaS. Inter font. No gradients. Clean flat design.
```

**Follow-up refinement prompts:**
```
1. "Make the sidebar nav items have a slightly taller height (52px) and add more 
   visible separation between the menu label and nav items."

2. "Add a thin collapse arrow button on the right edge of the sidebar, centered 
   vertically, to indicate the sidebar can collapse."
```

---

### Claude Code conversion prompt

```
"Convert this Stitch HTML/Tailwind sidebar + header layout to Next.js TypeScript components:

1. components/layout/Sidebar.tsx
   - Use Next.js Link for all nav items
   - Use usePathname() to detect active route and apply active styles
   - Store collapsed state in localStorage key 'sidebar-collapsed'
   - When collapsed, show only icons (width 64px), hide text labels
   - Read user name and role from useSession() hook

2. components/layout/Header.tsx  
   - Show dynamic page title based on current pathname
   - Dark mode toggle: reads/writes document.classList and localStorage 'theme' key
   - User dropdown on avatar click: Profile link + Logout button calling signOut()

3. app/(dashboard)/layout.tsx
   - Compose Sidebar + Header + children
   - On mobile (< 768px): sidebar hidden by default, shown as overlay drawer 
     when hamburger clicked
   - Add backdrop overlay that closes drawer on click"
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Sidebar renders all links | Visit /dashboard | 6 nav items visible |
| Active link highlighted | Visit /revenue | Revenue item has blue left border + blue bg |
| Sidebar collapses | Click collapse button | Narrows to 64px icon-only |
| Collapse persists on refresh | Collapse → refresh | Still collapsed |
| Mobile hamburger | Resize to 375px width | Hamburger visible, sidebar hidden |
| Dark mode toggle | Click moon icon | Page switches to dark |
| Dark mode persists | Toggle → refresh | Still dark after refresh |
| User name in sidebar | View bottom of sidebar | Shows logged-in user's name |
| Logout from header | Click avatar → Logout | Redirected to /login |

## Debugging checklist
- If active link doesn't highlight → `usePathname()` includes full path, use `pathname.startsWith('/revenue')` not strict equals for nested routes
- If dark mode flashes on load → add `<script>` before React hydration that reads localStorage and sets the class
- If mobile drawer overlaps incorrectly → set z-index: sidebar overlay > 40, backdrop > 30, content < 20

## Definition of done (Phase 4)
- [ ] Stitch design looks like a real SaaS sidebar — professional, not generic
- [ ] Active nav link correctly highlights for all 6 pages
- [ ] Sidebar collapse/expand works and persists
- [ ] Mobile drawer works at 375px
- [ ] Dark mode toggles and persists
- [ ] User info shows in sidebar and header

---
---

# PHASE 5 — Dashboard Page (KPIs + Charts)

## What you are building
The main /dashboard with 6 KPI cards, MRR line chart, revenue vs expenses bar chart, and expense donut chart.

---

## Stitch UI — Phase 5

### Screen: Full dashboard page

**Stitch prompt:**
```
Design the main dashboard page for FinTrack, a B2B SaaS finance analytics tool.
This sits inside the app shell (sidebar already built). Design only the content area.

PAGE HEADER ROW:
- Left: "Dashboard" in 24px semibold #1E293B, below it "Good morning, John 👋" 
  in 14px muted gray
- Right: Date range selector showing "Last 30 days" with a calendar icon, 
  dropdown arrow, and 3 quick buttons: "7d" "30d" "90d" (pill shaped, 
  active one in slate blue, others in white with border)

KPI CARDS ROW (6 cards in a CSS grid, 3 columns on desktop, 2 on tablet):
Each card is white, rounded-xl, 1px border #E2E8F0, 20px padding, subtle shadow.

Card 1 — MRR:
  Top: "Monthly Recurring Revenue" label 12px muted gray, trending-up icon right-aligned
  Middle: "$24,800" in 28px semibold #1E293B
  Bottom: green up-arrow + "+12% vs last month" in 13px green-600

Card 2 — Revenue YTD:
  Label: "Revenue (YTD)", icon: dollar-sign
  Value: "$1,200,000"
  Change: "+8% vs last year" in green

Card 3 — Expenses:
  Label: "Total Expenses", icon: credit-card
  Value: "$38,200"
  Change: "+4% vs last month" in red-500 (downward arrow)

Card 4 — Net Profit:
  Label: "Net Profit", icon: trending-up
  Value: "$9,100"
  Change: "+5% vs last month" in green

Card 5 — Churn Rate:
  Label: "Churn Rate", icon: users
  Value: "2.4%"
  Change: "-0.3% vs last month" in green (lower churn = good)

Card 6 — Active Customers:
  Label: "Active Customers", icon: user-check
  Value: "318"
  Change: "+22 this month" in green

CHARTS ROW (two charts side by side, 60% + 40% split):

Left chart — "MRR Growth" (60% width):
  Title "MRR Growth" 16px semibold, subtitle "Last 12 months" 12px muted
  Area line chart with smooth curve, slate blue line (#3B5BDB), 
  light blue fill below the line, x-axis shows months (Jan–Dec), 
  y-axis shows $K values, tooltip on hover

Right chart — "Expense Breakdown" (40% width):
  Title "Expenses by Category" 16px semibold
  Donut chart, 5 segments: Payroll (blue), Infrastructure (purple), 
  Marketing (orange), SaaS Tools (teal), Other (gray)
  Legend below chart with color dots and percentages
  Total amount in center of donut: "$38,200"

SECOND CHARTS ROW (full width):
  "Revenue vs Expenses" — grouped bar chart, 12 months on x-axis
  Two bars per month: Revenue (slate blue), Expenses (red-300)
  Legend top right: blue square "Revenue", red square "Expenses"
  Y-axis in $K format

AI INSIGHT PANEL (below charts):
  Light blue-50 background, rounded-xl, 1px blue-100 border, 20px padding
  Left: sparkle/AI icon in slate blue
  "AI Insights" label 14px semibold blue
  Placeholder text "Click 'Explain my data' to get AI-powered insights 
  about your current metrics" in 13px muted
  Right: "Explain my data →" button in slate blue outline style

Overall style: Professional B2B SaaS. Inter font. Generous whitespace. 
No gradients on cards. Charts are clean with labeled axes.
```

**Follow-up refinement prompts:**
```
1. "Make the KPI cards slightly taller — 120px minimum height. Add a thin colored 
   top border to each card matching its icon color."

2. "On the MRR line chart, add a small badge showing the peak month with an 
   annotation '↑ Peak: $26.2K' in August."

3. "Make the AI Insights panel more prominent — give it a thin sparkle/gradient 
   left border in blue-to-purple, and make the button more visually distinct."
```

---

### Claude Code conversion prompt

```
"Convert this Stitch HTML/Tailwind dashboard page to Next.js TypeScript.

1. Create components/ui/KPICard.tsx with props: 
   { label, value, change, changeType: 'positive'|'negative'|'neutral', icon }
   - positive = green text + up arrow
   - negative = red text + down arrow

2. Create components/charts/MRRLineChart.tsx using Recharts AreaChart
   - Props: { data: Array<{month: string, mrr: number}> }
   - Smooth curve, slate blue (#3B5BDB) stroke, light blue fill
   - ResponsiveContainer height 280px
   - Custom tooltip showing formatted dollar value

3. Create components/charts/RevenueExpensesBarChart.tsx using Recharts BarChart
   - Props: { data: Array<{month: string, revenue: number, expenses: number}> }
   - Two bars: revenue=#3B5BDB, expenses=#FCA5A5
   - Y-axis formatted as $Xk

4. Create components/charts/ExpenseDonutChart.tsx using Recharts PieChart
   - Props: { data: Array<{name: string, value: number, color: string}> }
   - Center label showing total amount
   - Custom legend below

5. Create app/(dashboard)/dashboard/page.tsx 
   - Use useDashboard() React Query hook to fetch from /api/dashboard
   - Show KPICard skeleton (gray pulse animation) while loading
   - Show chart skeletons (gray rounded rectangles) while loading
   - Pass real data to all chart components"
```

## Backend Claude Code prompts

```
1. "Create app/api/dashboard/route.ts returning: totalMRR, revenueYTD, totalExpenses, 
   netProfit, churnRate, activeCustomers, mrrByMonth (12 months array), 
   revenueVsExpensesByMonth (12 months), expenseByCategory. 
   Use Prisma aggregation. Protect with getServerSession auth check — return 401 if no session."

2. "Create hooks/useDashboard.ts using React Query: 
   queryKey: ['dashboard', dateRange], staleTime: 60000, 
   accepts dateRange param ('7d'|'30d'|'90d') and passes as query string"
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| KPI cards load | Visit /dashboard | 6 cards show real DB values |
| MRR matches DB | Compare card to `SELECT SUM(mrr) FROM customers` | Values match |
| Line chart renders | View dashboard | Smooth 12-point line chart |
| Bar chart renders | View dashboard | Grouped bars with legend |
| Donut chart renders | View dashboard | 5 colored segments with legend |
| Date filter 7d | Click "7d" | Charts rerender with 7 days of data |
| Loading skeleton | Throttle network in DevTools | Gray pulse skeletons visible |
| Dark mode | Toggle dark mode | All cards and charts adapt |
| Mobile layout | Resize to 375px | KPI cards stack to 1 column |

## Debugging checklist
- If charts render as empty → Recharts `ResponsiveContainer` needs a parent with explicit height (wrap in `<div className="h-64">`)
- If MRR is wrong → Prisma `_sum` aggregation, not `_count`
- If date filter doesn't refetch → ensure dateRange is in the `queryKey` array
- If KPI card change color is wrong → check changeType prop is passed correctly from the API response

## Definition of done (Phase 5)
- [ ] Dashboard looks professional — comparable to real SaaS tools (Baremetrics, ChartMogul)
- [ ] All 6 KPI cards show correct values
- [ ] All 3 charts render with real data and labeled axes
- [ ] Date range filter changes all chart data
- [ ] Loading skeletons visible during fetch
- [ ] Fully responsive — works at 375px, 768px, 1280px

---
---

# PHASE 6 — Revenue Page (Transactions Table)

## What you are building
Full transaction data table with sorting, filtering, search, CSV upload/export.

---

## Stitch UI — Phase 6

### Screen: Revenue transactions page

**Stitch prompt:**
```
Design the Revenue page for FinTrack SaaS finance dashboard. 
Content area only (sidebar already exists).

PAGE HEADER:
- "Revenue" title 24px semibold + "Manage and track all revenue transactions" 
  subtitle 14px muted gray
- Right side: "Upload CSV" button (outline style, upload icon), 
  "Export CSV" button (outline style, download icon), 
  "Add Transaction" button (solid slate blue, plus icon)

FILTER BAR (below header, white card, 12px padding):
- Search input (magnifying glass icon inside, placeholder "Search transactions...") 
  300px wide
- "Category" dropdown (All / SaaS / Consulting / Product / Other), 160px wide
- "Type" dropdown (All / Income / Expense), 140px wide
- "Date range" button with calendar icon
- Results count: "Showing 500 transactions" in 13px muted gray, right-aligned

DATA TABLE (white card, rounded-xl, 1px border):
Table headers: Checkbox | Date | Description | Category | Type | Amount | Actions
Header row: 12px uppercase tracking-wide muted gray background #F8FAFC

Row 1 (example): 
  Checkbox | Nov 15, 2024 | "Enterprise plan renewal — Acme Corp" | 
  SaaS badge (blue-100 bg, blue-700 text, rounded-full, 12px) | 
  Income badge (green-100 bg, green-700 text) | 
  "$4,200.00" in 14px semibold green | 
  Edit icon button + Delete icon button (both gray, hover shows color)

Row 2 (example — expense):
  Nov 14, 2024 | "AWS infrastructure — November" | 
  Infrastructure badge (purple-100/purple-700) | 
  Expense badge (red-100/red-700) | 
  "-$892.00" in red-600 | Edit + Delete

Show 5 rows total in the design to demonstrate the pattern.

PAGINATION (below table):
  Left: "Showing 1–50 of 500 results" in 13px muted
  Right: Previous button (disabled on page 1), page numbers 1 2 3 ... 10, Next button
  Buttons: 36px square, rounded-lg, current page in slate blue bg white text

CSV UPLOAD MODAL (show as overlay):
  White modal, rounded-xl, 400px wide, shadow
  Title: "Upload transactions" 18px semibold
  Drag-and-drop zone: dashed border, cloud-upload icon, 
  "Drag your CSV file here, or click to browse" 14px
  "Supports .csv files up to 5MB" 12px muted below
  After upload: show preview table with first 3 rows
  "Import X transactions" solid blue button, "Cancel" outline button

Style: Clean data-dense table. Comfortable row height 52px. 
Alternating row background (white / #FAFAFA). Hover state: blue-50 highlight.
```

**Follow-up refinement prompts:**
```
1. "Make the category and type badges use a more pill-like shape (border-radius: 9999px). 
   Each category should have a distinct color: SaaS=blue, Infrastructure=purple, 
   Marketing=orange, Consulting=teal, Other=gray."

2. "Add a subtle striped pattern to alternating table rows and make the hover 
   state more visible."
```

---

### Claude Code conversion prompt

```
"Convert this Stitch Revenue page HTML/Tailwind to Next.js TypeScript components:

1. components/tables/TransactionsTable.tsx using TanStack Table v8
   - Columns: checkbox (for bulk select), date, description, category (badge), 
     type (badge), amount (color-coded), actions (edit/delete)
   - Enable column sorting on date, amount, category
   - Props: { data, isLoading, onEdit, onDelete }
   - Show skeleton rows (5 gray pulse rows) when isLoading=true

2. components/ui/CategoryBadge.tsx
   - Props: { category: string }
   - Maps category name to color: SaaS=blue, Infrastructure=purple, 
     Marketing=orange, Consulting=teal, Other=gray

3. components/tables/TableFilters.tsx
   - Search input with 300ms debounce
   - Category select, Type select, Date range picker
   - Emits onChange with filter object

4. components/ui/CSVUpload.tsx
   - Drag and drop zone using HTML drag events (no external library)
   - Parse with papaparse on file drop
   - Show 3-row preview table
   - Confirm button POSTs to /api/revenue/bulk

5. app/(dashboard)/revenue/page.tsx composing all the above
   - Uses useRevenue(filters) React Query hook
   - Pagination with 50 rows per page
   - Export CSV button downloads filtered data as file"
```

## Backend Claude Code prompts

```
1. "Create app/api/revenue/route.ts: GET with query params (search, category, type, 
   dateFrom, dateTo, page, limit=50), POST to create transaction. 
   Return { data, total, page, totalPages }. Auth protected."

2. "Create app/api/revenue/bulk/route.ts: POST that accepts array of transaction 
   objects and uses prisma.transaction.createMany(). Validate each row has 
   date, description, amount, category, type before inserting."

3. "Create hooks/useRevenue.ts with React Query, queryKey includes all filter params"
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Table loads 500 rows | Visit /revenue | Table shows 50 rows, "500 results" count |
| Sort by amount | Click Amount header | Rows reorder highest to lowest |
| Sort by date | Click Date header | Rows reorder by date |
| Search | Type "Acme" in search | Only matching rows shown |
| Category filter | Select Infrastructure | Only infrastructure rows |
| Next page | Click page 2 | Next 50 rows load |
| CSV upload | Drop valid CSV | Preview shows then import works |
| Export CSV | Click Export | .csv file downloads |
| Category badges | View table | Correct colors per category |
| Amount colors | View income vs expense rows | Green for income, red for expense |

## Debugging checklist
- If CSV parse fails → `papaparse.parse(file, { header: true, skipEmptyLines: true, complete: (result) => ... })`
- If sort is client-side only → pass `sortBy` and `sortDir` as query params to API, apply in Prisma `orderBy`
- If export downloads empty → ensure you're passing filtered `data` array to the export function, not the raw API response object

## Definition of done (Phase 6)
- [ ] Table looks like a real SaaS data table — comparable to Linear or Notion tables
- [ ] 500 rows paginated correctly at 50/page
- [ ] Sort, search, filter all work with real DB filtering
- [ ] CSV upload → preview → import works end to end
- [ ] Export CSV downloads all filtered rows
- [ ] Fully responsive — horizontal scroll on mobile, not overflow hidden

---
---

# PHASE 7 — Expenses Page (CRUD)

## What you are building
Expenses list with add/edit/delete, monthly budget vs actual chart, category summary.

---

## Stitch UI — Phase 7

### Screen: Expenses page + Add/Edit modal

**Stitch prompt:**
```
Design the Expenses page for FinTrack SaaS dashboard. Content area only.

PAGE HEADER:
- "Expenses" title + "Track and manage all business expenses" subtitle
- Right: "Add Expense" button (solid slate blue, plus icon)

SUMMARY CARDS ROW (3 cards, same style as dashboard KPI cards):
- "This Month" — $38,200 — "+4% vs last month" red
- "Budget Remaining" — $11,800 — "of $50,000 budget" muted gray  
- "Recurring Expenses" — $24,100 — "63% of total" muted gray

BUDGET VS ACTUAL CHART (full width, white card):
Title "Monthly Budget vs Actual" — grouped bar chart
Each month: budget bar (light gray) + actual bar (slate blue or red if over budget)
A horizontal dashed red line at the budget level
Over-budget months: actual bar turns red

EXPENSES TABLE (white card):
Columns: Date | Description | Category (badge) | Amount | Recurring | Actions

Row example 1: Nov 15 | "Payroll — Engineering team" | Payroll badge (blue) | 
$18,500 | "Monthly" recurring badge (green-100 text, loop icon) | Edit + Delete

Row example 2: Nov 12 | "Google Workspace licenses" | SaaS Tools badge (teal) | 
$480 | "Monthly" | Edit + Delete  

Row example 3: Nov 10 | "Facebook Ads Q4 campaign" | Marketing badge (orange) | 
$3,200 | One-time (no badge) | Edit + Delete

Category filter pills above table: All | Payroll | Infrastructure | Marketing | 
SaaS Tools | Other (pill buttons, active = blue, others = gray outline)

CATEGORY TOTALS ROW (below table):
5 small summary cards in a row, each showing: category name, total this month, 
percentage bar fill, count of transactions

ADD/EDIT EXPENSE MODAL:
White modal, 480px wide, rounded-xl, shadow overlay
Title "Add Expense" (or "Edit Expense"), X close button
Form fields:
- Description (text input, full width)
- Amount (number input with $ prefix, 200px wide)
- Category (select dropdown: Payroll / Infrastructure / Marketing / SaaS Tools / Other)
- Date (date picker input)
- Recurring toggle switch (right side: "Recurring expense" label + toggle)
  When toggled on: show "Frequency" dropdown: Monthly / Quarterly / Yearly
- Save button (full width, slate blue) + Cancel link

Style: Same card + table aesthetic as revenue page. Inter font.
```

---

### Claude Code conversion prompt

```
"Convert this Stitch Expenses page to Next.js TypeScript:

1. components/forms/ExpenseForm.tsx using React Hook Form + Zod
   Schema: { description: string min 3, amount: number positive, 
   category: enum, date: date, recurring: boolean, frequency?: enum }
   Show inline Zod errors under each field

2. components/ui/ExpenseModal.tsx
   Props: { mode: 'add'|'edit', expense?: Expense, onClose, onSave }
   When mode='edit': populate defaultValues with expense data
   Calls POST /api/expenses (add) or PUT /api/expenses/:id (edit) on save

3. components/charts/BudgetVsActualChart.tsx using Recharts BarChart
   Props: { data: Array<{month, budget, actual}> }
   Red bar when actual > budget, blue when under

4. app/(dashboard)/expenses/page.tsx composing everything
   Category filter pills as controlled state
   DELETE with a confirmation dialog before calling the API"
```

## Backend Claude Code prompts

```
1. "Create app/api/expenses/route.ts: GET (with month and category filters), 
   POST create expense. Return expenses + category totals object."

2. "Create app/api/expenses/[id]/route.ts: PUT update, DELETE delete. 
   Auth protect all routes. RBAC: return 403 for VIEWER role on POST/PUT/DELETE."
```

## Test cases

| Test | How to check | Expected result |
|---|---|---|
| Expenses load | Visit /expenses | All rows from DB shown |
| Add expense | Click Add → fill form → Save | New row appears, DB updated |
| Edit expense | Click Edit on a row | Form pre-fills with correct data |
| Save edit | Change amount → Save | Row updates in table |
| Delete expense | Click Delete | Confirmation dialog → then row removed |
| Recurring badge | View recurring rows | "Monthly" badge visible |
| Category filter | Click "Marketing" pill | Only marketing rows shown |
| Budget chart | View page | Chart shows budget vs actual per month |
| Over-budget month | Check data has month > budget | That bar is red |
| Viewer cannot add | Login as viewer | Add button hidden |

## Debugging checklist
- If edit form doesn't pre-fill → pass expense as `defaultValues` to `useForm({ defaultValues: expense })`
- If delete doesn't update UI → call `queryClient.invalidateQueries(['expenses'])` after successful DELETE
- If recurring toggle doesn't show frequency → use `watch('recurring')` from React Hook Form to conditionally render

## Definition of done (Phase 7)
- [ ] Add, edit, delete all work and persist after refresh
- [ ] Recurring badge renders correctly
- [ ] Budget vs actual chart shows correct data with red for over-budget
- [ ] Category filter pills work
- [ ] Viewer role cannot see add/edit/delete buttons

---
---

# PHASE 8 — Customers Page

## What you are building
Customer list with plan badges, churn risk indicators, and a detail modal with MRR history.

---

## Stitch UI — Phase 8

### Screen: Customers page + detail modal

**Stitch prompt:**
```
Design the Customers page for FinTrack SaaS dashboard. Content area only.

PAGE HEADER:
- "Customers" title + "Manage your customer base and track MRR" subtitle  
- Right: "Add Customer" button (slate blue)

SUMMARY CARDS (3 cards):
- Total Customers: 318 (active)
- Total MRR: $24,800
- Avg Revenue per Customer: $78/mo

FILTER ROW:
Search input | Plan filter: All / Free / Pro / Enterprise (dropdown) | 
Status: All / Active / Churned (dropdown) | 
Sort by: MRR (high-low) (dropdown)

CUSTOMERS TABLE:
Columns: Customer | Plan | MRR | Status | Churn Risk | Joined | Actions

Row examples:
Row 1: Avatar circle "AC" slate blue | "Acme Corporation" 14px semibold / 
  "sarah@acme.com" 12px muted |
  ENTERPRISE badge (purple-100 bg, purple-700 text, rounded-full) |
  "$999/mo" green semibold |
  Active badge (green-100/green-700) |
  No Risk (green dot + "Low") |
  "Jan 15, 2024" |
  View Details button (ghost style)

Row 2: Avatar "TG" orange | "TechGrid Inc" / "info@techgrid.io" |
  PRO badge (blue-100/blue-700) |
  "$99/mo" |
  Active badge |
  AT RISK (red dot + "High" in red-600) with warning icon |
  "Mar 22, 2024" |
  View Details

Row 3: Avatar "SK" gray | "SmallBiz Co" |
  FREE badge (gray-100/gray-600) |
  "$0/mo" |
  Active |
  Low risk |
  "Sep 1, 2024" |
  View Details

CUSTOMER DETAIL MODAL (side drawer, slides in from right, 420px wide):
  Header: Customer avatar (56px circle) + name + email + plan badge
  Close X button top right

  "MRR History" section:
  Small line chart (height 120px) showing last 6 months MRR for this customer
  
  Stats grid (2 columns):
  - Customer since: Jan 15, 2024
  - Total paid: $11,988
  - Current plan: Enterprise
  - Next renewal: Dec 15, 2024

  "Churn Risk Assessment" section:
  Risk level badge (Low/Medium/High) + explanation text
  "Last payment: Nov 1, 2024 — On time"

  Action buttons: "Edit Customer" | "Mark as Churned" (danger/outline style)

Style: Clean, customer-focused. Avatars use initials with color based on name hash.
Churn risk HIGH rows have a very subtle red-50 row background.
```

---

### Claude Code conversion prompt

```
"Convert this Stitch Customers page to Next.js TypeScript:

1. components/ui/CustomerAvatar.tsx 
   - Takes name string, generates consistent color from name hash (use charCode sum % 8 
     to pick from 8 Tailwind colors), shows 2-letter initials

2. components/tables/CustomersTable.tsx using TanStack Table
   - Plan badge: FREE=gray, PRO=blue, ENTERPRISE=purple
   - Churn risk: HIGH shows red dot + red text, LOW shows green dot
   - Row with HIGH churn risk has bg-red-50 background

3. components/ui/CustomerDetailDrawer.tsx
   - Slides in from right using CSS transform transition
   - Shows MRR history as a small Recharts LineChart
   - Backdrop overlay closes drawer

4. app/(dashboard)/customers/page.tsx
   - useCustomers() React Query hook with plan/status/search filters"
```

## Test cases

| Test | Expected result |
|---|---|
| All 50 customers load | Table shows all rows paginated |
| Plan badges correct colors | FREE=gray, PRO=blue, ENTERPRISE=purple |
| At-risk customers visible | Some rows have red dot + "High" |
| At-risk row background | Red-50 background on high-risk rows |
| Filter by Enterprise | Only enterprise rows shown |
| Click "View Details" | Drawer slides in from right |
| MRR history in drawer | Line chart renders with 6 months |

## Definition of done (Phase 8)
- [ ] Customer table looks professional with correct badges
- [ ] Churn risk HIGH rows have red highlighting
- [ ] Filter by plan and status works
- [ ] Detail drawer opens smoothly with MRR chart
- [ ] Customer avatars show initials with consistent colors

---
---

# PHASE 9 — RBAC (Role-Based Access Control)

## What you are building
Permission enforcement across all pages and API routes. No new screens — this is a logic phase.

## Permissions Matrix

| Feature | Admin | Manager | Viewer |
|---|---|---|---|
| View all pages | Yes | Yes | Yes |
| Add/Edit/Delete data | Yes | Yes | No |
| Export CSV | Yes | Yes | No |
| Use AI features | Yes | Yes | No |
| Access /admin/users | Yes | No | No |
| Change user roles | Yes | No | No |

## Claude Code prompts

```
1. "Create lib/permissions.ts exporting: 
   type Permission = 'WRITE_DATA' | 'DELETE_DATA' | 'EXPORT_DATA' | 'USE_AI' | 'MANAGE_USERS'
   const ROLE_PERMISSIONS: Record<Role, Permission[]> = { ... }
   function canDo(role: Role, permission: Permission): boolean"

2. "Update all POST, PUT, DELETE API routes to call canDo() before the Prisma query. 
   Return NextResponse.json({error:'Forbidden'}, {status:403}) if not permitted."

3. "Create hooks/usePermission.ts: 
   function usePermission(permission: Permission): boolean
   Reads role from useSession(), calls canDo()"

4. "Update all pages: wrap Add/Edit/Delete buttons in:
   const canWrite = usePermission('WRITE_DATA')
   Show button only if canWrite is true"

5. "Add /admin/users route to middleware protected list. 
   In app/admin/users/page.tsx: check session role, redirect to /dashboard if not ADMIN."
```

## Test cases

| Login as | Action | Expected |
|---|---|---|
| viewer@fintrack.com | View /dashboard | Works fine |
| viewer@fintrack.com | Look for Add Transaction | Button not visible |
| viewer@fintrack.com | POST /api/revenue directly (Postman) | 403 Forbidden |
| viewer@fintrack.com | Visit /admin/users | Redirected to /dashboard |
| manager@fintrack.com | Add expense | Works |
| admin@fintrack.com | Everything | Full access |

## Definition of done (Phase 9)
- [ ] Viewer sees zero add/edit/delete buttons anywhere
- [ ] API returns 403 for viewer on all write endpoints
- [ ] Manager has write access but no admin page
- [ ] Admin has complete access

---
---

# PHASE 10 — Admin Users Page

## What you are building
Admin-only user management page.

---

## Stitch UI — Phase 10

**Stitch prompt:**
```
Design the Admin Users management page for FinTrack SaaS dashboard. Content area only.
This page is only visible to Admin role users.

PAGE HEADER:
- "User Management" title + "Manage team access and permissions" subtitle
- Right: "Invite User" button (slate blue, mail-plus icon)

STATS ROW (3 small cards): 
Total Users: 3 | Admins: 1 | Active: 3

USERS TABLE (white card):
Columns: User | Role | Plan | Status | Last Login | Actions

Row 1: Avatar "JD" blue | "John Doe" / "admin@fintrack.com" |
  ADMIN badge (purple-100/purple-700 rounded-full) |
  PRO badge (blue-100/blue-700) |
  Active (green dot) |
  "2 hours ago" |
  — (cannot edit own account, gray dash)

Row 2: Avatar "AM" green | "Alice Manager" / "manager@fintrack.com" |
  MANAGER badge (blue-100/blue-700) |
  PRO |
  Active |
  "1 day ago" |
  Role dropdown (change to Admin/Manager/Viewer) + Deactivate button

Row 3: Avatar "VU" gray | "View User" / "viewer@fintrack.com" |
  VIEWER badge (gray-100/gray-600) |
  FREE |
  Active |
  "3 days ago" |
  Role dropdown + Deactivate button

INVITE USER MODAL:
White modal, 420px wide
Title "Invite team member"
Email input (full width, placeholder "colleague@company.com")
Role select: Viewer (default) / Manager / Admin
  Role descriptions below select:
  - Viewer: Can view all data, no edits
  - Manager: Can add and edit data
  - Admin: Full access including user management
"Send Invite" button (slate blue, full width) + Cancel

Style: Same table aesthetic as other pages.
```

---

### Claude Code conversion prompt

```
"Convert this Stitch Admin Users page to Next.js TypeScript:

1. app/admin/users/page.tsx
   - Verify session role is ADMIN server-side (redirect otherwise)
   - Fetch all users from /api/users

2. Role change: dropdown onChange calls PATCH /api/users/:id with new role
   - Immediately update UI optimistically
   - Show success toast on confirmation

3. Deactivate: calls DELETE /api/users/:id (soft delete, sets active=false)
   - Confirm dialog before action
   - Deactivated users shown with gray strikethrough styling

4. Invite modal: POST /api/users/invite with email + role
   - Show success message with temp password after creation"
```

## Test cases

| Test | Expected |
|---|---|
| Admin visits /admin/users | Page loads with 3 users |
| Manager visits /admin/users | Redirected to /dashboard |
| Change viewer to manager | Role badge updates, viewer now has manager permissions |
| Deactivate user | User status changes to gray/inactive |
| Deactivated user tries to login | "Account deactivated" error on login |

## Definition of done (Phase 10)
- [ ] Only admin can access /admin/users
- [ ] Role change works and immediately enforces new permissions
- [ ] Deactivated user cannot log in

---
---

# PHASE 11 — AI: Insights + Anomaly Detection

## What you are building
"Explain my data" streaming AI insights panel and automatic anomaly badges on charts.

---

## Stitch UI — Phase 11

### Screen: AI insights panel (expanded state)

**Stitch prompt:**
```
Design the expanded AI Insights panel for FinTrack dashboard. 
This is a slide-up panel that appears at the bottom of the dashboard page 
when the user clicks "Explain my data".

PANEL (full width, white, rounded-t-2xl, shadow-2xl, slides up from bottom):
  Panel header (48px):
    Left: sparkle icon (slate blue) + "AI Insights" 16px semibold
    Right: "Powered by GPT-4o" in 12px muted gray + X close button

  LOADING STATE (while AI streams):
    3 gray skeleton lines (pulse animation) representing the 3 bullet points
    Subtle "Analyzing your data..." 13px muted text with animated dots

  LOADED STATE (3 bullet points, streamed in):
    Each bullet point:
    - Blue circle with check icon on left
    - Insight text 14px #1E293B, line-height 1.6
    - Source data reference in 12px muted: "(Based on Nov 2024 data)"
    
    Example bullet 1: "Your MRR grew 12% this month to $24,800, driven primarily 
    by 3 new Enterprise customers added in week 2."
    Example bullet 2: "Expenses increased 4% due to a $2,400 rise in Infrastructure 
    costs — your AWS bill spiked on Nov 8."  
    Example bullet 3: "Churn rate improved to 2.4% — your best month in 6 months. 
    Customer retention is trending positively."

  ANOMALY SECTION (below bullets, separated by divider):
    Title "Anomalies Detected" 14px semibold + warning icon in amber
    2 anomaly cards (amber-50 bg, amber-200 border, rounded-lg, 12px padding):
    Card 1: "↑ Revenue spike in August: $31,200 vs $22,400 average (39% above mean)"
    Card 2: "↓ MRR dip in March: $16,800 vs $19,500 average (14% below mean)"

  FOOTER: "Regenerate insights" ghost button (left) + 
    "Ask a follow-up question..." text input (right, 300px)

Style: Premium AI panel aesthetic. Subtle blur background overlay on dashboard.
Inter font. Streamed text should feel like typewriter — use CSS animation hint in design.
```

---

### Claude Code prompts

```
1. "Create app/api/ai/insights/route.ts:
   - Auth protected, check USE_AI permission (403 for viewer/free plan)
   - Accept POST with { metrics: DashboardMetrics } in body
   - Build prompt: 'You are a financial analyst. Given these SaaS metrics, write exactly 
     3 bullet points in plain English for a business owner. Be specific with numbers. 
     Max 25 words per bullet. Metrics: [JSON]'
   - Use openai.chat.completions.create with stream: true
   - Return a ReadableStream using new Response(stream) with 
     Content-Type: text/event-stream header"

2. "Create components/ai/InsightsPanel.tsx:
   - Props: { metrics, onClose }
   - POST to /api/ai/insights with metrics
   - Stream response: use fetch with ReadableStream reader
   - Render text as it arrives (append to state character by character)
   - Show 3 skeleton lines while loading
   - Parse bullets by splitting on newline '•' or '-'"

3. "Create app/api/ai/anomaly/route.ts:
   - Accept POST with { monthlyData: Array<{month, value}> }
   - Calculate mean and standard deviation
   - Flag months where value > mean + (2 * stddev) or < mean - (2 * stddev)
   - Send flagged months to GPT: 'Explain in one sentence why month X stands out'
   - Return Array<{month, direction: 'spike'|'dip', percentFromMean, explanation}>"

4. "Add anomaly badges to MRRLineChart.tsx:
   - Accept anomalies prop: Array<{month, direction, explanation}>
   - Use Recharts customized dot: if month is anomalous, render a larger 
     amber circle with '!' instead of normal dot
   - Add Recharts Tooltip showing the explanation on hover"
```

## Test cases

| Test | Expected result |
|---|---|
| Click "Explain my data" | Panel slides up, skeleton appears |
| Text streams in | Bullet points appear word by word |
| 3 bullets present | Exactly 3 bullet points in final output |
| Bullet has real numbers | "$24,800" and "12%" appear correctly |
| Anomaly badge on chart | August spike shows amber circle on line chart |
| Hover anomaly badge | Tooltip shows explanation text |
| Viewer clicks AI | Upgrade modal appears |
| OpenAI key not in browser | DevTools Network tab — key not visible |

## Debugging checklist
- If streaming doesn't render incrementally → ensure you're using `reader.read()` loop not `response.json()`
- If anomaly badge doesn't render → Recharts custom dot needs to render `<circle>` SVG element, not a div
- If GPT returns extra formatting → add to system prompt: "Return only the 3 bullet points. No intro text, no numbering."

## Definition of done (Phase 11)
- [ ] Insights panel slides up smoothly on button click
- [ ] Text streams in word-by-word
- [ ] All 3 bullets reference real metrics from the DB
- [ ] At least 1 anomaly badge appears on MRR chart
- [ ] API key never visible in browser
- [ ] Works in dark mode

---
---

# PHASE 12 — AI: Natural Language Query

## What you are building
The /reports page with a natural language query bar that filters and charts data.

---

## Stitch UI — Phase 12

### Screen: Reports page with NL query

**Stitch prompt:**
```
Design the Reports page for FinTrack SaaS dashboard. Content area only.
This is the most AI-forward page in the product.

HERO QUERY SECTION (top of page, full width):
  White card, rounded-2xl, 1px border, 32px padding
  
  Title row: sparkle icon (purple) + "Ask your data anything" 20px semibold
  Subtitle: "Type a question in plain English — FinTrack AI will find the answer" 
  13px muted gray
  
  QUERY INPUT (full width, large):
  White input, rounded-xl, 2px border slate-200, 
  focus: 2px border slate blue with soft glow
  Height: 52px, 18px font
  Placeholder: "e.g. Show revenue from enterprise customers last quarter..."
  Right side: "Ask" button (slate blue, 40px, rounded-lg, send icon)
  
  EXAMPLE QUERY CHIPS (below input):
  "Show me:" label in 12px muted
  4 chips (rounded-full, gray-100 bg, gray-700 text, hover: blue-50/blue-700):
  "MRR growth this year" | "Top 5 expense categories" | 
  "Customers who joined last month" | "Revenue vs expenses Q3"

INTERPRETED QUERY RESULT (appears after submit):
  Light purple-50 bg card, purple-100 border, rounded-xl
  Purple sparkle icon + "Showing: Revenue from Enterprise customers Jul–Sep 2024"
  14px semibold purple-800
  Below: "23 transactions · $84,200 total · Filtered by: plan=ENTERPRISE, type=INCOME, 
  Q3 2024" in 12px muted

RESULTS SECTION (appears after query):
  Full-width Recharts bar chart showing the filtered data (same style as dashboard)
  Below chart: same TanStack Table component as revenue page, showing filtered rows

EMPTY STATE (before first query):
  Center of content area (below chips):
  Large search illustration — simple SVG of magnifying glass with sparkles
  "Your insights will appear here" 18px semibold
  "Try one of the example queries above to get started" 14px muted gray

Style: This page should feel like a premium AI product. 
The query input should be the hero element — large, prominent, inviting.
Purple accent color for AI elements (distinct from the blue used elsewhere).
```

---

### Claude Code prompts

```
1. "Create app/api/ai/query/route.ts:
   - Accept POST { query: string }
   - System prompt: 'You are a data query parser for a SaaS finance tool. 
     Convert natural language to a JSON filter. Available fields: 
     dateFrom (ISO date), dateTo (ISO date), type (INCOME|EXPENSE), 
     category (string), plan (FREE|PRO|ENTERPRISE), amountMin (number), 
     amountMax (number), groupBy (month|category|plan).
     Return ONLY valid JSON, no explanation. If unclear, return {}'
   - Parse GPT JSON response safely (try/catch)
   - Execute Prisma query with the filter
   - Return { filter, interpretation, data, total }"

2. "Create components/ai/QueryBar.tsx:
   - Large input with 'Ask' button
   - Example chips that set input value on click
   - onSubmit calls /api/ai/query and updates parent state
   - Show loading state on Ask button during fetch"

3. "Create components/ai/QueryResult.tsx:
   - Shows the purple interpretation card
   - Renders Recharts chart based on groupBy field
   - Renders filtered transactions table below chart"

4. "Create app/(dashboard)/reports/page.tsx composing QueryBar + QueryResult
   - Show EmptyState SVG when no query has been run yet"
```

## Test cases

| Query | Expected filter + result |
|---|---|
| "show revenue last month" | dateFrom/dateTo = last month, INCOME type, correct rows |
| "enterprise customers expenses" | plan=ENTERPRISE, type=EXPENSE |
| "marketing expenses over $1000" | category=Marketing, amountMin=1000 |
| "q3 revenue" | dateFrom=Jul 1, dateTo=Sep 30 |
| Click "MRR growth this year" chip | Query auto-runs with chip text |
| Gibberish input | "Couldn't understand your query. Try rephrasing." message |
| Empty submit | Nothing happens, no API call made |

## Definition of done (Phase 12)
- [ ] Query bar is visually prominent and matches premium AI product aesthetic
- [ ] 4 example chips work and auto-run on click
- [ ] 3+ different query types return correct filtered data
- [ ] Interpretation card shows what filter was applied
- [ ] Invalid query shows friendly error message
- [ ] Chart and table both update with query results

---
---

# PHASE 13 — AI: Report Generator

## What you are building
Monthly report generation with AI-written content and text download.

---

## Stitch UI — Phase 13

### Screen: Report generator panel (on Reports page)

**Stitch prompt:**
```
Design the Report Generator section for the FinTrack Reports page.
This appears below the query bar section, separated by a divider.

REPORT GENERATOR CARD (white card, rounded-2xl, border):
  Header row:
  - Left: document icon (slate blue) + "Generate Monthly Report" 18px semibold
  - Right: month selector dropdown "November 2024" with arrow

  Description: "Get an AI-written summary of your financial performance 
  for the selected month, ready to share with stakeholders." 14px muted, 
  max-width 500px

  Generate button row:
  "Generate Report" solid slate blue button (160px wide, 40px height)
  + "Download .txt" outline button (disabled until report generated)
  + small "Powered by GPT-4o-mini" tag in 11px muted gray with sparkle icon

REPORT PREVIEW (appears after generation, below the button row):
  Divider line
  White/off-white background (gray-50), rounded-xl, 1px border, 24px padding
  
  Report header: 
  "FinTrack Monthly Report — November 2024" 18px semibold
  "Generated on Dec 1, 2024" 12px muted gray
  
  SECTIONS (each has a colored left border + section title):
  
  1. Executive Summary (blue left border):
     Title "Executive Summary" 15px semibold slate-700
     2–3 paragraph lines of body text (use lorem ipsum style placeholder in design)
  
  2. Revenue Analysis (green left border):
     Title + body text + a small inline stat "Total: $47,200 ↑12%"
  
  3. Expense Analysis (orange left border):
     Title + body text + "Total: $38,200 ↑4%"
  
  4. Customer Highlights (purple left border):
     Title + body text
  
  5. Key Risks (red left border):
     Title + body text (1–2 shorter items)
  
  6. Recommendations (teal left border):
     Title + 3 bullet points of recommendations

Style: Report should look like a real business document. 
Clean typography, good line-height (1.7), colored section borders add visual hierarchy.
Download button becomes active (blue) once report is generated.
```

---

### Claude Code prompts

```
1. "Create app/api/ai/report/route.ts:
   - Accept POST { month: string, year: number }
   - Fetch metrics for that month from DB
   - Build detailed prompt with real numbers:
     'Write a professional monthly financial report for November 2024.
     Data: MRR=$24800, Revenue=$47200 (up 12%), Expenses=$38200 (up 4%),
     Net Profit=$9100, New Customers=22, Churned=4, Churn Rate=2.4%.
     Format with these exact sections using markdown headers:
     ## Executive Summary, ## Revenue Analysis, ## Expense Analysis,
     ## Customer Highlights, ## Key Risks, ## Recommendations.
     Write for a business stakeholder. Be specific with numbers. 
     Professional tone. 400-600 words total.'
   - Return the markdown report string"

2. "Create components/ai/ReportGenerator.tsx:
   - Month/year selector
   - Generate button with loading spinner
   - Render the returned markdown using react-markdown with 
     custom renderers for h2 (colored left border based on section),
     p (proper line height), ul (clean bullet styling)
   - Download button: creates Blob from report text, triggers download as 
     'FinTrack-Report-November-2024.txt'"
```

## Test cases

| Test | Expected |
|---|---|
| Click Generate | Loading spinner → report appears |
| All 6 sections present | Each section heading visible in report |
| Real numbers in report | "$24,800", "12%", "22 customers" etc. visible |
| Download button enables | After generation, Download button becomes clickable |
| Download file | .txt file downloads with correct filename |
| Colored section borders | Each section has distinct left border color |

## Definition of done (Phase 13)
- [ ] Report generates with real DB data
- [ ] All 6 sections present with distinct colored left borders
- [ ] Download saves correct filename with month/year
- [ ] Loading state shows during generation (~5s)

---
---

# PHASE 14 — Settings Page

## What you are building
Profile, password change, dark mode, and budget settings.

---

## Stitch UI — Phase 14

**Stitch prompt:**
```
Design the Settings page for FinTrack SaaS dashboard. Content area only.

PAGE HEADER: "Settings" title + "Manage your account and preferences" subtitle

3 SECTIONS (each in a white card, rounded-xl, border, separated by 24px gap):

SECTION 1 — Profile:
  Title "Profile" 16px semibold + divider
  Content: user avatar circle (64px, shows initials) with "Upload photo" link beside it
  Form below: 
  - Full name (text input, value "John Doe")
  - Email address (text input, grayed out / disabled, value "admin@fintrack.com")
    Below email: "Email cannot be changed" 12px muted gray
  - Role display: "Admin" badge (not editable)
  "Save changes" button (slate blue, right-aligned)

SECTION 2 — Security:
  Title "Security" 16px semibold + divider
  - "Current password" input (password type)
  - "New password" input + password strength bar below
  - "Confirm new password" input
  "Update password" button (slate blue, right-aligned)
  
  Below password form, divider, then:
  "Two-factor authentication" row:
  Label "2FA" left + "Enhance your account security" 13px muted
  Toggle switch on right (OFF state = gray, ON state = green)

SECTION 3 — Preferences:
  Title "Preferences" 16px semibold + divider
  
  Row 1: "Dark mode" label + "Use dark theme across the app" muted | 
    Toggle switch on right (currently OFF)
  
  Row 2: "Monthly expense budget" label + 
    "$" prefix input showing "50,000" | 
    "Save" small button beside input
  
  Row 3: "Currency" label + 
    Select dropdown showing "USD — US Dollar" | 
    Other options: EUR, GBP, INR
  
  Row 4: "Date format" label + 
    Select: "MM/DD/YYYY" | options: DD/MM/YYYY, YYYY-MM-DD

Style: Clean settings page. Each preference row is 56px tall with horizontal padding.
Toggle switches use slate blue when ON, gray when OFF.
```

---

### Claude Code prompts

```
1. "Create app/(dashboard)/settings/page.tsx with 3 sections using React Hook Form.
   Profile form: PATCH /api/settings/profile
   Password form: PATCH /api/settings/password (verify current, hash new)
   Preferences: auto-save on change for toggles, 'Save' button for budget"

2. "Sync dark mode toggle in settings with the header toggle — 
   both read/write the same 'theme' key in localStorage and dispatch a 
   custom 'theme-change' event that both components listen to"

3. "Save budget to user preferences JSON column — 
   pass it to ExpensesBudgetChart via React Query shared state"
```

## Test cases

| Test | Expected |
|---|---|
| Update name | Name updates in header and sidebar |
| Wrong current password | "Current password is incorrect" error |
| Dark mode toggle in settings | Same effect as header toggle |
| Both toggles in sync | Toggle one, other also flips |
| Budget saved | Expenses chart budget line updates |

## Definition of done (Phase 14)
- [ ] Profile update works and reflects in UI immediately
- [ ] Password change validates current password
- [ ] Dark mode synced between settings and header
- [ ] Budget value reflected on expenses page chart

---
---

# PHASE 15 — Pricing Page + Feature Gating

## What you are building
Public pricing page and upgrade flow for locked features.

---

## Stitch UI — Phase 15

### Screen: Pricing page

**Stitch prompt:**
```
Design a SaaS pricing page for FinTrack finance analytics. 
This is a PUBLIC page (no sidebar). Full-width layout.

PAGE HEADER (centered):
  "Simple, transparent pricing" 40px bold #1E293B
  "Start free, upgrade when you're ready. No hidden fees." 18px muted gray
  28px gap

PRICING CARDS (3 cards side by side, auto-fit grid, gap 24px):
Max-width 1100px centered on page.

CARD 1 — Free:
  White card, rounded-2xl, 1px border #E2E8F0, 32px padding
  "Free" plan name, 24px semibold
  "$0" 48px bold + "/month" 18px muted
  "For individuals getting started" 14px muted
  Divider
  Feature list (checkmarks, each item 14px, 32px row height):
  ✓ Up to 100 transactions/month
  ✓ Basic dashboard
  ✓ 3 months history
  ✓ CSV export
  ✗ AI insights (gray text, no checkmark, crossed icon)
  ✗ Natural language queries
  ✗ Report generator
  ✗ Custom date ranges
  "Get started free" button: outline style, full width

CARD 2 — Pro (MOST POPULAR):
  White card, 2px border slate blue (#3B5BDB), rounded-2xl, 32px padding
  "Most popular" badge (blue-600 bg, white text, rounded-full, 12px, 
  positioned above card top edge, centered)
  "Pro" plan name in slate blue
  "$29" 48px bold slate blue + "/month"
  "For growing businesses" 14px muted
  Divider
  Feature list:
  ✓ Unlimited transactions
  ✓ Full dashboard + all charts
  ✓ 12 months history
  ✓ CSV import & export
  ✓ AI insights (blue text, sparkle icon)
  ✓ Natural language queries
  ✓ Report generator
  ✓ Custom date ranges
  "Start Pro trial" button: solid slate blue, full width

CARD 3 — Enterprise:
  White card, 1px border, rounded-2xl, 32px padding
  "Enterprise" plan name, gray-800
  "$99" 48px bold + "/month"
  "For teams and organizations" 14px muted
  Divider
  All Pro features plus:
  ✓ Multi-user access
  ✓ RBAC (3 user roles)
  ✓ Priority support
  ✓ Custom report branding
  ✓ API access
  ✓ SSO (Google, SAML)
  "Contact sales" button: outline style, full width

BELOW CARDS:
"All plans include:" row with 4 items:
  Shield icon + "Bank-level security" | 
  Clock icon + "99.9% uptime SLA" |
  Headphones icon + "Email support" |
  RefreshCw icon + "Daily backups"

FAQ section (2-column accordion, 3 questions):
  "Can I upgrade or downgrade anytime?" 
  "Is my data secure?"
  "Do you offer annual billing?"

Style: Clean SaaS pricing page. Inter font. Pro card should clearly stand out.
Responsive: cards stack to single column on mobile.
```

### Screen: Feature gate / upgrade modal

**Stitch prompt:**
```
Design a feature gate upgrade modal for FinTrack. 
Appears when a Free plan user tries to use an AI feature.

Modal: white, 460px wide, rounded-2xl, shadow-2xl, centered on screen
Backdrop: semi-transparent dark overlay

Modal content:
  Close X button top-right

  Icon: large sparkle/stars icon (64px, slate blue, centered)
  
  "Unlock AI Insights" title 22px semibold centered
  
  "This feature is available on the Pro plan and above." 14px muted, centered
  
  WHAT YOU GET section (blue-50 bg, rounded-xl, 16px padding, margin 24px 0):
  Title "Pro plan includes:" 13px semibold blue-700
  3 feature rows with check icons:
  ✓ AI-powered data insights
  ✓ Natural language queries  
  ✓ Automated report generation
  
  "Upgrade to Pro — $29/month" solid slate blue button, full width
  Below button: "Cancel" ghost link centered, 13px muted
  
  Footer: "30-day money-back guarantee • Cancel anytime" 12px muted, centered, 
  with shield icon

Style: Persuasive but not pushy. Professional SaaS upgrade flow.
```

---

### Claude Code prompts

```
1. "Convert Stitch pricing page to app/pricing/page.tsx (no auth required, 
   no sidebar layout). Make cards responsive with CSS grid."

2. "Convert upgrade modal to components/ui/UpgradeModal.tsx:
   Props: { feature: string, onClose }
   'Upgrade to Pro' button links to /pricing page"

3. "Create components/ui/PlanGate.tsx:
   Props: { requiredPlan: 'PRO'|'ENTERPRISE', children, feature: string }
   Reads userPlan from session
   If user plan is insufficient: render children with onClick intercepted 
   to show UpgradeModal instead of normal action
   If plan is sufficient: render children normally"

4. "Wrap all AI feature buttons in PlanGate:
   <PlanGate requiredPlan='PRO' feature='AI Insights'>
     <button onClick={handleInsights}>Explain my data</button>
   </PlanGate>"
```

## Test cases

| Test | Expected |
|---|---|
| Visit /pricing logged out | Page renders with 3 cards |
| Pro card stands out | Blue border + "Most popular" badge visible |
| Free user clicks AI button | UpgradeModal appears |
| UpgradeModal "Upgrade to Pro" | Navigates to /pricing |
| Pro user clicks AI button | AI works normally, no modal |
| Mobile pricing | Cards stack to single column at 375px |

## Definition of done (Phase 15)
- [ ] /pricing page looks like a real SaaS pricing page
- [ ] Pro card is visually distinct (border + badge)
- [ ] Free user sees upgrade modal on all AI features
- [ ] Modal links to pricing page
- [ ] Page is fully responsive on mobile

---
---

# PHASE 16 — Performance + Final Polish

## What you are building
Skeletons, empty states, error boundaries, performance optimisations, and toast notifications.

---

## Stitch UI — Phase 16

### Empty states

**Stitch prompt for empty states:**
```
Design 3 empty state components for FinTrack SaaS dashboard.
Each is a centered panel (white card or transparent) with an illustration, 
title, and action button.

EMPTY STATE 1 — No transactions:
  Simple SVG illustration: receipt/document icon with sparkles (64px, slate blue)
  "No transactions yet" 18px semibold #1E293B
  "Upload a CSV or add your first transaction to get started." 14px muted
  "Add Transaction" button (slate blue) + "Upload CSV" outline button side by side

EMPTY STATE 2 — No query results:
  SVG: magnifying glass with X inside (slate gray, 64px)
  "No results found" 18px semibold
  "Try adjusting your search terms or removing filters." 14px muted
  "Clear filters" ghost button in slate blue

EMPTY STATE 3 — No AI query run yet:
  SVG: sparkles + search illustration (purple, 80px)
  "Ask your data anything" 20px semibold
  "Type a question above to instantly filter and visualize your data." 14px muted
  
Style: Centered content, generous padding (80px top/bottom). 
Illustrations are simple CSS-drawn SVG icons — not photos or complex graphics.
Gray/muted color palette for illustrations (not too colorful).
```

**Stitch prompt for skeleton loaders:**
```
Design skeleton loading states for FinTrack dashboard components.
All skeletons use a gray pulse animation (bg-gray-200 with opacity animation).

KPI CARD SKELETON (same size as real KPI card):
  Gray rectangle for label (60% width, 12px height, rounded)
  Gray rectangle for value (40% width, 28px height, rounded, margin-top 8px)
  Gray rectangle for change indicator (50% width, 12px height, rounded)

TABLE SKELETON (full width):
  Header row: 5 gray rectangles evenly spaced (12px height each, rounded)
  5 data rows: each row has 5 gray rectangles at same positions as header
  Rows slightly lighter than header

CHART SKELETON (full width, 280px height):
  Title: gray rectangle (30% width, 16px)
  Chart area: single rounded-lg gray rectangle filling remaining height

Style: All skeleton elements use the same gray (bg-gray-200) base color.
Animation: subtle left-to-right shimmer (use CSS background gradient animation).
```

---

### Claude Code prompts

```
1. "Create components/ui/Skeleton.tsx with variants:
   - KPICardSkeleton: matches KPICard dimensions exactly
   - TableSkeleton: props { rows: number, cols: number }
   - ChartSkeleton: props { height: number }
   All use tailwind animate-pulse with bg-gray-200 dark:bg-gray-700"

2. "Create components/ui/EmptyState.tsx with props:
   { icon: ReactNode, title: string, description: string, actions?: ReactNode }
   Used across all pages when data arrays are empty"

3. "Add ErrorBoundary to each page layout. On error show:
   'Something went wrong' + error message in dev mode + 'Refresh page' button"

4. "Install react-hot-toast and add Toaster to app/layout.tsx.
   Add toast.success() on: transaction created/updated/deleted, 
   expense saved, customer updated, settings saved, CSV imported.
   Add toast.error() on: API errors, validation failures."

5. "Run Lighthouse in Chrome DevTools on localhost:3000/dashboard.
   Fix top 3 issues. Target: Performance > 85, Accessibility > 90."
```

## Performance targets

| Metric | Target |
|---|---|
| Lighthouse Performance | > 85 |
| Lighthouse Accessibility | > 90 |
| First Contentful Paint | < 2s |
| Dashboard API response | < 500ms |
| Table render 500 rows | < 300ms |

## Definition of done (Phase 16)
- [ ] All pages show skeletons while loading (not blank or spinning)
- [ ] All tables show empty state when data is empty
- [ ] Toast notifications on all create/update/delete actions
- [ ] Error boundary catches errors without crashing whole page
- [ ] Lighthouse Performance > 85
- [ ] Lighthouse Accessibility > 90

---
---

# PHASE 17 — Deploy to Vercel

## What you are building
A live public URL. Non-negotiable for your portfolio.

## Steps

```
1. Push code to GitHub as a public repository

2. Go to vercel.com → New Project → Import from GitHub

3. Add all environment variables in Vercel dashboard:
   DATABASE_URL          → your Neon/Supabase production connection string
   NEXTAUTH_SECRET       → run: openssl rand -base64 32
   NEXTAUTH_URL          → https://your-app-name.vercel.app
   OPENAI_API_KEY        → your OpenAI key
   GOOGLE_CLIENT_ID      → from Google Console
   GOOGLE_CLIENT_SECRET  → from Google Console

4. Update Build Command to: prisma generate && next build

5. After first deploy succeeds, run seed via Vercel CLI:
   npx vercel env pull .env.production.local
   DATABASE_URL=[prod_url] npx prisma db seed

6. Update Google OAuth redirect URI to add:
   https://your-app-name.vercel.app/api/auth/callback/google
```

## Post-deploy checklist

| Check | Expected |
|---|---|
| https://your-app.vercel.app loads | No 500 errors |
| Login with admin@fintrack.com / Admin123! | Redirects to dashboard |
| Dashboard shows real data | Not empty |
| AI features work | OpenAI responds |
| HTTPS padlock | Green padlock in browser |
| Google OAuth on production | Works with Vercel domain |

## Definition of done (Phase 17)
- [ ] Live URL is public and accessible
- [ ] Login with demo credentials works
- [ ] Demo credentials visible on login page for recruiters
- [ ] GitHub README has live URL, tech stack badges, and 3+ screenshots
- [ ] URL added to your resume

---
---

# What to do after all phases are complete

These 5 things separate a portfolio project from a forgettable one:

**1. Demo credentials on login page**
Add below the form: "Demo: admin@fintrack.com / Admin123!" in a gray info box. Every recruiter, interviewer, and stranger on LinkedIn should be able to try it in 10 seconds without asking you.

**2. README with screenshots**
Take 4 screenshots: dashboard overview, AI insights panel open, natural language query result, customers table with churn risk badges. Add them to the README. Include: live URL, tech stack badges, "how to run locally" section. This README is what interviewers read before the interview.

**3. Seed data that tells a story**
Make sure the seeded data shows: MRR growing consistently, one month with a spike (for anomaly detection), a mix of plan types, and 3-4 "At Risk" customers. The story the data tells is part of the demo.

**4. Interview preparation per feature**
For every AI feature, prepare: what prompt did you write, how did you prevent the API key from leaking client-side, what happens if the API is down (fallback behavior), and what would you do differently at 10,000 users.

**5. Performance numbers ready**
Know your Lighthouse score, your dashboard API response time, and your table render time for 500 rows. These are the numbers you quote in interviews: "Dashboard loads in under 400ms, Lighthouse 88, renders 500 transactions in under 250ms."

---

# Overall Resume Statement (after completion)

> "Built FinTrack, a full-stack AI-powered SaaS finance analytics dashboard using Next.js 14 App Router, TypeScript, Prisma + PostgreSQL, and NextAuth.js with 3-tier RBAC (Admin/Manager/Viewer). UI designed with Google Stitch and implemented with Tailwind CSS — responsive across all breakpoints. AI layer (GPT-4o-mini) includes streaming insights with anomaly detection, natural language data queries that parse to Prisma filters, and automated report generation. Virtualised TanStack Table handles 500+ transactions with sort/filter/search. Deployed on Vercel with Lighthouse score 88+, dashboard API < 500ms response time."

---

*FinTrack Build Plan v2 — with Google Stitch UI prompts — for Suryauday Prakash Mishra*
