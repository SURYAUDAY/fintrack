import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import type { Prisma } from "@prisma/client";

const querySchema = z.object({
  month: z.string().optional(), // ISO date — first of month
  category: z.string().optional(),
});

const createSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(2),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  recurring: z.boolean().default(false),
  frequency: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  const where: Prisma.ExpenseWhereInput = {};
  if (parsed.data.category && parsed.data.category !== "all") {
    where.category = parsed.data.category;
  }
  if (parsed.data.month) {
    const start = new Date(parsed.data.month);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    where.date = { gte: start, lt: end };
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  });

  // Category totals for the same window
  const totals = await prisma.expense.groupBy({
    by: ["category"],
    where,
    _sum: { amount: true },
    _count: { _all: true },
  });

  // Monthly budget vs actual — last 12 months
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const monthly = await prisma.expense.findMany({
    where: { date: { gte: twelveMonthsAgo } },
    select: { date: true, amount: true },
  });
  const buckets = new Map<string, { month: string; actual: number }>();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      actual: 0,
    });
  }
  for (const e of monthly) {
    const key = `${e.date.getFullYear()}-${String(
      e.date.getMonth() + 1
    ).padStart(2, "0")}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.actual += Number(e.amount);
  }

  return NextResponse.json({
    data: expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
    totals: totals.map((t) => ({
      category: t.category,
      total: Number(t._sum.amount ?? 0),
      count: t._count._all,
    })),
    monthly: Array.from(buckets.values()).map((b) => ({
      month: b.month,
      actual: Math.round(b.actual),
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDo(session.user.role, "WRITE_DATA", session.user.plan))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );

  const created = await prisma.expense.create({
    data: {
      date: new Date(parsed.data.date),
      description: parsed.data.description,
      amount: parsed.data.amount,
      category: parsed.data.category,
      recurring: parsed.data.recurring,
      frequency: parsed.data.frequency ?? null,
      userId: session.user.id,
    },
  });
  return NextResponse.json(
    { data: { ...created, amount: Number(created.amount) } },
    { status: 201 }
  );
}
