"use client";

import React, { useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom node component for better styling
const CustomNode = ({ data }: { data: any }) => {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] max-w-[250px] ${data.bgColor} ${data.borderColor} transition-all duration-200 hover:shadow-xl hover:scale-105`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{data.icon}</span>
        <div className="font-bold text-sm">{data.title}</div>
      </div>
      <div className={`text-xs mt-1 ${data.textColor} whitespace-pre-line`}>
        {data.description}
      </div>
      {data.link && (
        <a
          href={data.link}
          target={data.external ? "_blank" : "_self"}
          rel={data.external ? "noopener noreferrer" : ""}
          className={`text-xs underline mt-2 block hover:opacity-80 transition-opacity ${data.textColor} font-medium`}
        >
          {data.linkText}
        </a>
      )}
      {data.badge && (
        <div className="mt-2">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${data.badgeColor}`}
          >
            {data.badge}
          </span>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 50, y: 50 },
    data: {
      title: "Inter Bank Brasil Website",
      description:
        "Download bank account statements\n(NOT credit card invoices)\nDate range: Jan 1st to today",
      icon: "🏦",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-400",
      textColor: "text-blue-700",
      link: "https://inter.co/",
      linkText: "🌐 Open inter.co",
      external: true,
      badge: "Manual Step",
      badgeColor: "bg-blue-200 text-blue-800",
    },
    sourcePosition: Position.Right,
  },
  {
    id: "2",
    type: "custom",
    position: { x: 350, y: 50 },
    data: {
      title: "Local File System",
      description:
        "Store files: CSV, PDF, OFX\nLocation: G:\\My Drive\\...\\Extrato\nFormat: Extrato-01-01-YYYY-a-DD-MM-YYYY",
      icon: "📁",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-400",
      textColor: "text-orange-700",
      badge: "File Storage",
      badgeColor: "bg-orange-200 text-orange-800",
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "3",
    type: "custom",
    position: { x: 650, y: 50 },
    data: {
      title: "Upload Files Page",
      description:
        'Select "Inter-BR" bank\nUpload statement files\nAutomatic parsing',
      icon: "⬆️",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-400",
      textColor: "text-purple-700",
      link: "/upload",
      linkText: "📤 Go to /upload",
      external: false,
      badge: "App Feature",
      badgeColor: "bg-purple-200 text-purple-800",
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Left,
  },
  {
    id: "4",
    type: "custom",
    position: { x: 650, y: 280 },
    data: {
      title: "Supabase Source Tables",
      description:
        "Yearly tables: IN_2023, IN_2024, IN_2025\nRaw transaction data\nBank-specific structure",
      icon: "🗄️",
      bgColor: "bg-green-100",
      borderColor: "border-green-400",
      textColor: "text-green-700",
      badge: "Database",
      badgeColor: "bg-green-200 text-green-800",
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "5",
    type: "custom",
    position: { x: 650, y: 500 },
    data: {
      title: "Update Inter Data Button",
      description:
        "Aggregate source tables (IN_*)\nInto unified Brasil_transactions_agregated_2025\nMaintains source tracking",
      icon: "🔄",
      bgColor: "bg-indigo-100",
      borderColor: "border-indigo-400",
      textColor: "text-indigo-700",
      link: "/inter-account",
      linkText: "🔗 Go to /inter-account",
      external: false,
      badge: "Aggregation",
      badgeColor: "bg-indigo-200 text-indigo-800",
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Top,
  },
  {
    id: "6",
    type: "custom",
    position: { x: 950, y: 500 },
    data: {
      title: "Inter Account Page",
      description:
        "View unified transactions\nFilter by month/category\nAnalyze spending patterns",
      icon: "📊",
      bgColor: "bg-teal-100",
      borderColor: "border-teal-400",
      textColor: "text-teal-700",
      badge: "Analysis",
      badgeColor: "bg-teal-200 text-teal-800",
    },
    targetPosition: Position.Left,
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2 },
    label: "Download",
    labelStyle: { fill: "#3b82f6", fontWeight: 600 },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
    label: "Upload",
    labelStyle: { fill: "#8b5cf6", fontWeight: 600 },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2 },
    label: "Parse & Store",
    labelStyle: { fill: "#10b981", fontWeight: 600 },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    label: "Aggregate",
    labelStyle: { fill: "#6366f1", fontWeight: 600 },
  },
  {
    id: "e5-6",
    source: "5",
    target: "6",
    type: "smoothstep",
    animated: true,
    style: { stroke: "#14b8a6", strokeWidth: 2 },
    label: "Analyze",
    labelStyle: { fill: "#14b8a6", fontWeight: 600 },
  },
];

export default function DataFlowDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-[700px] border rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Controls className="!left-4 !bottom-4" />
        <MiniMap
          className="!bg-gray-100 !border !border-gray-300 !right-4 !top-4"
          nodeStrokeColor={(n) => {
            if (n.type === "custom") return "#6b7280";
            return "#1a192b";
          }}
          nodeColor={(n) => {
            if (n.type === "custom") return "#93c5fd";
            return "#fff";
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
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-md border">
        <h6 className="text-xs font-semibold text-gray-700 mb-1">
          💡 Interaction Guide
        </h6>
        <ul className="text-xs text-gray-600 space-y-0.5">
          <li>• Drag nodes to rearrange</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Click links to navigate</li>
          <li>• Use minimap for overview</li>
        </ul>
      </div>
    </div>
  );
}
