import { slugify } from "@/lib/slugify";

export const DEFAULT_PROJECT_NAME = "Untitled Project";
const MAX_NAME_LENGTH = 100;

export type NameResult = { ok: true; name: string } | { ok: false; error: string };

/** Validates a project name from unknown input. A missing/blank name uses `fallback` when given. */
export function parseProjectName(value: unknown, fallback?: string): NameResult {
  if (value === undefined || value === null) {
    return fallback ? { ok: true, name: fallback } : { ok: false, error: "Name is required" };
  }
  if (typeof value !== "string") return { ok: false, error: "Name must be a string" };

  const name = value.trim();
  if (!name) {
    return fallback ? { ok: true, name: fallback } : { ok: false, error: "Name is required" };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Name must be at most ${MAX_NAME_LENGTH} characters` };
  }
  if (!slugify(name)) {
    return { ok: false, error: "Name must contain at least one letter or number" };
  }
  return { ok: true, name };
}

/** Parses JSON text as an object, or returns null when it is invalid or not an object. */
export function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const body: unknown = JSON.parse(text);
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
