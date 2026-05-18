import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";

const updateSchema = z.object({
  date: z.string().optional(),
  description: z.string().min(2).optional(),
  amount: z.coerce.number().positive().optional(),
  category: z.string().min(1).optional(),
  recurring: z.boolean().optional(),
  frequency: z.string().nullable().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDo(session.user.role, "WRITE_DATA", session.user.plan))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const updated = await prisma.expense.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    },
  });
  return NextResponse.json({
    data: { ...updated, amount: Number(updated.amount) },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDo(session.user.role, "DELETE_DATA", session.user.plan))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
