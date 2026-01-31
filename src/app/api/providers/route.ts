import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const providers = await prisma.providerProfile.findMany({
    where: { approved: true },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    providers: providers.map((p) => ({
      providerProfileId: p.id,
      userId: p.user.id,
      name: p.user.name,
      bio: p.bio,
    })),
  });
}
