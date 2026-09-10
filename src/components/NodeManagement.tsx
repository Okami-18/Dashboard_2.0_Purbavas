"use client";

import { useState } from "react";
import {
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Battery,
  Sun,
  Clock,
  ChevronRight,
  Signal,
  Thermometer,
  Droplets,
  Waves,
  Wind,
} from "lucide-react";
import type { SensorNode, NodeStatus, RiskLevel } from "@/lib/mockData";

interface NodeManagementProps {
  nodes: SensorNode[];
  onNodeSelect: (node: SensorNode) => void;
}

const STATUS_STYLE: Record<NodeStatus, { color: string; icon: React.ReactNode; bg: string }> = {
  Online: {
    color: "text-green-400",
    icon: <Wifi size={12} />,
    bg: "bg-green-500/10 border-green-500/30",
  },
  Offline: {
    color: "text-red-400",
    icon: <WifiOff size={12} />,
    bg: "bg-red-500/10 border-red-500/30",
  },
  "Low-Bandwidth": {
    color: "text-yellow-400",
    icon: <Signal size={12} />,
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
};

const RISK_COLOR: Record<RiskLevel, string> = {
  Normal: "text-green-400",
  "Precursor Detected": "text-yellow-400",
  Alert: "text-orange-400",
  Critical: "text-red-400",
};

const RISK_BG: Record<RiskLevel, string> = {
  Normal: "bg-green-500/10 border-green-500/20",
  "Precursor Detected": "bg-yellow-500/10 border-yellow-500/20",
  Alert: "bg-orange-500/10 border-orange-500/20",
  Critical: "bg-red-500/10 border-red-500/20",
};

export default function NodeManagement({ nodes, onNodeSelect }: NodeManagementProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NodeStatus | "All">("All");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = nodes.filter((n) => {
    const matchSearch =
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.id.toLowerCase().includes(search.toLowerCase()) ||
      n.location.zone.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || n.status === statusFilter;
    const matchRisk =
      riskFilter === "All" || n.inference.riskLevel === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  });

  const stats = {
    online: nodes.filter((n) => n.status === "Online").length,
    offline: nodes.filter((n) => n.status === "Offline").length,
    lowBand: nodes.filter((n) => n.status === "Low-Bandwidth").length,
    critical: nodes.filter((n) => n.inference.riskLevel === "Critical").length,
    alert: nodes.filter((n) => n.inference.riskLevel === "Alert").length,
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Online", value: stats.online, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: <Wifi size={14} /> },
          { label: "Offline", value: stats.offline, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: <WifiOff size={14} /> },
          { label: "Low-BW", value: stats.lowBand, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: <Signal size={14} /> },
          { label: "Critical", value: stats.critical, color: "text-red-400", bg: "bg-red-500/15 border-red-500/30", icon: <AlertTriangle size={14} /> },
          { label: "Alerts", value: stats.alert, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: <CheckCircle size={14} /> },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-xl px-3 py-2.5 flex items-center gap-2.5`}>
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className="text-lg font-black text-white leading-tight">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search nodes by name, ID, or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/40 text-sm text-white placeholder-slate-600 rounded-lg pl-8 pr-3 py-2 outline-none focus:border-teal-500/50 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as NodeStatus | "All")}
              className="bg-slate-900/60 border border-slate-700/40 text-sm text-slate-300 rounded-lg px-2 py-2 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Low-Bandwidth">Low-BW</option>
            </select>
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "All")}
            className="bg-slate-900/60 border border-slate-700/40 text-sm text-slate-300 rounded-lg px-2 py-2 outline-none"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="Alert">Alert</option>
            <option value="Precursor Detected">Precursor</option>
            <option value="Normal">Normal</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-slate-900/60 border border-slate-700/40 rounded-lg overflow-hidden">
            {(["grid", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-2 text-xs font-medium capitalize transition-all ${
                  view === v
                    ? "bg-slate-700 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nodes Grid / Table */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((node) => {
            const statusStyle = STATUS_STYLE[node.status];
            const riskColor = RISK_COLOR[node.inference.riskLevel];
            const riskBg = RISK_BG[node.inference.riskLevel];
            const isCritical = node.inference.riskLevel === "Critical";

            return (
              <button
                key={node.id}
                onClick={() => onNodeSelect(node)}
                className={`text-left bg-slate-800/50 border rounded-xl p-3.5 hover:bg-slate-700/50 transition-all group ${
                  isCritical
                    ? "border-red-500/40 glow-red"
                    : "border-slate-700/60 hover:border-slate-600/60"
                }`}
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">
                      {node.name}
                    </p>
                    <p className="text-[9px] font-mono text-slate-500">{node.id}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.color}`}>
                    {statusStyle.icon}
                    {node.status}
                  </div>
                </div>

                {/* Risk Badge */}
                <div className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-1 rounded-lg border mb-2.5 ${riskBg} ${riskColor}`}>
                  {node.inference.riskLevel !== "Normal" && (
                    <AlertTriangle size={9} />
                  )}
                  {node.inference.riskLevel}
                  {node.inference.confidence > 0 && (
                    <span className="opacity-70">· {node.inference.confidence}%</span>
                  )}
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {[
                    { icon: <Thermometer size={10} />, label: "Temp", value: `${node.telemetry.temperature}°C`, color: "text-orange-400" },
                    { icon: <Droplets size={10} />, label: "Humid", value: `${node.telemetry.humidity}%`, color: "text-blue-400" },
                    { icon: <Waves size={10} />, label: "Water", value: `${node.telemetry.waterLevel}m`, color: "text-teal-400" },
                    { icon: <Wind size={10} />, label: "AQI", value: `${node.telemetry.aqi}`, color: "text-purple-400" },
                  ].map((t) => (
                    <div key={t.label} className="bg-slate-900/40 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                      <span className={t.color}>{t.icon}</span>
                      <div>
                        <p className="text-[8px] text-slate-600">{t.label}</p>
                        <p className="text-[10px] font-bold text-white">{t.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <Battery size={10} className={node.batteryLevel > 50 ? "text-green-400" : node.batteryLevel > 25 ? "text-yellow-400" : "text-red-400"} />
                      <span className="text-[9px] text-slate-500">{node.batteryLevel}%</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Sun size={10} className="text-yellow-400" />
                      <span className="text-[9px] text-slate-500">{node.solarInput}W</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Clock size={10} className="text-blue-400" />
                      <span className="text-[9px] text-slate-500">{node.lastSync}</span>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-slate-600 group-hover:text-teal-400 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/40 bg-slate-900/40">
                  {["Node", "Zone", "Status", "Risk", "AI Confidence", "Temp", "AQI", "Water", "Battery", "Last Sync", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[9px] text-slate-500 uppercase tracking-widest font-bold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {filtered.map((node) => {
                  const statusStyle = STATUS_STYLE[node.status];
                  const riskColor = RISK_COLOR[node.inference.riskLevel];
                  return (
                    <tr
                      key={node.id}
                      className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                      onClick={() => onNodeSelect(node)}
                    >
                      <td className="px-3 py-2.5">
                        <p className="font-bold text-white text-[11px] group-hover:text-teal-400 transition-colors">
                          {node.name}
                        </p>
                        <p className="text-[9px] font-mono text-slate-500">{node.id}</p>
                      </td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-400 whitespace-nowrap max-w-24 truncate">
                        {node.location.zone}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`flex items-center gap-1 text-[9px] font-bold ${statusStyle.color}`}>
                          {statusStyle.icon} {node.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[9px] font-bold ${riskColor}`}>
                          {node.inference.riskLevel}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5 min-w-16">
                          <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${node.inference.confidence >= 85 ? "bg-red-400" : node.inference.confidence >= 70 ? "bg-orange-400" : "bg-yellow-400"}`}
                              style={{ width: `${node.inference.confidence}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-400">
                            {node.inference.confidence > 0 ? `${node.inference.confidence}%` : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-bold text-orange-400">
                        {node.telemetry.temperature}°C
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-bold text-purple-400">
                        {node.telemetry.aqi}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-bold text-blue-400">
                        {node.telemetry.waterLevel}m
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${node.batteryLevel > 50 ? "bg-green-400" : node.batteryLevel > 25 ? "bg-yellow-400" : "bg-red-400"}`}
                              style={{ width: `${node.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-400">{node.batteryLevel}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[9px] font-mono text-slate-500">
                        {node.lastSync}
                      </td>
                      <td className="px-3 py-2.5">
                        <ChevronRight size={13} className="text-slate-600 group-hover:text-teal-400 transition-colors" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-slate-700/30">
            <p className="text-[10px] text-slate-600">
              Showing {filtered.length} of {nodes.length} nodes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
