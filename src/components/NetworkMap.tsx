"use client";

import { useState, useRef, useEffect } from "react";
import type { SensorNode } from "@/lib/mockData";
import { Wifi, WifiOff, AlertTriangle, Thermometer, Droplets, Wind } from "lucide-react";

interface NetworkMapProps {
  nodes: SensorNode[];
  onNodeClick: (node: SensorNode) => void;
  selectedNodeId: string | null;
}

// Map node lat/lon to SVG x/y coordinates
function projectNode(
  lat: number,
  lon: number,
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
  width: number,
  height: number
) {
  const padding = 48;
  const x =
    padding +
    ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) *
      (width - padding * 2);
  const y =
    padding +
    ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) *
      (height - padding * 2);
  return { x, y };
}

const RISK_CONFIG = {
  Normal: { color: "#22c55e", glow: "rgba(34,197,94,0.5)", ring: "#22c55e33" },
  "Precursor Detected": {
    color: "#eab308",
    glow: "rgba(234,179,8,0.5)",
    ring: "#eab30833",
  },
  Alert: {
    color: "#f97316",
    glow: "rgba(249,115,22,0.6)",
    ring: "#f9731633",
  },
  Critical: {
    color: "#ef4444",
    glow: "rgba(239,68,68,0.7)",
    ring: "#ef444433",
  },
};

const HAZARD_ICONS: Record<string, string> = {
  Flood: "💧",
  Fire: "🔥",
  Pollution: "☁️",
  Landslide: "⛰️",
  "Extreme Heat": "🌡️",
  Normal: "✓",
};

