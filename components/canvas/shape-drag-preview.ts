import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { NodeShapeBody } from "@/components/canvas/node-shape";
import {
  DEFAULT_NODE_COLOR,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";

/**
 * Replaces the browser's drag image with a ghost of the shape at its drop size.
 * The browser attaches the image to the cursor and removes it when the drag ends
 * (dropped or cancelled); we only need to clean up our offscreen source element.
 */
export function setShapeDragPreview(
  event: React.DragEvent,
  shape: NodeShape,
  size: Pick<ShapeDragPayload, "width" | "height">,
) {
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${size.width}px;height:${size.height}px;opacity:0.6;pointer-events:none;`;
  document.body.appendChild(host);

  const root = createRoot(host);
  flushSync(() => {
    root.render(
      createElement(NodeShapeBody, { shape, color: DEFAULT_NODE_COLOR.fill }),
    );
  });

  // Center the ghost on the cursor, matching where the node lands on drop.
  event.dataTransfer.setDragImage(host, size.width / 2, size.height / 2);

  // The browser snapshots the element synchronously, so it can go on the next tick.
  setTimeout(() => {
    root.unmount();
    host.remove();
  }, 0);
}
