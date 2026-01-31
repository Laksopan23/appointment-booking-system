import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/id";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["CUSTOMER", "PROVIDER"]).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const rolePrefix = role === "PROVIDER" ? "PR" : "CU";

  const user = await prisma.user.create({
    data: {
      id: await generateId(rolePrefix),
      name,
      email,
      passwordHash,
      role: role ?? "CUSTOMER",
      providerProfile:
        role === "PROVIDER"
          ? { create: { id: await generateId("PR") } }
          : undefined,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
