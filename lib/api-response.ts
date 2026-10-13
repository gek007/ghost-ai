import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Resolves the signed-in Clerk user ID for a route handler.
 * `auth.protect()` answers API requests with 404, so handlers use `auth()`
 * and return an explicit 401 instead.
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
