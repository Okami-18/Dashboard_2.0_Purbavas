"use client";

import { Cpu, AlertTriangle, Wind, MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardsProps {
  totalNodes: number;
  onlineNodes: number;
  criticalAlerts: number;
  activeAlerts: number;
  avgAQI: number;
  highestRiskZone: string;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp size={12} className="text-red-400" />;
  if (trend === "down") return <TrendingDown size={12} className="text-green-400" />;
  return <Minus size={12} className="text-slate-500" />;
}

function AqiGrade(aqi: number) {
  if (aqi <= 50) return { label: "Good", color: "text-green-400" };
  if (aqi <= 100) return { label: "Moderate", color: "text-yellow-400" };
  if (aqi <= 150) return { label: "Unhealthy", color: "text-orange-400" };
  return { label: "Hazardous", color: "text-red-400" };
}

export default function KpiCards({
  totalNodes,
  onlineNodes,
  criticalAlerts,
  activeAlerts,
  avgAQI,
  highestRiskZone,
}: KpiCardsProps) {
  const offlineNodes = totalNodes - onlineNodes;
  const aqiGrade = AqiGrade(avgAQI);

  const cards = [
    {
      title: "Active Nodes",
      value: `${onlineNodes}`,
      sub: `${offlineNodes} offline · ${totalNodes} total`,
      icon: <Cpu size={20} />,
      iconBg: "bg-teal-500/15 border-teal-500/30",
      iconColor: "text-teal-400",
      accentColor: "border-l-teal-500",
      valueSuffix: (
        <span className="text-sm font-normal text-slate-500 ml-1">
          /{totalNodes}
        </span>
      ),
      badge: onlineNodes > totalNodes * 0.9 ? "Healthy" : "Degraded",
      badgeColor:
        onlineNodes > totalNodes * 0.9
          ? "bg-green-500/15 text-green-400 border-green-500/30"
          : "bg-orange-500/15 text-orange-400 border-orange-500/30",
      trend: "flat" as const,
      sparkBar: [(onlineNodes / totalNodes) * 100],
      sparkColor: "bg-teal-400",
    },
    {
      title: "Critical Alerts",
      value: `${criticalAlerts}`,
      sub: `${activeAlerts} total active alerts`,
      icon: <AlertTriangle size={20} />,
      iconBg:
        criticalAlerts > 0
          ? "bg-red-500/15 border-red-500/30"
          : "bg-slate-700/40 border-slate-600/30",
      iconColor: criticalAlerts > 0 ? "text-red-400" : "text-slate-500",
      accentColor:
        criticalAlerts > 0 ? "border-l-red-500" : "border-l-slate-600",
      valueSuffix: null,
      badge: criticalAlerts > 0 ? "CRITICAL" : "Clear",
      badgeColor:
        criticalAlerts > 0
          ? "bg-red-500/15 text-red-400 border-red-500/30 animate-status-blink"
          : "bg-green-500/15 text-green-400 border-green-500/30",
      trend: "up" as const,
      sparkBar: null,
      sparkColor: "bg-red-400",
    },
    {
      title: "Regional AQI",
      value: `${avgAQI}`,
      sub: `PM2.5 average · ${aqiGrade.label}`,
      icon: <Wind size={20} />,
      iconBg: "bg-blue-500/15 border-blue-500/30",
      iconColor: "text-blue-400",
      accentColor: "border-l-blue-500",
      valueSuffix: (
        <span className="text-sm font-normal text-slate-500 ml-1">µg/m³</span>
      ),
      badge: aqiGrade.label,
      badgeColor:
        avgAQI <= 50
          ? "bg-green-500/15 text-green-400 border-green-500/30"
          : avgAQI <= 100
            ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
            : "bg-orange-500/15 text-orange-400 border-orange-500/30",
      trend: "up" as const,
      sparkBar: null,
      sparkColor: "bg-blue-400",
    },
    {
      title: "Highest Risk Zone",
      value: "Zone A",
      sub: highestRiskZone,
      icon: <MapPin size={20} />,
      iconBg: "bg-orange-500/15 border-orange-500/30",
      iconColor: "text-orange-400",
      accentColor: "border-l-orange-500",
      valueSuffix: null,
      badge: "FLOOD · 91%",
      badgeColor: "bg-red-500/15 text-red-400 border-red-500/30",
      trend: "down" as const,
      sparkBar: null,
      sparkColor: "bg-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`bg-slate-800/50 border border-slate-700/60 border-l-2 ${card.accentColor} rounded-xl p-4 hover:bg-slate-800/70 transition-all duration-200 group cursor-default animate-slide-in-up`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Top Row */}
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-10 h-10 rounded-lg border ${card.iconBg} flex items-center justify-center ${card.iconColor} transition-transform group-hover:scale-110`}
            >
              {card.icon}
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor} uppercase tracking-wider`}
            >
              {card.badge}
            </span>
          </div>

          {/* Value */}
          <div className="mb-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium mb-0.5">
              {card.title}
            </p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-white tracking-tight">
                {card.value}
              </span>
              {card.valueSuffix}
              <span className="ml-auto">
                <TrendIcon trend={card.trend} />
              </span>
            </div>
          </div>

          {/* Sub */}
          <p className="text-[11px] text-slate-500 truncate">{card.sub}</p>

          {/* Progress Bar */}
          {card.sparkBar && (
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${card.sparkColor} rounded-full transition-all duration-1000`}
                style={{ width: `${card.sparkBar[0]}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
