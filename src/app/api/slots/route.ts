import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("providerId"); // ProviderProfile.id
  const serviceId = searchParams.get("serviceId");
  const startAtStr = searchParams.get("startAt"); // ISO datetime string

  if (!providerId || !serviceId || !startAtStr) {
    return NextResponse.json(
      { error: "providerId, serviceId, startAt (ISO datetime) are required" },
      { status: 400 },
    );
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Parse the requested start time and calculate window
  const requestedStart = new Date(startAtStr);
  const now = new Date();

  if (requestedStart < now) {
    return NextResponse.json(
      { error: "Cannot request slots for past times" },
      { status: 400 },
    );
  }

  const requestedEnd = new Date(requestedStart.getTime() + 24 * 60 * 60 * 1000); // 24 hours window

  // Get availability blocks that overlap with requested window
  const blocks = await prisma.availability.findMany({
    where: {
      providerId,
      active: true,
      // Block overlaps with requested window if: blockStart < windowEnd AND blockEnd > windowStart
      startAt: { lt: requestedEnd },
      endAt: { gt: requestedStart },
    },
    orderBy: { startAt: "asc" },
  });

  // Get booked slots in the requested window
  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      serviceId,
      startAt: { gte: requestedStart, lt: requestedEnd },
      status: "CONFIRMED",
    },
    select: { startAt: true },
  });

  const bookedSet = new Set(bookings.map((b) => b.startAt.getTime()));

  // Generate available slots
  const slots: string[] = [];
  const step = service.durationMinutes * 60 * 1000; // Convert to milliseconds

  for (const block of blocks) {
    // Calculate slot generation range: max of (block start, requested start)
    const slotStart = Math.max(
      block.startAt.getTime(),
      requestedStart.getTime(),
    );
    // Calculate slot generation end: min of (block end, requested end)
    const slotEnd = Math.min(block.endAt.getTime(), requestedEnd.getTime());

    // Generate slots within this block
    for (let t = slotStart; t + step <= slotEnd; t += step) {
      if (!bookedSet.has(t)) {
        slots.push(new Date(t).toISOString());
      }
    }
  }

  return NextResponse.json({
    providerId,
    serviceId,
    startAt: startAtStr,
    durationMinutes: service.durationMinutes,
    slots: slots.sort(),
  });
}
