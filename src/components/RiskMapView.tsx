"use client";

import { useState } from "react";
import NetworkMap from "./NetworkMap";
import TelemetryChart from "./TelemetryChart";
import type { SensorNode } from "@/lib/mockData";
import {
  Layers,
  Thermometer,
  Droplets,
  Wind,
  Flame,
  Mountain,
  Waves,
} from "lucide-react";

interface RiskMapViewProps {
  nodes: SensorNode[];
  selectedNode: SensorNode | null;
  onNodeClick: (node: SensorNode) => void;
}

type MapLayer = "all" | "flood" | "fire" | "pollution" | "landslide" | "heat";

const LAYER_CONFIG: Record<
  MapLayer,
  { label: string; icon: React.ReactNode; color: string }
> = {
  all: { label: "All Hazards", icon: <Layers size={13} />, color: "text-teal-400" },
  flood: { label: "Flood", icon: <Droplets size={13} />, color: "text-blue-400" },
  fire: { label: "Fire", icon: <Flame size={13} />, color: "text-red-400" },
  pollution: { label: "Pollution", icon: <Wind size={13} />, color: "text-purple-400" },
  landslide: { label: "Landslide", icon: <Mountain size={13} />, color: "text-amber-400" },
  heat: { label: "Extreme Heat", icon: <Thermometer size={13} />, color: "text-orange-400" },
};

export default function RiskMapView({ nodes, selectedNode, onNodeClick }: RiskMapViewProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayer>("all");

  const filteredNodes =
    activeLayer === "all"
      ? nodes
      : nodes.filter((n) => {
          const hazard = n.inference.hazardType.toLowerCase();
          return (
            hazard === activeLayer ||
            (activeLayer === "heat" && n.inference.hazardType === "Extreme Heat")
          );
        });

  const chartNode = selectedNode ?? nodes[0];

  return (
    <div className="space-y-4">
      {/* Layer Controls */}
      <div className="flex gap-1.5 flex-wrap">
        {(Object.entries(LAYER_CONFIG) as [MapLayer, (typeof LAYER_CONFIG)[MapLayer]][]).map(
          ([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              className={`flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                activeLayer === key
                  ? "bg-slate-700 border-slate-500 text-white"
                  : "bg-slate-800/40 border-slate-700/40 text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className={activeLayer === key ? cfg.color : ""}>{cfg.icon}</span>
              {cfg.label}
            </button>
          )
        )}
      </div>

      {/* Map + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map takes 2/3 */}
        <div className="lg:col-span-2 h-[480px]">
          <NetworkMap
            nodes={filteredNodes}
            onNodeClick={onNodeClick}
            selectedNodeId={selectedNode?.id ?? null}
          />
        </div>

        {/* Chart takes 1/3 */}
        <div className="h-[480px]">
          <TelemetryChart node={chartNode} />
        </div>
      </div>

      {/* Risk Summary Table */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <Waves size={15} className="text-teal-400" />
            <p className="text-sm font-bold text-white">Zonal Risk Summary</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/30 bg-slate-900/30">
                {["Zone", "Node", "Primary Hazard", "Risk Level", "Water Lvl", "AQI", "Temp", "Confidence"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {nodes
                .filter((n) => n.inference.riskLevel !== "Normal")
                .sort((a, b) => {
                  const order = { Critical: 0, Alert: 1, "Precursor Detected": 2, Normal: 3 };
                  return order[a.inference.riskLevel] - order[b.inference.riskLevel];
                })
                .map((node) => (
                  <tr
                    key={node.id}
                    onClick={() => onNodeClick(node)}
                    className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2.5 text-[10px] text-slate-400">{node.location.zone}</td>
                    <td className="px-4 py-2.5 text-[10px] font-bold text-white">{node.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] font-medium text-slate-300">
                        {node.inference.hazardType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[9px] font-bold ${
                          node.inference.riskLevel === "Critical"
                            ? "text-red-400"
                            : node.inference.riskLevel === "Alert"
                              ? "text-orange-400"
                              : "text-yellow-400"
                        }`}
                      >
                        {node.inference.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] font-bold text-blue-400">
                      {node.telemetry.waterLevel}m
                    </td>
                    <td className="px-4 py-2.5 text-[10px] font-bold text-purple-400">
                      {node.telemetry.aqi}
                    </td>
                    <td className="px-4 py-2.5 text-[10px] font-bold text-orange-400">
                      {node.telemetry.temperature}°C
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{ width: `${node.inference.confidence}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400">
                          {node.inference.confidence}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
