import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { canDo } from "@/lib/permissions";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  metrics: z.object({
    mrr: z.number(),
    revenue: z.number(),
    expenses: z.number(),
    netProfit: z.number(),
    churnRate: z.number(),
    activeCustomers: z.number(),
    mrrGrowth: z.number().optional(),
  }),
});

const SYSTEM_PROMPT = `You are a financial analyst assistant for a SaaS business owner.
Given the metrics below, write EXACTLY 3 bullet points.
- Each bullet: max 25 words, plain English, includes specific numbers from the data.
- Focus on what's notable: notable change, anomaly, or opportunity.
- Do NOT include intros, conclusions, or numbering. No markdown headers.
Format: Each bullet on its own line, prefixed with "• ".`;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDo(session.user.role, "USE_AI", session.user.plan))
    return NextResponse.json(
      { error: "AI features require a Pro plan." },
      { status: 403 }
    );

  // 10 calls / hour per user
  const rl = rateLimit(`ai:insights:${session.user.id}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid metrics" }, { status: 400 });

  const userMessage = `Metrics:
- MRR: $${parsed.data.metrics.mrr.toLocaleString()}
- Revenue (period): $${parsed.data.metrics.revenue.toLocaleString()}
- Expenses (this month): $${parsed.data.metrics.expenses.toLocaleString()}
- Net profit: $${parsed.data.metrics.netProfit.toLocaleString()}
- Churn rate: ${parsed.data.metrics.churnRate.toFixed(1)}%
- Active customers: ${parsed.data.metrics.activeCustomers}
${parsed.data.metrics.mrrGrowth !== undefined ? `- MRR growth vs last month: ${parsed.data.metrics.mrrGrowth.toFixed(1)}%` : ""}`;

  const stream = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    stream: true,
    temperature: 0.4,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `\n[error: ${err instanceof Error ? err.message : "stream failed"}]`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
