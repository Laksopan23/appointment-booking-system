import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null }, { status: 200 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 200 });
}
