"use client";

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useRef } from "react";
import "@xyflow/react/dist/style.css";
import { CanvasNodeView } from "@/components/canvas/canvas-node";
import { ShapePanel } from "@/components/canvas/shape-panel";
import {
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  SHAPE_DRAG_TYPE,
  type CanvasEdge,
  type CanvasNode,
  type ShapeDragPayload,
} from "@/types/canvas";

const nodeTypes: NodeTypes = { canvasNode: CanvasNodeView };

function parseDragPayload(raw: string): ShapeDragPayload | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { shape, width, height } = value as Record<string, unknown>;
    if (
      typeof width !== "number" ||
      typeof height !== "number" ||
      !NODE_SHAPES.some((s) => s === shape)
    ) {
      return null;
    }
    return { shape: shape as ShapeDragPayload["shape"], width, height };
  } catch {
    return null;
  }
}

function CanvasFlow() {
  const { screenToFlowPosition } = useReactFlow();
  const nodeCounter = useRef(0);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  function handleDragOver(event: React.DragEvent) {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(event: React.DragEvent) {
    const payload = parseDragPayload(event.dataTransfer.getData(SHAPE_DRAG_TYPE));
    if (!payload) return;
    event.preventDefault();

    const drop = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    nodeCounter.current += 1;
    const node: CanvasNode = {
      // Random suffix: two collaborators can share a timestamp and counter value.
      id: `${payload.shape}-${Date.now()}-${nodeCounter.current}-${crypto.randomUUID().slice(0, 8)}`,
      type: "canvasNode",
      // Center the node on the cursor.
      position: { x: drop.x - payload.width / 2, y: drop.y - payload.height / 2 },
      width: payload.width,
      height: payload.height,
      data: { label: "", color: DEFAULT_NODE_COLOR.fill, shape: payload.shape },
    };
    onNodesChange([{ type: "add", item: node }]);
  }

  return (
    <div className="absolute inset-0" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow
        colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <MiniMap pannable zoomable />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  );
}
