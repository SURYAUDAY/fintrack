import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";

const rowSchema = z.object({
  date: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  category: z.string().min(1),
  type: z.enum(["INCOME", "EXPENSE"]),
});

const bulkSchema = z.object({
  rows: z.array(rowSchema).min(1).max(2000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDo(session.user.role, "WRITE_DATA", session.user.plan))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await prisma.transaction.createMany({
    data: parsed.data.rows.map((row) => ({
      date: new Date(row.date),
      description: row.description,
      amount: row.amount,
      category: row.category,
      type: row.type,
      userId: session.user.id,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ inserted: result.count }, { status: 201 });
}
