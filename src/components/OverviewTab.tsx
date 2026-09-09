"use client";

import KpiCards from "./KpiCards";
import NetworkMap from "./NetworkMap";
import TelemetryChart from "./TelemetryChart";
import AlertsFeed from "./AlertsFeed";
import type { SensorNode, Alert } from "@/lib/mockData";
import {
  BarChart2,
  Activity,
  Cpu,
  Cloud,
  Droplets,
  Flame,
  Mountain,
  Wind,
  Thermometer,
  Zap,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface OverviewTabProps {
  nodes: SensorNode[];
  alerts: Alert[];
  selectedNode: SensorNode | null;
  onNodeClick: (node: SensorNode) => void;
  onAcknowledge: (id: string) => void;
  onNotify: (id: string) => void;
}

// Custom radar tooltip
function RadarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { subject: string } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600/60 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[10px] text-slate-400 mb-0.5">{payload[0].payload.subject}</p>
        <p className="text-xs font-bold text-white">Risk Index: {payload[0].value}</p>
      </div>
    );
  }
  return null;
}

// Custom bar tooltip
function BarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600/60 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[10px] text-slate-400 mb-1 font-mono">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[10px] text-white">{p.name}: <b>{p.value}</b></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function OverviewTab({
  nodes,
  alerts,
  selectedNode,
  onNodeClick,
  onAcknowledge,
  onNotify,
}: OverviewTabProps) {
  const chartNode = selectedNode ?? nodes.find(n => n.inference.riskLevel === "Critical") ?? nodes[0];

  // Build radar data from hazard coverage
  const radarData = [
    {
      subject: "Flood",
      value: Math.round(
        nodes.filter((n) => n.inference.hazardType === "Flood").reduce((a, b) => a + b.inference.confidence, 0) /
          Math.max(1, nodes.filter((n) => n.inference.hazardType === "Flood").length)
      ),
    },
    {
      subject: "Fire",
      value: Math.round(
        nodes.filter((n) => n.inference.hazardType === "Fire").reduce((a, b) => a + b.inference.confidence, 0) /
          Math.max(1, nodes.filter((n) => n.inference.hazardType === "Fire").length)
      ),
    },
    {
      subject: "Pollution",
      value: Math.round(
        nodes.filter((n) => n.inference.hazardType === "Pollution").reduce((a, b) => a + b.inference.confidence, 0) /
          Math.max(1, nodes.filter((n) => n.inference.hazardType === "Pollution").length)
      ),
    },
    {
      subject: "Landslide",
      value: Math.round(
        nodes.filter((n) => n.inference.hazardType === "Landslide").reduce((a, b) => a + b.inference.confidence, 0) /
          Math.max(1, nodes.filter((n) => n.inference.hazardType === "Landslide").length)
      ),
    },
    {
      subject: "Heat",
      value: Math.round(
        nodes.filter((n) => n.inference.hazardType === "Extreme Heat").reduce((a, b) => a + b.inference.confidence, 0) /
          Math.max(1, nodes.filter((n) => n.inference.hazardType === "Extreme Heat").length)
      ),
    },
  ];

  // Regional AQI by zone
  const aqiBarData = nodes
    .filter((n) => n.status !== "Offline")
    .slice(0, 8)
    .map((n) => ({
      name: n.name.split(" ")[1] ?? n.name,
      aqi: n.telemetry.aqi,
      temp: n.telemetry.temperature,
    }));

  // Hazard type counts
  const hazardCounts = [
    { hazard: "Flood", count: nodes.filter(n => n.inference.hazardType === "Flood").length, icon: <Droplets size={14} />, color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" },
    { hazard: "Fire", count: nodes.filter(n => n.inference.hazardType === "Fire").length, icon: <Flame size={14} />, color: "text-red-400", bg: "bg-red-500/15 border-red-500/30" },
    { hazard: "Pollution", count: nodes.filter(n => n.inference.hazardType === "Pollution").length, icon: <Wind size={14} />, color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30" },
    { hazard: "Landslide", count: nodes.filter(n => n.inference.hazardType === "Landslide").length, icon: <Mountain size={14} />, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
    { hazard: "Extreme Heat", count: nodes.filter(n => n.inference.hazardType === "Extreme Heat").length, icon: <Thermometer size={14} />, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30" },
  ];

  return (
    <div className="space-y-4">
      {/* Row 1: KPI Cards */}
      <KpiCards
        totalNodes={45}
        onlineNodes={42}
        criticalAlerts={alerts.filter((a) => a.riskLevel === "Critical").length}
        activeAlerts={alerts.filter((a) => a.riskLevel !== "Normal").length}
        avgAQI={Math.round(nodes.filter(n => n.status !== "Offline").reduce((a, b) => a + b.telemetry.aqi, 0) / Math.max(1, nodes.filter(n => n.status !== "Offline").length))}
        highestRiskZone="Zone A – River Basin"
      />

      {/* Row 2: Map + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 h-[400px]">
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

        {/* Right panel: Chart + Mini stats */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Telemetry Chart */}
          <div className="flex-1 min-h-64">
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

          {/* Hazard Distribution */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Zap size={13} className="text-yellow-400" />
              <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                Active Hazard Detection
              </p>
            </div>
            <div className="space-y-1.5">
              {hazardCounts.map((h) => (
                <div key={h.hazard} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border ${h.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={h.color}>{h.icon}</span>
                    <span className="text-[10px] text-slate-300 font-medium">{h.hazard}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-black ${h.color}`}>{h.count}</span>
                    <span className="text-[9px] text-slate-600">node{h.count !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cloud size={14} className="text-teal-400" />
            <p className="text-xs font-bold text-white">Multi-Hazard Risk Index</p>
            <span className="text-[9px] text-slate-500 ml-1">AI confidence avg</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 0, right: 16, left: 16, bottom: 0 }}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <Radar
                  name="Risk Level"
                  dataKey="value"
                  stroke="#14b8a6"
                  fill="#14b8a6"
                  fillOpacity={0.2}
                  dot={{ fill: "#14b8a6", r: 3 }}
                />
                <Tooltip content={<RadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AQI Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wind size={14} className="text-purple-400" />
            <p className="text-xs font-bold text-white">AQI & Temp by Node</p>
            <span className="text-[9px] text-slate-500 ml-1">real-time</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aqiBarData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" strokeOpacity={0.8} />
                <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="aqi" name="AQI" fill="#a78bfa" radius={[2, 2, 0, 0]} />
                <Bar dataKey="temp" name="Temp °C" fill="#f97316" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Alert Feed */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Cpu size={14} className="text-red-400" />
          <p className="text-xs font-bold text-white">Edge AI Alert Feed</p>
        </div>
        <AlertsFeed
          alerts={alerts}
          onAcknowledge={onAcknowledge}
          onNotify={onNotify}
        />
      </div>
    </div>
  );
}
