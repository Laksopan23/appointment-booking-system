export async function api<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "fetch",
      ...(options?.headers || {}),
    },
    credentials: "include",
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`;

    throw new Error(typeof msg === "string" ? msg : "Something went wrong");
  }

  return data as T;
}
