import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
      select: {
        id: true,
        actorId: true,
        actorRole: true,
        action: true,
        target: true,
        metadata: true,
        createdAt: true,
        actor: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Audit logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 },
    );
  }
}
