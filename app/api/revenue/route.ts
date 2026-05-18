import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import type { Prisma, TransactionType } from "@prisma/client";

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(["date", "amount", "category"]).default("date"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

const createSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(2),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    search,
    category,
    type,
    dateFrom,
    dateTo,
    sortBy,
    sortDir,
    page,
    limit,
  } = parsed.data;

  const where: Prisma.TransactionWhereInput = {};
  if (search) where.description = { contains: search, mode: "insensitive" };
  if (category && category !== "all") where.category = category;
  if (type) where.type = type as TransactionType;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    data: data.map((t) => ({ ...t, amount: Number(t.amount) })),
    total,
    page,
    pageSize: limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canDo(session.user.role, "WRITE_DATA", session.user.plan)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const created = await prisma.transaction.create({
    data: {
      date: new Date(parsed.data.date),
      description: parsed.data.description,
      amount: parsed.data.amount,
      category: parsed.data.category,
      type: parsed.data.type,
      userId: session.user.id,
    },
  });

  return NextResponse.json(
    { data: { ...created, amount: Number(created.amount) } },
    { status: 201 }
  );
}
