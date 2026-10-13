"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import type { CanvasEdge } from "@/types/canvas";

const LABEL_HINT = "Double-click to label";

// `nodrag nopan nowheel` keep label interactions from dragging, panning or zooming the canvas.
const INTERACTIVE = "nodrag nopan nowheel";

interface EdgeLabelInputProps {
  label: string;
  onCommit: (label: string) => void;
}

// Mounted only while editing, so the draft is seeded from the saved label on every edit.
function EdgeLabelInput({ label, onCommit }: EdgeLabelInputProps) {
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <input
      ref={inputRef}
      value={draft}
      spellCheck={false}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter" || event.key === "Escape") onCommit(draft);
      }}
      style={{ width: `${Math.max(draft.length, 3) + 1}ch` }}
      className="rounded-full border border-brand bg-elevated px-2 py-0.5 text-center text-xs text-copy-primary outline-none"
    />
  );
}

interface EdgeLabelProps {
  id: string;
  label: string;
  x: number;
  y: number;
  selected: boolean;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
}

function EdgeLabel({
  id,
  label,
  x,
  y,
  selected,
  editing,
  onEditingChange,
}: EdgeLabelProps) {
  const { updateEdgeData } = useReactFlow<never, CanvasEdge>();

  function commit(draft: string) {
    const next = draft.trim();
    if (next !== label) updateEdgeData(id, { label: next });
    onEditingChange(false);
  }

  if (!editing && !label && !selected) return null;

  return (
    <div
      className={`${INTERACTIVE} absolute`}
      style={{
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        pointerEvents: "all",
      }}
      onDoubleClick={() => onEditingChange(true)}
    >
      {editing ? (
        <EdgeLabelInput label={label} onCommit={commit} />
      ) : label ? (
        <span className="block rounded-full border border-surface-border bg-elevated px-2 py-0.5 text-xs text-copy-secondary">
          {label}
        </span>
      ) : (
        <span className="block text-xs text-copy-faint">{LABEL_HINT}</span>
      )}
    </div>
  );
}

export function CanvasEdgeView({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const active = hovered || selected || editing;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ ...style, opacity: active ? 1 : 0.55, transition: "opacity 150ms" }}
      />
      {/* Wide invisible stroke: a bigger hover/click target without a thicker visible line. */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ pointerEvents: "stroke" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={() => setEditing(true)}
      />
      <EdgeLabelRenderer>
        <EdgeLabel
          id={id}
          label={data?.label ?? ""}
          x={labelX}
          y={labelY}
          selected={Boolean(selected)}
          editing={editing}
          onEditingChange={setEditing}
        />
      </EdgeLabelRenderer>
    </>
  );
}
