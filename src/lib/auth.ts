import jwt from "jsonwebtoken";
import { env } from "@/server/common/env";

export type JwtUser = {
  userId: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
};

export function signToken(payload: JwtUser) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtUser | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtUser;
  } catch {
    return null;
  }
}
