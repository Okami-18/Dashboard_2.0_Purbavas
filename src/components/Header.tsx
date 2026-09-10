"use client";

import {
  Bell,
  Wifi,
  WifiOff,
  Shield,
  Clock,
  RefreshCw,
  ChevronRight,
  RadioTower,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { ActiveTab } from "./Sidebar";

interface HeaderProps {
  criticalAlerts: number;
  unreadAlerts: number;
  onlineNodes: number;
  totalNodes: number;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAlertBellClick: () => void;
}

const tabLabels: Record<ActiveTab, string> = {
  overview: "Overview",
  riskmap: "India GIS Map",
  alerts: "Incident Command",
  nodes: "Node Management",
  settings: "Settings",
};

export default function Header({
  criticalAlerts,
  unreadAlerts,
  onlineNodes,
  totalNodes,
  activeTab,
  onAlertBellClick,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const offlineCount = totalNodes - onlineNodes;

  return (
    <header className="bg-slate-900/95 border-b border-slate-700/60 backdrop-blur-md px-4 md:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Title & Breadcrumb */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RadioTower size={11} className="text-teal-500" />
            <span>Purbavas</span>
            <ChevronRight size={10} />
            <span className="text-slate-300 font-medium">
              {tabLabels[activeTab]}
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
            Multi-Hazard Early Warning System
          </h1>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Live Time */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5">
            <Clock size={12} className="text-teal-400" />
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-white leading-tight" suppressHydrationWarning>
                {formatTime(currentTime)}
              </p>
              <p className="text-[10px] text-slate-500" suppressHydrationWarning>{formatDate(currentTime)}</p>
            </div>
          </div>

          {/* Node Status */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-node-pulse" />
              <Wifi size={13} className="text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 leading-tight">NODES</p>
              <p className="text-xs font-bold text-white leading-tight">
                {onlineNodes}
                <span className="text-slate-500 font-normal">/{totalNodes} Online</span>
              </p>
            </div>
            {offlineCount > 0 && (
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-600">
                <WifiOff size={11} className="text-red-400" />
                <span className="text-[10px] text-red-400 font-semibold">
                  {offlineCount} Down
                </span>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="hidden lg:flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1.5">
            <Shield size={13} className="text-green-400" />
            <div>
              <p className="text-[10px] text-slate-500 leading-tight">STATUS</p>
              <p className="text-xs font-bold text-green-400 leading-tight">
                Operational
              </p>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-800/60 border border-slate-700/40 rounded-lg text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all"
            title="Refresh data"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? "animate-spin text-teal-400" : ""}
            />
          </button>

          {/* Notification Bell */}
          <button
            onClick={onAlertBellClick}
            className="relative p-2 bg-slate-800/60 border border-slate-700/40 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            title="Alerts"
          >
            <Bell size={15} className={unreadAlerts > 0 ? "text-red-400" : ""} />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full animate-status-blink">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md cursor-pointer hover:shadow-teal-500/20 transition-shadow">
            OC
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalAlerts > 0 && (
        <div className="mt-2 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-status-blink" />
          <p className="text-xs text-red-300 font-medium">
            ⚠️ {criticalAlerts} CRITICAL ALERT{criticalAlerts > 1 ? "S" : ""}{" "}
            ACTIVE — Multi-node verification has escalated a responder alert
          </p>
        </div>
      )}
    </header>
  );
}
