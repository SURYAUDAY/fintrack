import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]).optional(),
  mrr: z.coerce.number().nonnegative().optional(),
  status: z.enum(["ACTIVE", "CHURNED"]).optional(),
  churnRisk: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      mrrHistory: { orderBy: { month: "asc" } },
    },
  });
  if (!customer)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      ...customer,
      mrr: Number(customer.mrr),
      joinedAt: customer.joinedAt.toISOString(),
      churnedAt: customer.churnedAt?.toISOString() ?? null,
      mrrHistory: customer.mrrHistory.map((m) => ({
        month: m.month.toISOString(),
        mrr: Number(m.mrr),
      })),
    },
  });
}

export async function PATCH(
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

  const updated = await prisma.customer.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      churnedAt:
        parsed.data.status === "CHURNED" ? new Date() : undefined,
    },
  });
  return NextResponse.json({
    data: { ...updated, mrr: Number(updated.mrr) },
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

  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
