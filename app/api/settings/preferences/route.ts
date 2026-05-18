import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  monthlyBudget: z.coerce.number().nonnegative().optional(),
  currency: z.string().min(3).max(4).optional(),
  dateFormat: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });
  return NextResponse.json({ data: user?.preferences ?? {} });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const existing = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });
  const merged = {
    ...((existing?.preferences as Record<string, unknown> | null) ?? {}),
    ...parsed.data,
  };
  await prisma.user.update({
    where: { id: session.user.id },
    data: { preferences: merged },
  });
  return NextResponse.json({ data: merged });
}
