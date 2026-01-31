import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/id";
import { requireProvider } from "@/server/common/auth";
import { createAvailabilitySchema } from "@/server/availability/availability.schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("providerId");
  const startAt = searchParams.get("startAt");
  const endAt = searchParams.get("endAt");

  if (!providerId || !startAt) {
    return NextResponse.json(
      { error: "providerId and startAt are required" },
      { status: 400 },
    );
  }

  // If endAt not provided, assume we're querying a single day
  const queryStart = new Date(startAt);
  let queryEnd: Date;

  if (endAt) {
    queryEnd = new Date(endAt);
  } else {
    // Default to end of day
    queryEnd = new Date(queryStart);
    queryEnd.setHours(23, 59, 59, 999);
  }

  const blocks = await prisma.availability.findMany({
    where: {
      providerId,
      startAt: { gte: queryStart, lt: queryEnd },
      active: true,
    },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ blocks });
}

export async function POST(req: NextRequest) {
  const provider = await requireProvider();
  if (!provider) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createAvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { startAt, endAt } = parsed.data;

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  // Prevent availability in the past
  const now = new Date();
  if (startDate < now) {
    return NextResponse.json(
      { error: "Cannot create availability in the past" },
      { status: 400 },
    );
  }

  if (startDate >= endDate) {
    return NextResponse.json(
      { error: "startAt must be before endAt" },
      { status: 400 },
    );
  }

  // ensure provider profile exists and is approved
  const providerData = await prisma.user.findUnique({
    where: { id: provider.userId },
    include: { providerProfile: true },
  });

  if (!providerData?.providerProfile) {
    return NextResponse.json(
      { error: "Provider profile missing" },
      { status: 400 },
    );
  }
  if (!providerData.providerProfile.approved) {
    return NextResponse.json(
      { error: "Provider not approved" },
      { status: 403 },
    );
  }

  const created = await prisma.availability.create({
    data: {
      id: await generateId("AV"),
      providerId: providerData.providerProfile.id,
      startAt: startDate,
      endAt: endDate,
      active: true,
    },
  });

  return NextResponse.json({ availability: created }, { status: 201 });
}
