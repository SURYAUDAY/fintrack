import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export type AIEndpoint = "insights" | "anomaly" | "query" | "report";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Demo-safety caps (intentionally tight to prevent surprise OpenAI bills on a
// public portfolio site). Per-IP, per-endpoint: each visitor can try each AI
// feature once per 24h. Global: the entire deployment is capped at 20 AI
// calls per 24h regardless of IP — a hard backstop against bot abuse.
const PER_IP_LIMIT = 1;
const GLOBAL_DAILY_LIMIT = 20;

export function getClientIp(req: NextRequest | Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: "per_ip" | "global";
  resetAt?: Date;
  message?: string;
}

function formatResetMessage(resetAt: Date, scope: "ip" | "global"): string {
  const ms = resetAt.getTime() - Date.now();
  const hours = Math.ceil(ms / (60 * 60 * 1000));
  const when = hours <= 1 ? "less than an hour" : `~${hours} hours`;
  if (scope === "global") {
    return `Demo is rate-limited (20 AI calls / day total). Try again in ${when}.`;
  }
  return `You've used this AI feature for the day. Try again in ${when}.`;
}

export async function checkAILimit(
  ip: string,
  endpoint: AIEndpoint
): Promise<RateLimitResult> {
  const since = new Date(Date.now() - ONE_DAY_MS);

  // Run both checks in parallel — they're independent reads.
  const [perIpCount, globalCount] = await Promise.all([
    prisma.aIUsage.count({
      where: { ip, endpoint, createdAt: { gte: since } },
    }),
    prisma.aIUsage.count({
      where: { createdAt: { gte: since } },
    }),
  ]);

  if (perIpCount >= PER_IP_LIMIT) {
    const earliest = await prisma.aIUsage.findFirst({
      where: { ip, endpoint, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const resetAt = new Date(
      (earliest?.createdAt.getTime() ?? Date.now()) + ONE_DAY_MS
    );
    return {
      allowed: false,
      reason: "per_ip",
      resetAt,
      message: formatResetMessage(resetAt, "ip"),
    };
  }

  if (globalCount >= GLOBAL_DAILY_LIMIT) {
    const earliest = await prisma.aIUsage.findFirst({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const resetAt = new Date(
      (earliest?.createdAt.getTime() ?? Date.now()) + ONE_DAY_MS
    );
    return {
      allowed: false,
      reason: "global",
      resetAt,
      message: formatResetMessage(resetAt, "global"),
    };
  }

  return { allowed: true };
}

export async function recordAIUsage(
  ip: string,
  endpoint: AIEndpoint
): Promise<void> {
  await prisma.aIUsage.create({ data: { ip, endpoint } });
}
