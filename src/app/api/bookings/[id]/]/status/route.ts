import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";
import { logAudit } from "@/server/audit/audit.service";

const schema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (payload.role !== "PROVIDER" && payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Provider can only update their own bookings
  if (payload.role === "PROVIDER" && booking.providerId !== payload.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  // Log audit
  await logAudit({
    actorId: payload.userId,
    actorRole: payload.role,
    action: "BOOKING_STATUS_CHANGED",
    target: id,
    metadata: { newStatus: parsed.data.status, oldStatus: booking.status },
  });

  return NextResponse.json({ booking: updated });
}
