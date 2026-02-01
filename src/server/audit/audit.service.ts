import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function logAudit({
  actorId,
  actorRole,
  action,
  target,
  metadata,
}: {
  actorId: string;
  actorRole: string;
  action: string;
  target: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        actorRole: actorRole as "CUSTOMER" | "PROVIDER" | "ADMIN",
        action,
        target,
        metadata,
      },
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
    // Don't throw - audit logging should not break the main operation
  }
}
