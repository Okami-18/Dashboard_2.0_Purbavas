"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Radio,
  Droplets,
  Flame,
  Wind,
  Mountain,
  Thermometer,
  Info,
  ChevronDown,
  ChevronUp,
  Phone,
  Bell,
} from "lucide-react";
import type { Alert, HazardType, RiskLevel } from "@/lib/mockData";

interface AlertsFeedProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onNotify: (id: string) => void;
}

const HAZARD_ICON: Record<HazardType, React.ReactNode> = {
  Flood: <Droplets size={14} />,
  Fire: <Flame size={14} />,
  Pollution: <Wind size={14} />,
  Landslide: <Mountain size={14} />,
  "Extreme Heat": <Thermometer size={14} />,
  Normal: <Info size={14} />,
};

const RISK_STYLES: Record<RiskLevel, { bg: string; border: string; text: string; badge: string }> = {
  Critical: {
    bg: "bg-red-500/8",
    border: "border-red-500/40",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
  },
  Alert: {
    bg: "bg-orange-500/8",
    border: "border-orange-500/30",
    text: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  },
  "Precursor Detected": {
    bg: "bg-yellow-500/8",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  },
  Normal: {
    bg: "bg-slate-800/40",
    border: "border-slate-600/30",
    text: "text-slate-400",
    badge: "bg-slate-700/40 text-slate-400 border-slate-600/30",
  },
};

const HAZARD_COLOR: Record<HazardType, string> = {
  Flood: "text-blue-400",
  Fire: "text-red-400",
  Pollution: "text-purple-400",
  Landslide: "text-amber-400",
  "Extreme Heat": "text-orange-400",
  Normal: "text-slate-400",
};

