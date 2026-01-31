import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function checkCSRFToken(request: NextRequest): {
  valid: boolean;
  response?: NextResponse;
} {
  const requestedWith = request.headers.get("x-requested-with");

  if (requestedWith !== "fetch") {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Invalid request" },
        { status: 403 },
      ),
    };
  }

  return { valid: true };
}
