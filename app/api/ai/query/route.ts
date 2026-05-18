import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { canDo } from "@/lib/permissions";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const requestSchema = z.object({
  query: z.string().min(2).max(300),
});

const filterSchema = z.object({
  dateFrom: z.string().nullable().optional(),
  dateTo: z.string().nullable().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).nullable().optional(),
  category: z.string().nullable().optional(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).nullable().optional(),
  amountMin: z.number().nullable().optional(),
  amountMax: z.number().nullable().optional(),
  groupBy: z.enum(["month", "category", "plan"]).nullable().optional(),
  source: z.enum(["transactions", "customers"]).nullable().optional(),
});

const SYSTEM_PROMPT = `You convert a user's natural-language question about a SaaS business's financial data into a strict JSON filter object.

Available data sources:
- "transactions" — has fields: dateFrom, dateTo (ISO 8601), type (INCOME or EXPENSE), category, amountMin, amountMax
- "customers" — has fields: plan (FREE | PRO | ENTERPRISE)

Return ONLY a single valid JSON object with these optional keys:
  source ("transactions" | "customers"),
  dateFrom, dateTo, type, category, plan, amountMin, amountMax,
  groupBy ("month" | "category" | "plan").

Use null for absent fields. Choose the right source based on the question. If the request is unclear, return {}.
Do NOT include any explanation, markdown, or extra text.`;

const today = () => new Date().toISOString().slice(0, 10);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDo(session.user.role, "USE_AI", session.user.plan))
    return NextResponse.json(
      { error: "AI features require a Pro plan." },
      { status: 403 }
    );

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  // 1. Ask GPT to extract a structured filter.
  let filter: z.infer<typeof filterSchema> = {};
  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Today is ${today()}.\nQuestion: ${parsed.data.query}` },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw);
    const safe = filterSchema.safeParse(json);
    if (!safe.success) {
      return NextResponse.json({
        error: "Couldn't understand your query. Try rephrasing.",
      }, { status: 200 });
    }
    filter = safe.data;
  } catch {
    return NextResponse.json({
      error: "AI parser failed. Try rephrasing.",
    });
  }

  // 2. Execute the appropriate Prisma query.
  const source = filter.source ?? "transactions";

  if (source === "customers") {
    const where: Prisma.CustomerWhereInput = {};
    if (filter.plan) where.plan = filter.plan;
    const customers = await prisma.customer.findMany({ where });
    const total = customers.reduce((s, c) => s + Number(c.mrr), 0);

    const interpretation = buildInterpretation({ ...filter, source });

    return NextResponse.json({
      filter,
      source,
      interpretation,
      total: customers.length,
      sumMrr: total,
      data: customers.map((c) => ({
        ...c,
        mrr: Number(c.mrr),
        joinedAt: c.joinedAt.toISOString(),
        churnedAt: c.churnedAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      chart: filter.groupBy === "plan"
        ? groupBy(customers.map((c) => ({ key: c.plan, value: Number(c.mrr) })))
        : [],
    });
  }

  // Transactions
  const where: Prisma.TransactionWhereInput = {};
  if (filter.type) where.type = filter.type;
  if (filter.category) where.category = filter.category;
  if (filter.dateFrom || filter.dateTo) {
    where.date = {};
    if (filter.dateFrom) where.date.gte = new Date(filter.dateFrom);
    if (filter.dateTo) where.date.lte = new Date(filter.dateTo);
  }
  if (filter.amountMin || filter.amountMax) {
    where.amount = {};
    if (filter.amountMin) where.amount.gte = filter.amountMin;
    if (filter.amountMax) where.amount.lte = filter.amountMax;
  }

  const txs = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: 200,
  });
  const total = txs.reduce((s, t) => s + Number(t.amount), 0);

  let chart: { name: string; value: number }[] = [];
  if (filter.groupBy === "month") {
    const buckets = new Map<string, number>();
    for (const t of txs) {
      const key = t.date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      buckets.set(key, (buckets.get(key) ?? 0) + Number(t.amount));
    }
    chart = Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));
  } else if (filter.groupBy === "category") {
    const buckets = new Map<string, number>();
    for (const t of txs) {
      buckets.set(t.category, (buckets.get(t.category) ?? 0) + Number(t.amount));
    }
    chart = Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));
  }

  const interpretation = buildInterpretation({ ...filter, source });

  return NextResponse.json({
    filter,
    source,
    interpretation,
    total: txs.length,
    sumAmount: total,
    data: txs.map((t) => ({
      ...t,
      amount: Number(t.amount),
      date: t.date.toISOString(),
    })),
    chart,
  });
}

function buildInterpretation(f: Record<string, unknown>): string {
  const parts: string[] = [];
  if (f.source === "customers") parts.push("customers");
  else parts.push("transactions");
  if (f.type) parts.push(`type: ${String(f.type).toLowerCase()}`);
  if (f.category) parts.push(`category: ${f.category}`);
  if (f.plan) parts.push(`plan: ${f.plan}`);
  if (f.dateFrom || f.dateTo) {
    const from = f.dateFrom ? String(f.dateFrom).slice(0, 10) : "earliest";
    const to = f.dateTo ? String(f.dateTo).slice(0, 10) : "today";
    parts.push(`from ${from} to ${to}`);
  }
  if (f.amountMin) parts.push(`min $${f.amountMin}`);
  if (f.amountMax) parts.push(`max $${f.amountMax}`);
  return `Showing ${parts.join(", ")}`;
}

function groupBy(rows: { key: string; value: number }[]): { name: string; value: number }[] {
  const buckets = new Map<string, number>();
  for (const r of rows) buckets.set(r.key, (buckets.get(r.key) ?? 0) + r.value);
  return Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));
}
