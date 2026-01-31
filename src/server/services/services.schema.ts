import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(240),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).max(240).optional(),
  active: z.boolean().optional(),
});
