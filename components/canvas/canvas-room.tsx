"use client";

import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useErrorListener,
  useStatus,
} from "@liveblocks/react/suspense";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Canvas } from "@/components/canvas/canvas";

function CanvasMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-base px-6 text-center">
      <p className="text-sm text-copy-muted">{children}</p>
    </div>
  );
}

function connectionMessage(code: number): string {
  if (code === 4001) return "You don't have access to this project.";
  if (code === 4005) return "This project's room is full. Try again later.";
  return "Could not connect to the canvas. Reload to try again.";
}

/**
 * Suspense hooks never surface auth or connection failures (the fallback just
 * keeps showing), so connection errors are caught with `useErrorListener`.
 */
function ConnectionGuard({ children }: { children: React.ReactNode }) {
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const status = useStatus();

  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") setErrorCode(error.context.code);
  });

  // Liveblocks retries transient failures, so the message goes away once reconnected.
  if (errorCode !== null && status !== "connected") return <CanvasMessage>{connectionMessage(errorCode)}</CanvasMessage>;
  return children;
}

export function CanvasRoom({ roomId }: { roomId: string }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider key={roomId} id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
        <ConnectionGuard>
          <ErrorBoundary
            fallback={<CanvasMessage>Could not load the canvas. Reload to try again.</CanvasMessage>}
          >
            <ClientSideSuspense fallback={<CanvasMessage>Loading canvas…</CanvasMessage>}>
              <Canvas />
            </ClientSideSuspense>
          </ErrorBoundary>
        </ConnectionGuard>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
