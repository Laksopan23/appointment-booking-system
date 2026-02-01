import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/id";
import { requireCustomer, requireAuth } from "@/server/common/auth";
import { createBookingSchema } from "@/server/bookings/bookings.schema";

export async function POST(req: NextRequest) {
  const customer = await requireCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { providerProfileId, serviceId, startAt } = parsed.data;

  const bookingDateTime = new Date(startAt);

  // Prevent booking past dates
  const now = new Date();
  if (bookingDateTime < now) {
    return NextResponse.json(
      { error: "Cannot book a past time" },
      { status: 400 },
    );
  }

  const providerProfile = await prisma.providerProfile.findUnique({
    where: { id: providerProfileId },
    select: { userId: true, approved: true },
  });

  if (!providerProfile) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }
  if (!providerProfile.approved) {
    return NextResponse.json(
      { error: "Provider not approved" },
      { status: 403 },
    );
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Prevent double booking using unique constraint
  try {
    const booking = await prisma.booking.create({
      data: {
        id: await generateId("BK"),
        customerId: customer.userId,
        providerId: providerProfile.userId,
        serviceId,
        startAt: bookingDateTime,
        durationMinutes: service.durationMinutes,
        status: "CONFIRMED",
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    const error = e as { code?: string };
    if (error?.code === "P2002") {
      // Unique constraint violation
      return NextResponse.json(
        { error: "Slot already booked" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role === "ADMIN") {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { service: true },
    });
    return NextResponse.json({ bookings });
  }

  if (auth.role === "CUSTOMER") {
    const bookings = await prisma.booking.findMany({
      where: { customerId: auth.userId },
      orderBy: { createdAt: "desc" },
      include: { service: true },
    });
    return NextResponse.json({ bookings });
  }

  // PROVIDER
  const bookings = await prisma.booking.findMany({
    where: { providerId: auth.userId },
    orderBy: { createdAt: "desc" },
    include: { service: true },
  });
  return NextResponse.json({ bookings });
}
