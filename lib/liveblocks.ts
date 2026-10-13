import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#a3e635",
  "#34d399",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#e879f9",
] as const;

let client: Liveblocks | undefined;

/** Cached Liveblocks node client; created on first use so builds don't need the secret. */
export function getLiveblocks(): Liveblocks {
  if (!client) {
    const secret = process.env.LIVEBLOCKS_SECRET_KEY;
    if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
    client = new Liveblocks({ secret });
  }
  return client;
}

/** Deterministically maps a user ID to a color from the fixed palette. */
export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}
