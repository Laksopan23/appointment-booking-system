import { prisma } from "./db";

// Generate IDs like: AD0001, PR0001, CU0001, SV0001, AV0001, BK0001
export async function generateId(
  prefix: "AD" | "PR" | "CU" | "SV" | "AV" | "BK",
) {
  const counter = await prisma.idCounter.update({
    where: { prefix },
    data: { counter: { increment: 1 } },
    select: { counter: true },
  });

  return `${prefix}${String(counter.counter).padStart(4, "0")}`;
}
