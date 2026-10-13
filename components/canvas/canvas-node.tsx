"use client";

import { NodeResizer, useReactFlow, type NodeProps } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { NodeShapeBody } from "@/components/canvas/node-shape";
import type { CanvasNode } from "@/types/canvas";

const MIN_NODE_WIDTH = 60;
const MIN_NODE_HEIGHT = 40;
const LABEL_PLACEHOLDER = "Label";

// `nodrag nopan nowheel` keep text interactions from dragging, panning or zooming the canvas.
const INTERACTIVE = "nodrag nopan nowheel";
const LABEL_TEXT =
  "block w-full whitespace-pre-wrap break-words text-center leading-5";

interface NodeLabelProps {
  id: string;
  label: string;
}

function NodeLabel({ id, label }: NodeLabelProps) {
  const { updateNodeData } = useReactFlow<CanvasNode>();
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!editing || !textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [editing]);

  // The invisible mirror sizes the box and centers it exactly like the static label, so
  // switching to the textarea (and typing) does not shift the layout.
  const mirror = (
    <span className={`${LABEL_TEXT} ${label ? "" : "text-copy-faint"}`}>
      {label || LABEL_PLACEHOLDER}
      {"\n"}
    </span>
  );

  if (!editing) {
    return (
      <div className="w-full" onDoubleClick={() => setEditing(true)}>
        <span className={`${LABEL_TEXT} ${label ? "" : "text-copy-faint"}`}>
          {label || LABEL_PLACEHOLDER}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <span aria-hidden className="invisible">
        {mirror}
      </span>
      <textarea
        ref={textareaRef}
        value={label}
        placeholder={LABEL_PLACEHOLDER}
        rows={1}
        spellCheck={false}
        onChange={(event) => updateNodeData(id, { label: event.target.value })}
        onBlur={() => setEditing(false)}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Escape") setEditing(false);
        }}
        className={`${INTERACTIVE} ${LABEL_TEXT} absolute inset-0 m-0 resize-none overflow-hidden border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-copy-faint`}
      />
    </div>
  );
}

export function CanvasNodeView({ id, data, selected }: NodeProps<CanvasNode>) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        lineClassName="border-brand/30!"
        handleClassName="size-2! rounded-xs! border-brand! bg-surface!"
      />
      <NodeShapeBody shape={data.shape} color={data.color} selected={selected}>
        <NodeLabel id={id} label={data.label} />
      </NodeShapeBody>
    </>
  );
}
