import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/id";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { logAudit } from "@/server/audit/audit.service";

export async function GET() {
  const services = await prisma.service.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ services });
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(240),
});

export async function POST(req: Request) {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const service = await prisma.service.create({
    data: {
      id: await generateId("SV"),
      ...parsed.data,
    },
  });

  // Log audit
  await logAudit({
    actorId: payload.userId,
    actorRole: payload.role,
    action: "SERVICE_CREATED",
    target: service.id,
    metadata: { name: service.name, durationMinutes: service.durationMinutes },
  });

  return NextResponse.json({ service }, { status: 201 });
}
