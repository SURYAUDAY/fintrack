import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { canDo } from "@/lib/permissions";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const requestSchema = z.object({
  month: z.coerce.number().int().min(0).max(11),
  year: z.coerce.number().int().min(2000).max(2100),
});

const SYSTEM_PROMPT = `You are a senior financial analyst writing concise, data-driven monthly reports for SaaS founders.

Output EXACTLY this markdown structure (no preamble, no closing remarks):

## Executive Summary
2 sentences. Headline number + the most important shift.

## Revenue Analysis
2-3 sentences. Reference specific revenue numbers and growth %.

## Expense Analysis
2-3 sentences. Call out the largest categories and any spike.

## Customer Highlights
2-3 sentences. Include new customer count, churn count, and notable trends.

## Key Risks
1-2 sentences. Things to watch.

## Recommendations
3 short bullet points. Concrete actions.`;

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
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { month, year } = parsed.data;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  const prevStart = new Date(year, month - 1, 1);
  const prevEnd = start;

  const [
    txAgg,
    txAggPrev,
    expensesByCat,
    customersAgg,
    newCustomers,
    churnedCustomers,
  ] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: { date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { date: { gte: prevStart, lt: prevEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.customer.aggregate({
      where: { status: "ACTIVE" },
      _sum: { mrr: true },
      _count: { _all: true },
    }),
    prisma.customer.count({
      where: { joinedAt: { gte: start, lt: end } },
    }),
    prisma.customer.count({
      where: { churnedAt: { gte: start, lt: end } },
    }),
  ]);

  const revenue =
    Number(txAgg.find((t) => t.type === "INCOME")?._sum.amount ?? 0);
  const expenses =
    Number(txAgg.find((t) => t.type === "EXPENSE")?._sum.amount ?? 0);
  const prevRevenue =
    Number(txAggPrev.find((t) => t.type === "INCOME")?._sum.amount ?? 0);
  const prevExpenses =
    Number(txAggPrev.find((t) => t.type === "EXPENSE")?._sum.amount ?? 0);
  const netProfit = revenue - expenses;
  const totalMrr = Number(customersAgg._sum.mrr ?? 0);
  const activeCustomers = customersAgg._count._all;
  const churnRate =
    activeCustomers === 0
      ? 0
      : (churnedCustomers / Math.max(1, activeCustomers + churnedCustomers)) * 100;

  const revGrowth = prevRevenue === 0 ? 0 : ((revenue - prevRevenue) / prevRevenue) * 100;
  const expGrowth = prevExpenses === 0 ? 0 : ((expenses - prevExpenses) / prevExpenses) * 100;

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const userMessage = `Period: ${monthLabel}.

Metrics:
- Revenue: $${revenue.toLocaleString()} (${revGrowth >= 0 ? "+" : ""}${revGrowth.toFixed(1)}% vs prior month)
- Expenses: $${expenses.toLocaleString()} (${expGrowth >= 0 ? "+" : ""}${expGrowth.toFixed(1)}% vs prior month)
- Net profit: $${netProfit.toLocaleString()}
- Active MRR: $${totalMrr.toLocaleString()}
- Active customers: ${activeCustomers}
- New customers: ${newCustomers}
- Churned customers: ${churnedCustomers}
- Churn rate: ${churnRate.toFixed(1)}%

Top expense categories:
${expensesByCat
  .map((c) => `- ${c.category}: $${Number(c._sum.amount ?? 0).toLocaleString()}`)
  .join("\n")}`;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });
    const markdown = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({
      markdown,
      monthLabel,
      data: {
        revenue,
        expenses,
        netProfit,
        totalMrr,
        activeCustomers,
        newCustomers,
        churnedCustomers,
        churnRate,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "AI report generation failed",
      },
      { status: 500 }
    );
  }
}
