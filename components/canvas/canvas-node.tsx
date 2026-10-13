import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";

/** Basic renderer: every shape is a bordered rectangle with a centered label. */
export function CanvasNodeView({ data }: NodeProps<CanvasNode>) {
  return (
    <div
      className="flex size-full items-center justify-center rounded-xl border border-surface-border px-3 text-center text-sm"
      style={{ backgroundColor: data.color, color: "var(--text-primary)" }}
    >
      {data.label}
    </div>
  );
}
