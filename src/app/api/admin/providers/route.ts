import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

async function requireAdmin() {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const providers = await prisma.providerProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    providers: providers.map((p) => ({
      providerProfileId: p.id,
      approved: p.approved,
      bio: p.bio,
      createdAt: p.createdAt,
      user: p.user,
    })),
  });
}