function ConfidenceBar({ value, riskLevel }: { value: number; riskLevel: RiskLevel }) {
  const color =
    value >= 85
      ? "bg-red-400"
      : value >= 70
        ? "bg-orange-400"
        : value >= 50
          ? "bg-yellow-400"
          : "bg-slate-500";

  return (
    <div className="flex items-center gap-2 min-w-28">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-bold w-8 text-right ${
          value >= 85
            ? "text-red-400"
            : value >= 70
              ? "text-orange-400"
              : "text-yellow-400"
        }`}
      >
        {value > 0 ? `${value}%` : "N/A"}
      </span>
    </div>
  );
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertsFeed({
  alerts,
  onAcknowledge,
  onNotify,
}: AlertsFeedProps) {
  const [filter, setFilter] = useState<RiskLevel | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"time" | "confidence">("time");

  const filtered = alerts
    .filter((a) => filter === "All" || a.riskLevel === filter)
    .sort((a, b) => {
      if (sortBy === "confidence") return b.confidence - a.confidence;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const unackCount = alerts.filter(
    (a) => !a.acknowledged && a.riskLevel !== "Normal"
  ).length;

  return (
    <div className="flex flex-col bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <Radio size={14} className="text-red-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Edge AI Alert Feed</p>
              <p className="text-[10px] text-slate-500">
                Real-time inference alerts from ESP32 nodes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unackCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full animate-status-blink">
                {unackCount} Unread
              </span>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "time" | "confidence")}
              className="text-[10px] bg-slate-700/60 border border-slate-600/40 text-slate-400 rounded-lg px-2 py-1 outline-none cursor-pointer"
            >
              <option value="time">Sort: Latest</option>
              <option value="confidence">Sort: Confidence</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(["All", "Critical", "Alert", "Precursor Detected", "Normal"] as const).map(
            (f) => {
              const count =
                f === "All"
                  ? alerts.length
                  : alerts.filter((a) => a.riskLevel === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    filter === f
                      ? f === "All"
                        ? "bg-teal-500/20 border-teal-500/40 text-teal-400"
                        : f === "Critical"
                          ? "bg-red-500/20 border-red-500/40 text-red-400"
                          : f === "Alert"
                            ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
                            : f === "Precursor Detected"
                              ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                              : "bg-slate-700/40 border-slate-600 text-slate-400"
                      : "border-slate-700/40 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {f}{" "}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1fr_100px_120px_130px_140px_100px] gap-2 px-4 py-2 bg-slate-900/40 border-b border-slate-700/30">
        {["Time / Node", "Hazard", "Risk Level", "AI Confidence", "Recommendation", "Actions"].map((h) => (
          <p key={h} className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
            {h}
          </p>
        ))}
      </div>

      {/* Alert Rows */}
      <div className="overflow-y-auto max-h-80 divide-y divide-slate-700/30">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-12 text-slate-600">
            <div className="text-center">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-500/40" />
              <p className="text-sm font-medium">No alerts for this filter</p>
              <p className="text-xs text-slate-600">System monitoring active</p>
            </div>
          </div>
        )}

        {filtered.map((alert) => {
          const styles = RISK_STYLES[alert.riskLevel];
          const isExpanded = expandedId === alert.id;
          const isAcked = alert.acknowledged;

          return (
            <div
              key={alert.id}
              className={`${styles.bg} border-l-2 ${styles.border} transition-all`}
            >
              {/* Main Row */}
              <div
                className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_130px_140px_100px] gap-2 px-4 py-2.5 items-center cursor-pointer hover:bg-white/2"
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              >
                {/* Time / Node */}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {!isAcked && alert.riskLevel !== "Normal" && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${styles.text} bg-current animate-status-blink`}
                      />
                    )}
                    <p className="text-xs font-bold text-white truncate">
                      {alert.nodeName}
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono">
                    {alert.nodeId} · {timeAgo(alert.timestamp)}
                  </p>
                  <p className="text-[9px] text-slate-600 truncate">{alert.zone}</p>
                </div>

                {/* Hazard Type */}
                <div className="flex items-center gap-1.5 hidden md:flex">
                  <span className={HAZARD_COLOR[alert.hazardType]}>
                    {HAZARD_ICON[alert.hazardType]}
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">
                    {alert.hazardType}
                  </span>
                </div>

                {/* Risk Level */}
                <div className="hidden md:block">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}
                  >
                    {alert.riskLevel}
                  </span>
                </div>

                {/* AI Confidence */}
                <div className="hidden md:block">
                  <ConfidenceBar
                    value={alert.confidence}
                    riskLevel={alert.riskLevel}
                  />
                </div>

                {/* Recommendation */}
                <p className="text-[9px] text-slate-400 truncate hidden md:block leading-snug">
                  {alert.recommendation}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1 hidden md:flex">
                  {!isAcked && alert.riskLevel !== "Normal" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcknowledge(alert.id);
                      }}
                      className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-slate-700/60 border border-slate-600/40 text-slate-300 hover:text-white rounded-lg transition-all hover:bg-slate-600/60"
                    >
                      <CheckCircle size={10} />
                      ACK
                    </button>
                  )}
                  {!alert.notified && alert.riskLevel !== "Normal" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotify(alert.id);
                      }}
                      className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 rounded-lg transition-all"
                    >
                      <Phone size={10} />
                      NOTIFY
                    </button>
                  )}
                  {(isAcked || alert.riskLevel === "Normal") && (
                    <span className="flex items-center gap-1 text-[9px] text-green-500">
                      <CheckCircle size={10} />
                      {isAcked ? "ACK'd" : "Clear"}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : alert.id);
                    }}
                    className="p-1 text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-3 animate-fade-in">
                  <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/30">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle size={12} className={styles.text + " mt-0.5 shrink-0"} />
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">Alert ID</p>
                        <p className="text-[10px] font-mono text-slate-400">{alert.id}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">Timestamp</p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">Notified</p>
                        <p className="text-[10px] text-slate-400">
                          {alert.notified ? "✅ Authorities alerted" : "❌ Not notified"}
                        </p>
                      </div>
                    </div>
                    {/* Mobile Action Buttons */}
                    <div className="flex gap-2 mt-2 md:hidden">
                      {!isAcked && alert.riskLevel !== "Normal" && (
                        <button
                          onClick={() => onAcknowledge(alert.id)}
                          className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-slate-700 border border-slate-600 text-white rounded-lg"
                        >
                          <CheckCircle size={11} /> Acknowledge
                        </button>
                      )}
                      {!alert.notified && alert.riskLevel !== "Normal" && (
                        <button
                          onClick={() => onNotify(alert.id)}
                          className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg"
                        >
                          <Phone size={11} /> Notify Authorities
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-700/30 flex items-center justify-between">
        <p className="text-[9px] text-slate-600">
          Showing {filtered.length} of {alerts.length} alerts
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-node-pulse" />
          <p className="text-[9px] text-slate-600">Live inference active</p>
        </div>
      </div>
    </div>
  );
}