export default function NetworkMap({
  nodes,
  onNodeClick,
  selectedNodeId,
}: NetworkMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 640, height: 380 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDims({
          width: entry.contentRect.width,
          height: Math.max(300, entry.contentRect.height),
        });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Animation tick for pulse rings
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 50);
    return () => clearInterval(t);
  }, []);

  const bounds = {
    minLat: 13.88,
    maxLat: 14.58,
    minLon: 120.98,
    maxLon: 121.62,
  };

  const onlineNodes = nodes.filter((n) => n.status !== "Offline");
  const criticalNodes = nodes.filter((n) => n.inference.riskLevel === "Critical");

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60"
    >
      {/* Background terrain styling */}
      <div
        className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/30 via-slate-900/60 to-slate-950"
      />

      {/* Grid overlay */}
      <svg
        className="absolute inset-0 opacity-10"
        width={dims.width}
        height={dims.height}
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Map Title + Legend */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <div className="glass-panel rounded-lg px-3 py-1.5">
          <p className="text-[10px] text-teal-400 uppercase tracking-widest font-bold">
            Regional Sensor Network
          </p>
          <p className="text-[9px] text-slate-500">
            {onlineNodes.length}/{nodes.length} nodes online
          </p>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {criticalNodes.map((n) => (
          <div
            key={n.id}
            className="glass-panel rounded-lg px-2.5 py-1.5 border-l-2 border-red-500 animate-fade-in"
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={10} className="text-red-400 animate-status-blink" />
              <p className="text-[9px] text-red-300 font-bold">
                {n.name} · CRITICAL
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main SVG Map */}
      <svg
        width={dims.width}
        height={dims.height}
        className="relative z-10"
        style={{ cursor: "default" }}
      >
        <defs>
          {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
            <radialGradient key={key} id={`glow-${key.replace(" ", "-")}`}>
              <stop offset="0%" stopColor={cfg.glow} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          ))}
          <filter id="blur-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines between nearby nodes */}
        {nodes
          .filter((n) => n.status !== "Offline")
          .map((nodeA) => {
            const posA = projectNode(
              nodeA.location.lat,
              nodeA.location.lon,
              bounds,
              dims.width,
              dims.height
            );
            return nodes
              .filter((nodeB) => {
                if (nodeB.id <= nodeA.id || nodeB.status === "Offline")
                  return false;
                const dist = Math.sqrt(
                  Math.pow(nodeB.location.lat - nodeA.location.lat, 2) +
                    Math.pow(nodeB.location.lon - nodeA.location.lon, 2)
                );
                return dist < 0.22;
              })
              .map((nodeB) => {
                const posB = projectNode(
                  nodeB.location.lat,
                  nodeB.location.lon,
                  bounds,
                  dims.width,
                  dims.height
                );
                return (
                  <line
                    key={`${nodeA.id}-${nodeB.id}`}
                    x1={posA.x}
                    y1={posA.y}
                    x2={posB.x}
                    y2={posB.y}
                    stroke="#14b8a6"
                    strokeWidth="0.8"
                    strokeOpacity="0.2"
                    strokeDasharray="4 4"
                  />
                );
              });
          })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = projectNode(
            node.location.lat,
            node.location.lon,
            bounds,
            dims.width,
            dims.height
          );
          const config = RISK_CONFIG[node.inference.riskLevel];
          const isSelected = selectedNodeId === node.id;
          const isHovered = hovered === node.id;
          const isOffline = node.status === "Offline";
          const isActive =
            node.inference.riskLevel === "Critical" ||
            node.inference.riskLevel === "Alert";

          const nodeColor = isOffline ? "#475569" : config.color;
          const outerR = isSelected || isHovered ? 26 : 22;
          const innerR = 8;

          // Pulse animation progress (0-1)
          const pulsePhase = ((tick * 50) % 2000) / 2000;

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onNodeClick(node)}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Animated ripple rings for alert nodes */}
              {isActive && !isOffline && (
                <>
                  <circle
                    r={innerR + 8 + pulsePhase * 24}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="1"
                    opacity={Math.max(0, 0.6 - pulsePhase * 0.6)}
                  />
                  <circle
                    r={innerR + 4 + ((pulsePhase + 0.5) % 1) * 24}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="0.8"
                    opacity={Math.max(0, 0.4 - ((pulsePhase + 0.5) % 1) * 0.4)}
                  />
                </>
              )}

              {/* Glow background */}
              {!isOffline && (
                <circle
                  r={outerR}
                  fill={config.ring}
                  filter="url(#blur-glow)"
                />
              )}

              {/* Outer ring (selected state) */}
              {isSelected && (
                <circle
                  r={outerR + 4}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}

              {/* Main node circle */}
              <circle
                r={innerR + (isSelected ? 2 : 0)}
                fill={isOffline ? "#1e293b" : nodeColor + "33"}
                stroke={nodeColor}
                strokeWidth={isSelected ? 2.5 : 1.5}
              />

              {/* Inner dot */}
              <circle
                r={4}
                fill={nodeColor}
                opacity={isOffline ? 0.4 : 1}
              />

              {/* Node label */}
              {(isHovered || isSelected || isActive) && (
                <g>
                  <rect
                    x={-45}
                    y={-32}
                    width={90}
                    height={18}
                    rx={4}
                    fill="#0f172a"
                    fillOpacity="0.9"
                    stroke={nodeColor}
                    strokeWidth="0.5"
                  />
                  <text
                    x={0}
                    y={-20}
                    textAnchor="middle"
                    fill={nodeColor}
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {node.name.substring(0, 16)}
                  </text>
                </g>
              )}

              {/* Status indicator dot */}
              <circle
                cx={8}
                cy={-8}
                r={3}
                fill={
                  node.status === "Online"
                    ? "#22c55e"
                    : node.status === "Low-Bandwidth"
                      ? "#eab308"
                      : "#ef4444"
                }
                stroke="#0f172a"
                strokeWidth="1"
              />

              {/* Hazard emoji */}
              {!isOffline && node.inference.riskLevel !== "Normal" && (
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fontSize="7"
                  dominantBaseline="middle"
                >
                  {HAZARD_ICONS[node.inference.hazardType]}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hovered && (() => {
        const node = nodes.find((n) => n.id === hovered);
        if (!node) return null;
        const config = RISK_CONFIG[node.inference.riskLevel];
        return (
          <div
            className="absolute bottom-4 left-4 z-20 glass-panel rounded-xl p-3 border min-w-48 animate-fade-in"
            style={{ borderColor: config.color + "40" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-white">{node.name}</p>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: config.color + "20",
                  color: config.color,
                  border: `1px solid ${config.color}40`,
                }}
              >
                {node.inference.riskLevel}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1">
                <Thermometer size={10} className="text-orange-400" />
                <span className="text-[10px] text-slate-300">
                  {node.telemetry.temperature}°C
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets size={10} className="text-blue-400" />
                <span className="text-[10px] text-slate-300">
                  {node.telemetry.humidity}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Wind size={10} className="text-slate-400" />
                <span className="text-[10px] text-slate-300">
                  {node.telemetry.aqi} AQI
                </span>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 mt-1.5">
              {node.id} · {node.status === "Online" ? "🟢" : node.status === "Low-Bandwidth" ? "🟡" : "🔴"} {node.status}
            </p>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-10 glass-panel rounded-lg px-2.5 py-2">
        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-medium">
          Risk Level
        </p>
        {Object.entries(RISK_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 mb-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cfg.color }}
            />
            <span className="text-[9px] text-slate-400">{key}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-slate-700/40">
          <Wifi size={8} className="text-slate-500" />
          <span className="text-[9px] text-slate-500">Mesh links</span>
        </div>
      </div>

      {/* Corner scanner effect */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-teal-500/40 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-teal-500/40 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-teal-500/40 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-500/40 rounded-br-xl pointer-events-none" />
    </div>
  );
}
