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

const MAX_ID_LENGTH = 128;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type IdResult = { ok: true; id: string | undefined } | { ok: false; error: string };

/** Validates an optional client-supplied project ID (also used as the room ID): a lowercase slug. */
export function parseProjectId(value: unknown): IdResult {
  if (value === undefined || value === null) return { ok: true, id: undefined };
  if (typeof value !== "string" || value.length > MAX_ID_LENGTH || !ID_PATTERN.test(value)) {
    return { ok: false, error: "ID must be a lowercase slug (a–z, 0–9, hyphens)" };
  }
  return { ok: true, id: value };
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
