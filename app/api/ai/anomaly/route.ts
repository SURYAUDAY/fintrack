import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { canDo } from "@/lib/permissions";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import {
  checkAILimit,
  getClientIp,
  recordAIUsage,
} from "@/lib/ai-rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  series: z
    .array(z.object({ month: z.string(), value: z.number() }))
    .min(3),
  metric: z.string().default("metric"),
});

interface AnomalyResult {
  month: string;
  direction: "spike" | "dip";
  percentFromMean: number;
  zScore: number;
  explanation: string;
}

function detectAnomalies(
  series: { month: string; value: number }[],
  threshold = 1.8
): AnomalyResult[] {
  const values = series.map((d) => d.value);
  const mean =
    values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stddev = Math.sqrt(variance);

  if (stddev === 0) return [];

  return series
    .map((point) => {
      const z = (point.value - mean) / stddev;
      if (Math.abs(z) < threshold) return null;
      return {
        month: point.month,
        direction: z > 0 ? "spike" : "dip",
        percentFromMean: ((point.value - mean) / mean) * 100,
        zScore: z,
        explanation: "",
      } as AnomalyResult;
    })
    .filter((x): x is AnomalyResult => x !== null);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDo(session.user.role, "USE_AI", session.user.plan))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid series" }, { status: 400 });

  const anomalies = detectAnomalies(parsed.data.series);

  if (anomalies.length === 0) {
    // No anomalies → no OpenAI call → no quota consumed.
    return NextResponse.json({ anomalies: [] });
  }

  // We're about to call OpenAI — enforce the rate limit now.
  const ip = getClientIp(req);
  const limit = await checkAILimit(ip, "anomaly");
  if (!limit.allowed) {
    // Return the deterministic anomalies without AI explanations so the
    // dashboard chart still gets its badges even when AI is rate-limited.
    for (const a of anomalies) {
      a.explanation = `${a.direction === "spike" ? "Spike" : "Dip"} of ${a.percentFromMean.toFixed(0)}% vs the 12-month average.`;
    }
    return NextResponse.json({ anomalies, rateLimited: true });
  }
  await recordAIUsage(ip, "anomaly");

  // Have GPT explain each flagged month with a one-line rationale.
  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You explain financial anomalies in 1 short sentence each. Return JSON: { items: [{ month, explanation }] }. No extra text.",
        },
        {
          role: "user",
          content: `Metric: ${parsed.data.metric}. Mean values & flagged anomalies:
${anomalies
  .map(
    (a) =>
      `- ${a.month}: value ${a.percentFromMean > 0 ? "+" : ""}${a.percentFromMean.toFixed(0)}% vs mean (${a.direction})`
  )
  .join("\n")}`,
        },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsedJson = JSON.parse(content) as {
      items?: { month: string; explanation: string }[];
    };
    const explanationByMonth = new Map<string, string>();
    for (const item of parsedJson.items ?? []) {
      explanationByMonth.set(item.month, item.explanation);
    }
    for (const a of anomalies) {
      a.explanation =
        explanationByMonth.get(a.month) ??
        `${a.direction === "spike" ? "Spike" : "Dip"} of ${a.percentFromMean.toFixed(0)}% vs the 12-month average.`;
    }
  } catch {
    // Fall back to deterministic explanation if OpenAI fails.
    for (const a of anomalies) {
      a.explanation = `${a.direction === "spike" ? "Spike" : "Dip"} of ${a.percentFromMean.toFixed(0)}% vs the 12-month average.`;
    }
  }

  return NextResponse.json({ anomalies });
}
