import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";
import { logAudit } from "@/server/audit/audit.service";

async function requireAdmin() {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

const schema = z.object({
  approved: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ providerProfileId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { providerProfileId } = await params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.providerProfile.findUnique({
    where: { id: providerProfileId },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.providerProfile.update({
    where: { id: providerProfileId },
    data: { approved: parsed.data.approved },
  });

  // Log audit
  await logAudit({
    actorId: admin.userId,
    actorRole: admin.role,
    action: parsed.data.approved ? "PROVIDER_APPROVED" : "PROVIDER_REJECTED",
    target: providerProfileId,
    metadata: { approved: parsed.data.approved },
  });

  return NextResponse.json({ provider: updated });
}
