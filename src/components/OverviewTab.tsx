"use client";

import KpiCards from "./KpiCards";
import NetworkMap from "./NetworkMap";
import TelemetryChart from "./TelemetryChart";
import AlertsFeed from "./AlertsFeed";
import type { SensorNode, Alert } from "@/lib/mockData";
import {
  BarChart2,
  Activity,
  Droplets,
  Flame,
  Mountain,
  Wind,
  Thermometer,
  Zap,
} from "lucide-react";

interface OverviewTabProps {
  nodes: SensorNode[];
  alerts: Alert[];
  selectedNode: SensorNode | null;
  onNodeClick: (node: SensorNode) => void;
  onAcknowledge: (id: string) => void;
  onNotify: (id: string) => void;
  onAcknowledgeAll?: () => void;
}

export default function OverviewTab({
  nodes,
  alerts,
  selectedNode,
  onNodeClick,
  onAcknowledge,
  onNotify,
  onAcknowledgeAll,
}: OverviewTabProps) {
  const chartNode = selectedNode ?? nodes.find(n => n.inference.riskLevel === "Critical") ?? nodes[0];

  // Disaster / Hazard type counts with vibrant alert styling designed for white mode
  const disasterTypes = [
    {
      hazard: "Flood",
      count: nodes.filter((n) => n.inference.hazardType === "Flood").length,
      icon: <Droplets size={15} />,
      borderAccent: "border-l-blue-600",
      bg: "bg-blue-50/70 hover:bg-blue-100/80 border-blue-200",
      badgeBg: "bg-blue-600 text-white shadow-sm shadow-blue-500/30",
      iconBg: "bg-blue-100 text-blue-600",
      alertDescription: "River surge & water depth telemetry",
    },
    {
      hazard: "Fire",
      count: nodes.filter((n) => n.inference.hazardType === "Fire").length,
      icon: <Flame size={15} />,
      borderAccent: "border-l-red-600",
      bg: "bg-red-50/70 hover:bg-red-100/80 border-red-200",
      badgeBg: "bg-red-600 text-white shadow-sm shadow-red-500/30 animate-pulse",
      iconBg: "bg-red-100 text-red-600",
      alertDescription: "Thermal anomalies & combustion smoke",
    },
    {
      hazard: "Pollution",
      count: nodes.filter((n) => n.inference.hazardType === "Pollution").length,
      icon: <Wind size={15} />,
      borderAccent: "border-l-purple-600",
      bg: "bg-purple-50/70 hover:bg-purple-100/80 border-purple-200",
      badgeBg: "bg-purple-600 text-white shadow-sm shadow-purple-500/30",
      iconBg: "bg-purple-100 text-purple-600",
      alertDescription: "Particulate matter & hazardous gases",
    },
    {
      hazard: "Landslide",
      count: nodes.filter((n) => n.inference.hazardType === "Landslide").length,
      icon: <Mountain size={15} />,
      borderAccent: "border-l-amber-600",
      bg: "bg-amber-50/70 hover:bg-amber-100/80 border-amber-200",
      badgeBg: "bg-amber-600 text-white shadow-sm shadow-amber-500/30",
      iconBg: "bg-amber-100 text-amber-700",
      alertDescription: "Slope instability & excessive saturation",
    },
    {
      hazard: "Extreme Heat",
      count: nodes.filter((n) => n.inference.hazardType === "Extreme Heat").length,
      icon: <Thermometer size={15} />,
      borderAccent: "border-l-orange-600",
      bg: "bg-orange-50/70 hover:bg-orange-100/80 border-orange-200",
      badgeBg: "bg-orange-600 text-white shadow-sm shadow-orange-500/30",
      iconBg: "bg-orange-100 text-orange-600",
      alertDescription: "Dangerous ambient heat index thresholds",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Row 1: KPI Cards */}
      <KpiCards
        totalNodes={45}
        onlineNodes={42}
        criticalAlerts={alerts.filter((a) => a.riskLevel === "Critical").length}
        activeAlerts={alerts.filter((a) => a.riskLevel !== "Normal").length}
        highestRiskZone="Zone A – River Basin"
      />

      {/* Row 2: PRIMARY CENTER OF CONCENTRATION — Edge AI Alert Feed */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </div>
            <h2 className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-2">
              Primary Surveillance & Edge AI Incident Feed
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 normal-case tracking-normal">
                Center of Concentration
              </span>
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
            ACTIVE INFERENCE STREAM · PRIORITY RESPONSE
          </span>
        </div>
        <AlertsFeed
          alerts={alerts}
          onAcknowledge={onAcknowledge}
          onNotify={onNotify}
          onAcknowledgeAll={onAcknowledgeAll}
        />
      </section>

      {/* Row 3: Geospatial Network Map + Telemetry & Disaster Types */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 h-[480px]">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-teal-400" />
              <p className="text-xs font-bold text-white">Live Sensor Network Map</p>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-node-pulse" />
                <span className="text-[9px] text-teal-400 font-medium">LIVE</span>
              </div>
            </div>
            <div className="flex-1">
              <NetworkMap
                nodes={nodes}
                onNodeClick={onNodeClick}
                selectedNodeId={selectedNode?.id ?? null}
              />
            </div>
          </div>
        </div>

        {/* Right panel: Chart + Disaster Type Active Detection in White Mode */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Telemetry Chart */}
          <div className="min-h-56">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 size={14} className="text-blue-400" />
              <p className="text-xs font-bold text-white">Sensor Telemetry</p>
              <span className="text-[10px] text-slate-500 ml-1">
                · {chartNode.name}
              </span>
            </div>
            <div className="h-56">
              <TelemetryChart node={chartNode} />
            </div>
          </div>

          {/* Disaster Type Active Detection Card in White Mode */}
          <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-4 text-slate-900 transition-all">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                  <Zap size={14} className="animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Disaster Types
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Active Edge AI Alert Classification
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                Live Status
              </span>
            </div>

            <div className="space-y-2">
              {disasterTypes.map((d) => (
                <div
                  key={d.hazard}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border border-l-4 ${d.borderAccent} ${d.bg} transition-all shadow-xs`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${d.iconBg} shrink-0`}>
                      {d.icon}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {d.hazard}
                      </span>
                      <span className="text-[9px] text-slate-500 font-medium block">
                        {d.alertDescription}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${d.badgeBg}`}>
                      {d.count} {d.count === 1 ? "node" : "nodes"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
