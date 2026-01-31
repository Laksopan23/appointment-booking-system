import { z } from "zod";

export const createAvailabilitySchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export const getAvailabilitySchema = z.object({
  providerId: z.string().min(1),
  startAt: z.string().datetime(),
});
