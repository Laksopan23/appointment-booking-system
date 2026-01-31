import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function requireAdmin() {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function requireProvider() {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "PROVIDER") return null;
  return payload;
}

export async function requireCustomer() {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "CUSTOMER") return null;
  return payload;
}

export async function requireAuth() {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return null;
  return payload;
}
