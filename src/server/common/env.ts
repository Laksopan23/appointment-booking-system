import { z } from "zod";

const schema = z.object({
  JWT_SECRET: z.string().min(20),
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export const env = schema.parse(process.env);
