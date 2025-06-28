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
    data: {
      label: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-black font-bold text-sm">
              1
            </div>
            <h3 className="font-medium">
              Manual Download from Inter Bank Brasil
            </h3>
          </div>
          <p className="text-sm">
            🏦 Navigate to inter.co → Access "Extratos" → Download yearly bank
            account statements (Jan 1st to current date)
          </p>
          <p className="text-xs text-gray-600">
            Download all formats: CSV, PDF, OFX
          </p>
        </div>
      ),
    },
    style: {
      background: "#ffffff",
      color: "#333333",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      width: 640,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
  },
  {
    id: "2",
    type: "default",
    position: { x: 50, y: 200 },
    data: {
      label: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-black font-bold text-sm">
              2
            </div>
            <h3 className="font-medium">File Storage & Organization</h3>
          </div>
          <code className="bg-gray-100 px-3 py-2 text-xs block mt-1 rounded-sm w-full overflow-x-auto">
            G:\My Drive\00_Financeiro\00_Brasil\00_BancoInter\Extrato
          </code>
          <p className="text-xs text-gray-600">
            Naming: Extrato-01-01-YYYY-a-DD-MM-YYYY
          </p>
        </div>
      ),
    },
    style: {
      background: "#ffffff",
      color: "#333333",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      width: 640,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
  },
  {
    id: "3",
    type: "default",
    position: { x: 50, y: 350 },
    data: {
      label: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-black font-bold text-sm">
              3
            </div>
            <h3 className="font-medium">Upload to Application</h3>
          </div>
          <a
            href="/upload"
            className="text-blue-600 underline text-sm block mt-1 px-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            📁 /upload
          </a>
          <p className="text-xs text-gray-600">
            Select "Inter-BR" bank → Upload CSV file → Automatic parsing &
            validation
          </p>
        </div>
      ),
    },
    style: {
      background: "#ffffff",
      color: "#333333",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      width: 640,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
  },
  {
    id: "4",
    type: "default",
    position: { x: 50, y: 500 },
    data: {
      label: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-black font-bold text-sm">
              4
            </div>
            <h3 className="font-medium">Supabase Source Table Creation</h3>
          </div>
          <p className="text-xs mt-2 px-2">
            🗄️ Bank Statements: IN_YYYY (yearly tables)
          </p>
          <p className="text-xs px-2 text-gray-600">
            Examples: IN_2023, IN_2024, IN_2025
          </p>
        </div>
      ),
    },
    style: {
      background: "#ffffff",
      color: "#333333",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      width: 640,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
  },
  {
    id: "5",
    type: "default",
    position: { x: 50, y: 650 },
    data: {
      label: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-black font-bold text-sm">
              5
            </div>
            <h3 className="font-medium">Data Aggregation Process</h3>
          </div>
          <p className="text-xs mt-2 px-2">
            🔄 Use "Update Inter Data" button → Select source tables → Aggregate
            to unified table
          </p>
          <p className="text-xs px-2 text-gray-600">
            Target: Brasil_transactions_agregated_2025
          </p>
        </div>
      ),
    },
    style: {
      background: "#ffffff",
      color: "#333333",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      width: 640,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
  },
  {
    id: "6",
    type: "output",
    position: { x: 50, y: 800 },
    data: {
      label: (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-black font-bold text-sm">
              6
            </div>
            <h3 className="font-medium">Data Analysis & Visualization</h3>
          </div>
          <a
            href="/inter-account"
            className="text-blue-600 underline text-sm block mt-2 px-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            📊 /inter-account
          </a>
          <p className="text-xs text-gray-600">
            Auto-filter Inter-BR transactions → Month/category filtering →
            Charts & analysis
          </p>
        </div>
      ),
    },
    style: {
      background: "#ffffff",
      color: "#333333",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "16px",
      width: 640,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
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
    label: "Save Files",
    labelStyle: { fill: "#4285F4", fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255, 255, 255, 0.8)" },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    style: { stroke: "#8e44ad", strokeWidth: 2 },
    label: "Upload CSV",
    labelStyle: { fill: "#8e44ad", fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255, 255, 255, 0.8)" },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
    style: { stroke: "#27ae60", strokeWidth: 2 },
    label: "Create Tables",
    labelStyle: { fill: "#27ae60", fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255, 255, 255, 0.8)" },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    animated: true,
    style: { stroke: "#3949ab", strokeWidth: 2 },
    label: "Aggregate Data",
    labelStyle: { fill: "#3949ab", fontWeight: 500 },
    labelBgStyle: { fill: "rgba(255, 255, 255, 0.8)" },
  },
  {
    id: "e5-6",
    source: "5",
    target: "6",
    animated: true,
    style: { stroke: "#00897b", strokeWidth: 2 },
    label: "Analyze & Visualize",
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
    <div className="w-full h-[1200px] border rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.4}
        maxZoom={1.5}
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
