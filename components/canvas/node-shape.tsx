import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { NODE_COLORS, type NodeShape } from "@/types/canvas";

type SvgShape = "diamond" | "hexagon" | "cylinder";

/** Geometry in a 100x100 viewBox; the SVG stretches to the node size. */
const SVG_PATHS: Record<SvgShape, string[]> = {
  diamond: ["M50 0 L100 50 L50 100 L0 50 Z"],
  hexagon: ["M25 0 L75 0 L100 50 L75 100 L25 100 L0 50 Z"],
  // Body plus the front arc of the top rim.
  cylinder: [
    "M0 12 A50 12 0 0 1 100 12 V88 A50 12 0 0 1 0 88 Z",
    "M0 12 A50 12 0 0 0 100 12",
  ],
};

const CSS_SHAPE_RADIUS: Record<Exclude<NodeShape, SvgShape>, string> = {
  rectangle: "rounded-xl",
  pill: "rounded-full",
  circle: "rounded-full",
};

function isSvgShape(shape: NodeShape): shape is SvgShape {
  return shape in SVG_PATHS;
}

export function getNodeTextColor(fill: string): string {
  return (
    NODE_COLORS.find((c) => c.fill.toLowerCase() === fill.toLowerCase())
      ?.text ?? "var(--text-primary)"
  );
}

interface NodeShapeProps {
  shape: NodeShape;
  color: string;
  selected?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Filled shape that fills its parent. Used by canvas nodes and the drag preview. */
export function NodeShapeBody({
  shape,
  color,
  selected = false,
  className,
  children,
}: NodeShapeProps) {
  const label = (
    <div
      className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm"
      style={{ color: getNodeTextColor(color) }}
    >
      {children}
    </div>
  );

  if (isSvgShape(shape)) {
    return (
      <div className={cn("relative size-full", className)}>
        <svg
          className="absolute inset-0 size-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {SVG_PATHS[shape].map((d, index) => (
            <path
              key={d}
              d={d}
              fill={index === 0 ? color : "none"}
              strokeWidth={1}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className={selected ? "stroke-brand" : "stroke-surface-border"}
            />
          ))}
        </svg>
        {label}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative size-full border",
        CSS_SHAPE_RADIUS[shape],
        selected ? "border-brand" : "border-surface-border",
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {label}
    </div>
  );
}
