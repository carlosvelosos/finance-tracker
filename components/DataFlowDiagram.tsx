"use client";

import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    position: { x: 50, y: 50 },
    data: { label: "Download year statement from Inter bank website" },
    style: {
      background: "linear-gradient(to bottom, #e6f2ff, #cce6ff)",
      color: "#0066cc",
      border: "1px solid #99ccff",
      borderRadius: "8px",
      padding: "10px",
      width: 300,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },
  {
    id: "2",
    type: "default",
    position: { x: 50, y: 150 },
    data: {
      label: (
        <div>
          <p>Save year statement to:</p>
          <code className="bg-gray-100 px-2 py-1 text-xs block mt-1 rounded-sm">
            G:\My Drive\00_Financeiro\00_Brasil\00_BancoInter\Extrato
          </code>
        </div>
      ),
    },
    style: {
      background: "linear-gradient(to bottom, #f2f9ec, #e5f2d9)",
      color: "#336600",
      border: "1px solid #b3d998",
      borderRadius: "8px",
      padding: "10px",
      width: 300,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },
  {
    id: "3",
    type: "default",
    position: { x: 50, y: 250 },
    data: {
      label: (
        <div>
          <p>Go to upload page and select file:</p>
          <a
            href="/upload"
            className="text-blue-600 underline text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            http://localhost:3000/upload/
          </a>
        </div>
      ),
    },
    style: {
      background: "linear-gradient(to bottom, #f0e6ff, #e0ccff)",
      color: "#5500cc",
      border: "1px solid #cc99ff",
      borderRadius: "8px",
      padding: "10px",
      width: 300,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },
  {
    id: "4",
    type: "default",
    position: { x: 50, y: 350 },
    data: {
      label: (
        <div>
          <p>Supabase Source Tables:</p>
          <p className="text-xs mt-1">
            IN_2023, IN_2024, IN_2025 (yearly tables)
          </p>
        </div>
      ),
    },
    style: {
      background: "linear-gradient(to bottom, #e6f9ff, #ccf2ff)",
      color: "#006680",
      border: "1px solid #99e6ff",
      borderRadius: "8px",
      padding: "10px",
      width: 300,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },
  {
    id: "5",
    type: "default",
    position: { x: 400, y: 350 },
    data: {
      label: (
        <div>
          <p>Aggregated Table:</p>
          <p className="text-xs mt-1">Brasil_transactions_agregated_2025</p>
        </div>
      ),
    },
    style: {
      background: "linear-gradient(to bottom, #e6e6ff, #ccccff)",
      color: "#000080",
      border: "1px solid #9999ff",
      borderRadius: "8px",
      padding: "10px",
      width: 300,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },
  {
    id: "6",
    type: "output",
    position: { x: 400, y: 450 },
    data: {
      label: (
        <div>
          <p>Inter Account Page:</p>
          <a
            href="/inter-account"
            className="text-blue-600 underline text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            /inter-account
          </a>
        </div>
      ),
    },
    style: {
      background: "linear-gradient(to bottom, #fff2e6, #ffe0cc)",
      color: "#994d00",
      border: "1px solid #ffcc99",
      borderRadius: "8px",
      padding: "10px",
      width: 300,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#4285F4", strokeWidth: 2 },
    label: "Download",
    labelStyle: { fill: "#4285F4", fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255, 255, 255, 0.8)" },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    style: { stroke: "#8e44ad", strokeWidth: 2 },
    label: "Prepare Upload",
    labelStyle: { fill: "#8e44ad", fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255, 255, 255, 0.8)" },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
    style: { stroke: "#27ae60", strokeWidth: 2 },
    label: "Parse & Store",
    labelStyle: { fill: "#27ae60", fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255, 255, 255, 0.8)" },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    animated: true,
    style: { stroke: "#3949ab", strokeWidth: 2 },
    label: "Aggregate",
    labelStyle: { fill: "#3949ab", fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255, 255, 255, 0.8)" },
  },
  {
    id: "e5-6",
    source: "5",
    target: "6",
    animated: true,
    style: { stroke: "#00897b", strokeWidth: 2 },
    label: "Analyze",
    labelStyle: { fill: "#00897b", fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255, 255, 255, 0.8)" },
  },
];

export default function DataFlowDiagram() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback((connection: Connection) => {
    // This would add a new connection if implemented
  }, []);

  return (
    <div className="w-full h-[700px] border rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultZoom={0.8}
        attributionPosition="bottom-right"
      >
        <Controls position="top-right" showInteractive={false} />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          position="top-left"
          style={{
            height: 100,
            width: 150,
            background: "rgba(255, 255, 255, 0.9)",
          }}
          nodeBorderRadius={8}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#e5e7eb"
        />
      </ReactFlow>
      <div className="absolute bottom-3 left-3 text-xs text-gray-500 bg-white/80 p-2 rounded-md">
        💡 Tip: Drag nodes to rearrange the flow, use mouse wheel to zoom
      </div>
    </div>
  );
}
