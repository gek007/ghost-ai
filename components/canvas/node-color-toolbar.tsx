"use client";

import { NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import { NODE_COLORS, type CanvasNode } from "@/types/canvas";

interface NodeColorToolbarProps {
  id: string;
  color: string;
  visible: boolean;
}

// `nodrag nopan` keep toolbar interactions from dragging the node or panning the canvas.
export function NodeColorToolbar({ id, color, visible }: NodeColorToolbarProps) {
  const { updateNodeData } = useReactFlow<CanvasNode>();

  return (
    <NodeToolbar isVisible={visible} position={Position.Top} offset={12}>
      <div
        role="toolbar"
        aria-label="Node color"
        className="nodrag nopan flex items-center gap-1.5 rounded-xl border border-surface-border bg-elevated p-1.5"
      >
        {NODE_COLORS.map((pair) => {
          const active = pair.fill.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={pair.fill}
              type="button"
              aria-label={`Color ${pair.text}`}
              aria-pressed={active}
              onClick={() => updateNodeData(id, { color: pair.fill })}
              style={
                {
                  backgroundColor: pair.fill,
                  borderColor: pair.text,
                  "--glow": pair.text,
                } as React.CSSProperties
              }
              className={`size-5 cursor-pointer rounded-full border transition-shadow hover:shadow-[0_0_4px_1px_var(--glow)] ${
                active
                  ? "ring-2 ring-copy-primary ring-offset-1 ring-offset-elevated"
                  : "opacity-80 hover:opacity-100"
              }`}
            />
          );
        })}
      </div>
    </NodeToolbar>
  );
}
