import { prisma } from "@/lib/db";

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
  metadata?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        actorRole: actorRole as any,
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
