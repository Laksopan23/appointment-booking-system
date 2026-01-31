export function ok<T>(data: T) {
  return { ok: true as const, data };
}

export function fail(message: string, code?: string) {
  return { ok: false as const, error: { message, code } };
}
