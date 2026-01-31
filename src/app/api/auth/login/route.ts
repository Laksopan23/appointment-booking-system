import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { env } from "@/server/common/env";
import { rateLimit } from "@/server/security/rateLimit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  // Rate limiting by IP
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown-ip";

  const rl = rateLimit({
    key: `login:${ip}`,
    limit: 10,
    windowMs: 60_000, // 10 attempts per minute
  });

  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfter),
        },
      },
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ userId: user.id, role: user.role });

  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
