import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/permissions";

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  role: z.enum(["ADMIN", "MANAGER", "VIEWER"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDo(session.user.role, "MANAGE_USERS", session.user.plan))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    data: users.map((u) => ({
      ...u,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canDo(session.user.role, "MANAGE_USERS", session.user.plan))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing)
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  // Generate a temp password for invited users.
  const tempPassword = Math.random().toString(36).slice(2, 10) + "A1!";
  const hashed = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name ?? parsed.data.email.split("@")[0],
      role: parsed.data.role,
      plan: "FREE",
      password: hashed,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json(
    { user, tempPassword },
    { status: 201 }
  );
}
