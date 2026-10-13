"use client";

import {
  Circle,
  Database,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { setShapeDragPreview } from "@/components/canvas/shape-drag-preview";
import {
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  SHAPE_DRAG_TYPE,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";

const SHAPE_ICONS: Record<NodeShape, LucideIcon> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Database,
  hexagon: Hexagon,
};

function handleDragStart(event: React.DragEvent, shape: NodeShape) {
  const payload: ShapeDragPayload = { shape, ...SHAPE_DEFAULT_SIZES[shape] };
  event.dataTransfer.setData(SHAPE_DRAG_TYPE, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "move";
  setShapeDragPreview(event, shape, payload);
}

export function ShapePanel() {
  return (
    <div
      role="toolbar"
      aria-label="Shapes"
      className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface p-1.5 shadow-lg"
    >
      {NODE_SHAPES.map((shape) => {
        const Icon = SHAPE_ICONS[shape];
        return (
          // A div, not a button: Firefox and Safari do not reliably start drags from buttons,
          // and the tile is drag-only, so it does not claim button semantics.
          <div
            key={shape}
            role="img"
            draggable
            onDragStart={(event) => handleDragStart(event, shape)}
            aria-label={`${shape} shape, drag onto the canvas`}
            title={shape}
            className="flex size-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-elevated hover:text-copy-primary active:cursor-grabbing"
          >
            <Icon className="size-4" />
          </div>
        );
      })}
    </div>
  );
}
