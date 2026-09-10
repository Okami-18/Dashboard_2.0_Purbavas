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
  ShieldAlert,
  Zap,
  CheckCheck,
} from "lucide-react";
import type { Alert, HazardType, RiskLevel } from "@/lib/mockData";

interface AlertsFeedProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onNotify: (id: string) => void;
  onAcknowledgeAll?: () => void;
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
  onAcknowledgeAll,
}: AlertsFeedProps) {
  const [filter, setFilter] = useState<RiskLevel | "All" | "Unread">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"time" | "confidence">("time");

  const unackCount = alerts.filter(
    (a) => !a.acknowledged && a.riskLevel !== "Normal"
  ).length;

  const criticalCount = alerts.filter(
    (a) => a.riskLevel === "Critical" && !a.acknowledged
  ).length;

  const alertLevelCount = alerts.filter(
    (a) => a.riskLevel === "Alert" && !a.acknowledged
  ).length;

  const precursorCount = alerts.filter(
    (a) => a.riskLevel === "Precursor Detected" && !a.acknowledged
  ).length;

  const activeCritical = alerts.find(
    (a) => a.riskLevel === "Critical" && !a.acknowledged
  );

  const avgConfidence = Math.round(
    alerts.reduce((acc, a) => acc + a.confidence, 0) / Math.max(1, alerts.length)
  );

  const filtered = alerts
    .filter((a) => {
      if (filter === "All") return true;
      if (filter === "Unread") return !a.acknowledged && a.riskLevel !== "Normal";
      return a.riskLevel === filter;
    })
    .sort((a, b) => {
      if (sortBy === "confidence") return b.confidence - a.confidence;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  return (
    <div className="purbavas-command-feed flex flex-col bg-slate-800/70 border border-slate-700/80 ring-1 ring-red-500/20 shadow-2xl shadow-red-950/25 rounded-2xl overflow-hidden transition-all duration-300">
      {/* Header & Command Center Bar */}
      <div className="p-4 md:p-5 border-b border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          {/* Title & Live Status */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/20">
                <Radio size={18} className="animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  Edge AI Incident Command Feed
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider animate-pulse">
                  PRIORITY FEED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous real-time edge hazard detection & disaster mitigation stream
              </p>
            </div>
          </div>

          {/* Incident Metrics Strip */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/40">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-status-blink" />
              <span className="text-[10px] text-red-300 font-bold uppercase">Critical:</span>
              <span className="text-xs font-black text-red-200">{criticalCount}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/40 border border-orange-500/40">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-[10px] text-orange-300 font-bold uppercase">Alerts:</span>
              <span className="text-xs font-black text-orange-200">{alertLevelCount}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-950/40 border border-yellow-500/40">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-[10px] text-yellow-300 font-bold uppercase">Precursor:</span>
              <span className="text-xs font-black text-yellow-200">{precursorCount}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950/40 border border-teal-500/40">
              <Zap size={11} className="text-teal-400" />
              <span className="text-[10px] text-teal-300 font-bold uppercase">Avg AI Conf:</span>
              <span className="text-xs font-black text-teal-200">{avgConfidence}%</span>
            </div>

            {/* Quick Actions & Sort */}
            <div className="flex items-center gap-2 ml-auto lg:ml-2">
              {unackCount > 0 && onAcknowledgeAll && (
                <button
                  onClick={onAcknowledgeAll}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 transition-all shadow-md active:scale-95"
                >
                  <CheckCheck size={13} className="text-teal-400" />
                  <span>Ack All ({unackCount})</span>
                </button>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "time" | "confidence")}
                className="text-xs bg-slate-800/90 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-slate-500"
              >
                <option value="time">Sort: Latest First</option>
                <option value="confidence">Sort: High Confidence</option>
              </select>
            </div>
          </div>
        </div>

        {/* Urgent Critical Incident Alert Banner (Highlighted if Critical active) */}
        {activeCritical && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-950/70 via-red-900/40 to-slate-900/60 border border-red-500/60 shadow-lg shadow-red-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 bg-red-500 text-white rounded-lg shadow-md shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-500 text-white rounded tracking-wider">
                    ACTION REQUIRED
                  </span>
                  <p className="text-xs font-bold text-white">
                    {activeCritical.nodeName} ({activeCritical.zone}): {activeCritical.message}
                  </p>
                </div>
                <p className="text-[11px] text-red-200/90 mt-0.5 font-medium">
                  {activeCritical.recommendation}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => onAcknowledge(activeCritical.id)}
                className="text-[10px] font-extrabold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-all flex items-center gap-1"
              >
                <CheckCircle size={12} className="text-green-400" />
                ACKNOWLEDGE
              </button>
              <button
                onClick={() => onNotify(activeCritical.id)}
                className="text-[10px] font-extrabold px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-md shadow-red-600/30 transition-all flex items-center gap-1"
              >
                <Phone size={12} />
                DISPATCH ALERT
              </button>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Filter Incidents:
          </span>
          {(
            [
              { id: "All", label: "All Incidents", count: alerts.length },
              { id: "Unread", label: "Needs Action", count: unackCount },
              {
                id: "Critical",
                label: "Critical",
                count: alerts.filter((a) => a.riskLevel === "Critical").length,
              },
              {
                id: "Alert",
                label: "Alerts",
                count: alerts.filter((a) => a.riskLevel === "Alert").length,
              },
              {
                id: "Precursor Detected",
                label: "Precursors",
                count: alerts.filter((a) => a.riskLevel === "Precursor Detected").length,
              },
              {
                id: "Normal",
                label: "Normal",
                count: alerts.filter((a) => a.riskLevel === "Normal").length,
              },
            ] as const
          ).map((item) => {
            const isActive = filter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as RiskLevel | "All" | "Unread")}
                className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isActive
                    ? item.id === "Critical"
                      ? "bg-red-500/25 border-red-500/60 text-red-300 shadow-md shadow-red-950/40"
                      : item.id === "Unread"
                        ? "bg-amber-500/25 border-amber-500/60 text-amber-300 shadow-md shadow-amber-950/40"
                        : item.id === "Alert"
                          ? "bg-orange-500/25 border-orange-500/60 text-orange-300"
                          : item.id === "Precursor Detected"
                            ? "bg-yellow-500/25 border-yellow-500/60 text-yellow-300"
                            : "bg-teal-500/20 border-teal-500/50 text-teal-300"
                    : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-700/70 text-slate-400"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1.3fr_110px_130px_130px_1.6fr_120px] gap-2 px-4 py-2.5 bg-slate-900/70 border-b border-slate-700/50">
        {["Time / Node", "Hazard", "Risk Level", "AI Confidence", "Recommendation", "Actions"].map((h) => (
          <p key={h} className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            {h}
          </p>
        ))}
      </div>

      {/* Alert Rows - Expanded Height for focus */}
      <div className="overflow-y-auto max-h-[460px] divide-y divide-slate-700/30">
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
                className="grid grid-cols-1 md:grid-cols-[1.3fr_110px_130px_130px_1.6fr_120px] gap-2 px-4 py-2.5 items-center cursor-pointer hover:bg-white/2"
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
