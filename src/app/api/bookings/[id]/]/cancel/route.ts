import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { logAudit } from "@/server/audit/audit.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwnerCustomer =
    payload.role === "CUSTOMER" && booking.customerId === payload.userId;
  const isOwnerProvider =
    payload.role === "PROVIDER" && booking.providerId === payload.userId;
  const isAdmin = payload.role === "ADMIN";

  if (!isOwnerCustomer && !isOwnerProvider && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  // Log audit
  await logAudit({
    actorId: payload.userId,
    actorRole: payload.role,
    action: "BOOKING_CANCELLED",
    target: id,
  });

  return NextResponse.json({ booking: updated });
}
