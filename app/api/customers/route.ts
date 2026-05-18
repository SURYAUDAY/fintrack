import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import type { Prisma } from "@prisma/client";

const querySchema = z.object({
  search: z.string().optional(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE", "all"]).optional(),
  status: z.enum(["ACTIVE", "CHURNED", "all"]).optional(),
  sortBy: z.enum(["mrr", "joinedAt", "name"]).default("mrr"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
  mrr: z.coerce.number().nonnegative(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });

  const where: Prisma.CustomerWhereInput = {};
  if (parsed.data.search) {
    where.OR = [
      { name: { contains: parsed.data.search, mode: "insensitive" } },
      { email: { contains: parsed.data.search, mode: "insensitive" } },
    ];
  }
  if (parsed.data.plan && parsed.data.plan !== "all")
    where.plan = parsed.data.plan;
  if (parsed.data.status && parsed.data.status !== "all")
    where.status = parsed.data.status;

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { [parsed.data.sortBy]: parsed.data.sortDir },
  });

  const [activeCount, totalMrrAgg, allCount] = await Promise.all([
    prisma.customer.count({ where: { status: "ACTIVE" } }),
    prisma.customer.aggregate({
      where: { status: "ACTIVE" },
      _sum: { mrr: true },
    }),
    prisma.customer.count(),
  ]);
  const totalMrr = Number(totalMrrAgg._sum.mrr ?? 0);
  const arpu = activeCount === 0 ? 0 : totalMrr / activeCount;

  return NextResponse.json({
    data: customers.map((c) => ({
      ...c,
      mrr: Number(c.mrr),
      joinedAt: c.joinedAt.toISOString(),
      churnedAt: c.churnedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    summary: {
      total: allCount,
      active: activeCount,
      totalMrr,
      arpu,
    },
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
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const created = await prisma.customer.create({
    data: {
      ...parsed.data,
      status: "ACTIVE",
      churnRisk: "LOW",
    },
  });
  return NextResponse.json(
    { data: { ...created, mrr: Number(created.mrr) } },
    { status: 201 }
  );
}
