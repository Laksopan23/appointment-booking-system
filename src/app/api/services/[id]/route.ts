import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { logAudit } from "@/server/audit/audit.service";

async function requireAdmin() {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(240).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.service.update({
    where: { id },
    data: parsed.data,
  });

  // Log audit
  await logAudit({
    actorId: admin.userId,
    actorRole: admin.role,
    action: "SERVICE_UPDATED",
    target: id,
    metadata: parsed.data,
  });

  return NextResponse.json({ service: updated });
}

// Soft delete or restore
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.service.findUnique({
    where: { id },
    select: { id: true, active: true, deletedAt: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isDeleted = existing.deletedAt !== null;

  if (isDeleted) {
    // Restore
    const updated = await prisma.service.update({
      where: { id },
      data: { active: true, deletedAt: null },
    });

    await logAudit({
      actorId: admin.userId,
      actorRole: admin.role,
      action: "SERVICE_RESTORED",
      target: id,
    });

    return NextResponse.json({ service: updated });
  } else {
    // Deactivate
    const updated = await prisma.service.update({
      where: { id },
      data: { active: false, deletedAt: new Date() },
    });

    await logAudit({
      actorId: admin.userId,
      actorRole: admin.role,
      action: "SERVICE_DEACTIVATED",
      target: id,
    });

    return NextResponse.json({ service: updated });
  }
}
