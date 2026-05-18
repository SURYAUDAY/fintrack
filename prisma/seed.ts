import {
  PrismaClient,
  Role,
  Plan,
  TransactionType,
  CustomerStatus,
  ChurnRisk,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const REVENUE_CATEGORIES = ["SaaS", "Consulting", "Product", "Other"];
const EXPENSE_CATEGORIES = [
  "Payroll",
  "Infrastructure",
  "Marketing",
  "SaaS Tools",
  "Other",
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function dateInMonth(year: number, monthIndex: number) {
  const day = randInt(1, 28);
  return new Date(year, monthIndex, day);
}

async function main() {
  console.log("Seeding database…");

  // ---- 1. Wipe existing data (idempotent re-seed) ----
  await prisma.auditLog.deleteMany();
  await prisma.customerMrr.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ---- 2. Users ----
  const passwords = await Promise.all([
    bcrypt.hash("Admin123!", 10),
    bcrypt.hash("Manager123!", 10),
    bcrypt.hash("Viewer123!", 10),
  ]);

  const [admin, manager, viewer] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@fintrack.com",
        name: "John Doe",
        password: passwords[0],
        role: Role.ADMIN,
        plan: Plan.PRO,
      },
    }),
    prisma.user.create({
      data: {
        email: "manager@fintrack.com",
        name: "Alice Manager",
        password: passwords[1],
        role: Role.MANAGER,
        plan: Plan.PRO,
      },
    }),
    prisma.user.create({
      data: {
        email: "viewer@fintrack.com",
        name: "View User",
        password: passwords[2],
        role: Role.VIEWER,
        plan: Plan.FREE,
      },
    }),
  ]);

  console.log(`  Users: ${admin.email}, ${manager.email}, ${viewer.email}`);

  // ---- 3. Transactions (500 across 12 months) ----
  // Today is the anchor; we go back 12 months.
  const now = new Date();
  const startMonth = now.getMonth() - 11;
  const startYear = now.getFullYear();

  const monthlyMrr = [
    8000, 9800, 11200, 12400, 14000, 15600, 17400, 19200, 20800, 22400, 23600,
    24800,
  ]; // 12 monthly MRR data points, growing $8K → $24.8K

  const transactions: Array<{
    date: Date;
    description: string;
    amount: number;
    category: string;
    type: TransactionType;
    userId: string;
  }> = [];

  for (let m = 0; m < 12; m++) {
    const monthDate = new Date(startYear, startMonth + m, 1);
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const baseRevenue = monthlyMrr[m];
    const isSpikeMonth = m === 7; // Month 8 (index 7) — anomaly demo
    const revenueMultiplier = isSpikeMonth ? 1.4 : 1;

    // ~30 income transactions per month so they sum near MRR * 1.6 (incl one-offs)
    const incomeCount = 28;
    for (let i = 0; i < incomeCount; i++) {
      const slice = (baseRevenue * revenueMultiplier * 1.6) / incomeCount;
      transactions.push({
        date: dateInMonth(year, monthIndex),
        description: pick([
          "Enterprise plan renewal",
          "Pro plan subscription",
          "Annual contract — Acme Corp",
          "Consulting engagement",
          "Custom integration project",
          "Workshop & training",
          "Add-on usage billing",
          "API overage charges",
        ]),
        amount: Number((slice * rand(0.6, 1.6)).toFixed(2)),
        category: pick(REVENUE_CATEGORIES),
        type: TransactionType.INCOME,
        userId: admin.id,
      });
    }

    // ~12 expense transactions per month
    const expenseCount = 12;
    for (let i = 0; i < expenseCount; i++) {
      const slice = (baseRevenue * 1.2) / expenseCount;
      transactions.push({
        date: dateInMonth(year, monthIndex),
        description: pick([
          "AWS infrastructure",
          "Stripe payment processing fees",
          "Google Workspace licenses",
          "Marketing campaign — LinkedIn",
          "Office supplies",
          "Contractor invoice",
          "SaaS subscriptions",
          "Travel expenses",
        ]),
        amount: Number((slice * rand(0.4, 1.4)).toFixed(2)),
        category: pick(EXPENSE_CATEGORIES),
        type: TransactionType.EXPENSE,
        userId: admin.id,
      });
    }
  }

  // Pad up to ≥ 500 with random transactions
  while (transactions.length < 500) {
    const m = randInt(0, 11);
    const monthDate = new Date(startYear, startMonth + m, 1);
    transactions.push({
      date: dateInMonth(monthDate.getFullYear(), monthDate.getMonth()),
      description: "Misc transaction",
      amount: Number(rand(50, 800).toFixed(2)),
      category: pick(REVENUE_CATEGORIES),
      type: Math.random() > 0.5 ? TransactionType.INCOME : TransactionType.EXPENSE,
      userId: admin.id,
    });
  }

  await prisma.transaction.createMany({ data: transactions });
  console.log(`  Transactions: ${transactions.length}`);

  // ---- 4. Expenses (100 entries with recurring flags) ----
  const expenses: Array<{
    date: Date;
    description: string;
    amount: number;
    category: string;
    recurring: boolean;
    frequency: string | null;
    userId: string;
  }> = [];

  const recurringTemplates = [
    { description: "Payroll — Engineering team", category: "Payroll", amount: 18500 },
    { description: "Payroll — Sales & Marketing", category: "Payroll", amount: 9800 },
    { description: "AWS infrastructure", category: "Infrastructure", amount: 2400 },
    { description: "Vercel + database hosting", category: "Infrastructure", amount: 480 },
    { description: "Google Workspace licenses", category: "SaaS Tools", amount: 320 },
    { description: "Slack + Linear + Figma", category: "SaaS Tools", amount: 540 },
    { description: "LinkedIn Ads — recurring", category: "Marketing", amount: 1200 },
  ];

  // Each recurring template appears every month (12 occurrences each)
  for (const t of recurringTemplates) {
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(startYear, startMonth + m, 5);
      expenses.push({
        date: monthDate,
        description: t.description,
        amount: Number((t.amount * rand(0.95, 1.05)).toFixed(2)),
        category: t.category,
        recurring: true,
        frequency: "Monthly",
        userId: admin.id,
      });
    }
  }

  // One-time expenses to reach ~100 total
  while (expenses.length < 100) {
    const m = randInt(0, 11);
    const monthDate = new Date(startYear, startMonth + m, 1);
    expenses.push({
      date: dateInMonth(monthDate.getFullYear(), monthDate.getMonth()),
      description: pick([
        "Facebook Ads Q4 campaign",
        "Conference sponsorship",
        "Legal consultation",
        "Office supplies bulk order",
        "Team offsite",
        "Marketing collateral design",
      ]),
      amount: Number(rand(200, 4000).toFixed(2)),
      category: pick(["Marketing", "Other", "SaaS Tools"]),
      recurring: false,
      frequency: null,
      userId: admin.id,
    });
  }

  await prisma.expense.createMany({ data: expenses });
  console.log(`  Expenses: ${expenses.length}`);

  // ---- 5. Customers (50 with mixed plans, MRR sums to ~$24,800) ----
  const customerNames = [
    "Acme Corporation", "TechGrid Inc", "SmallBiz Co", "Apex Logistics", "Northwind Partners",
    "Stellar Industries", "Bluepeak LLC", "Quantum Labs", "Riverstone Group", "Pioneer Health",
    "Vertex Capital", "BrightWave", "GreenLeaf", "MetroSoft", "Cobalt Studios",
    "Helios Energy", "Lumen Analytics", "Nimbus Logistics", "Orbit Retail", "Pulse Robotics",
    "Quartz Media", "Redwood Foods", "Sapphire Bank", "Titan Manufacturing", "Umbra Design",
    "Vortex Telecom", "Willow Wellness", "Xenon Travel", "Yardstone Realty", "Zenith Aviation",
    "Atlas Networks", "Beacon Software", "Crimson Outdoors", "DeltaForge", "EchoMap",
    "Forge Insurance", "Globex Trading", "Hyperion AI", "IcePeak Cloud", "Jolt Beverages",
    "Kestrel Defense", "Lighthouse PR", "Mosaic Education", "Nova Press", "Oracle Stone",
    "Plume Hospitality", "Quill Publishing", "Raven Print", "Saffron Foods", "Tundra Mining",
  ];

  const customers: Array<{
    name: string;
    email: string;
    plan: Plan;
    mrr: number;
    status: CustomerStatus;
    churnRisk: ChurnRisk;
    joinedAt: Date;
  }> = [];

  // 10 ENTERPRISE @ $999, 20 PRO @ $99, 20 FREE @ $0
  for (let i = 0; i < 10; i++) {
    customers.push({
      name: customerNames[i],
      email: `contact@${customerNames[i].toLowerCase().replace(/[^a-z]/g, "")}.com`,
      plan: Plan.ENTERPRISE,
      mrr: 999,
      status: CustomerStatus.ACTIVE,
      churnRisk: i < 2 ? ChurnRisk.MEDIUM : ChurnRisk.LOW,
      joinedAt: new Date(startYear, startMonth + randInt(0, 11), randInt(1, 28)),
    });
  }
  for (let i = 10; i < 30; i++) {
    customers.push({
      name: customerNames[i],
      email: `contact@${customerNames[i].toLowerCase().replace(/[^a-z]/g, "")}.com`,
      plan: Plan.PRO,
      mrr: 99,
      status: i < 26 ? CustomerStatus.ACTIVE : CustomerStatus.CHURNED,
      churnRisk: i < 14 ? ChurnRisk.HIGH : i < 18 ? ChurnRisk.MEDIUM : ChurnRisk.LOW,
      joinedAt: new Date(startYear, startMonth + randInt(0, 11), randInt(1, 28)),
    });
  }
  for (let i = 30; i < 50; i++) {
    customers.push({
      name: customerNames[i],
      email: `contact@${customerNames[i].toLowerCase().replace(/[^a-z]/g, "")}.com`,
      plan: Plan.FREE,
      mrr: 0,
      status: CustomerStatus.ACTIVE,
      churnRisk: ChurnRisk.LOW,
      joinedAt: new Date(startYear, startMonth + randInt(0, 11), randInt(1, 28)),
    });
  }

  // Top up paying MRR so the active total lands near $24,800.
  // Active MRR right now: 10*999 + 18*99 = $9,990 + $1,782 = $11,772
  // To reach $24,800 active MRR add ~$13,028 across paying customers — bump some Enterprise.
  customers.slice(0, 5).forEach((c) => (c.mrr = 1999));
  customers.slice(5, 10).forEach((c) => (c.mrr = 1499));
  // After bumps: 5*1999 + 5*1499 + 18*99 = 9995 + 7495 + 1782 = $19,272
  customers.slice(10, 18).forEach((c) => (c.mrr = c.mrr + 250)); // 8 PRO bumped
  // Final active MRR ~ $19,272 + 8*250 = $21,272 — still under $24,800 target,
  // bump one Enterprise to absorb the gap.
  customers[0].mrr = 5499;

  for (const c of customers) {
    const created = await prisma.customer.create({
      data: {
        name: c.name,
        email: c.email,
        plan: c.plan,
        mrr: c.mrr,
        status: c.status,
        churnRisk: c.churnRisk,
        joinedAt: c.joinedAt,
        churnedAt:
          c.status === CustomerStatus.CHURNED
            ? new Date(startYear, startMonth + 10, 15)
            : null,
      },
    });

    // 6 months of MRR history for each customer (small variation)
    const history = [];
    for (let m = 0; m < 6; m++) {
      const monthDate = new Date(startYear, startMonth + 6 + m, 1);
      const factor =
        c.status === CustomerStatus.CHURNED && m >= 5 ? 0 : rand(0.92, 1.08);
      history.push({
        customerId: created.id,
        month: monthDate,
        mrr: Number((c.mrr * factor).toFixed(2)),
      });
    }
    await prisma.customerMrr.createMany({ data: history });
  }

  console.log(`  Customers: ${customers.length}`);
  console.log("Seeding complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
