import { z } from "zod";

export const createBookingSchema = z.object({
  providerProfileId: z.string().min(1),
  serviceId: z.string().min(1),
  startAt: z.string().datetime(),
});

export const cancelBookingSchema = z.object({
  status: z.enum(["CANCELLED", "COMPLETED"]),
});
