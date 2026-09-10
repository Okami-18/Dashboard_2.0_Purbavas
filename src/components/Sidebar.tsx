"use client";

import {
  LayoutDashboard,
  Map,
  BellRing,
  Cpu,
  Settings,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
} from "lucide-react";

export type ActiveTab =
  | "overview"
  | "riskmap"
  | "alerts"
  | "nodes"
  | "settings";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  criticalCount: number;
}

const navItems: {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: "alerts",
    label: "Incident Command",
    icon: <BellRing size={20} />,
  },
  {
    id: "riskmap",
    label: "India GIS Map",
    icon: <Map size={20} />,
  },
  {
    id: "nodes",
    label: "Node Management",
    icon: <Cpu size={20} />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={20} />,
  },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  criticalCount,
}: SidebarProps) {
  return (
    <aside
      className={`relative flex flex-col bg-slate-900 border-r border-slate-700/60 transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      } min-h-screen shrink-0`}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/60">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Activity size={18} className="text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900 animate-node-pulse" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white tracking-tight leading-tight">
              Purbavas
            </p>
            <p className="text-[10px] text-teal-400 tracking-widest uppercase font-medium">
              Early Warning
            </p>
          </div>
        )}
      </div>

      {/* Network Indicator */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/40">
          <div className="flex items-center gap-2">
            <Wifi size={13} className="text-teal-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-medium">
                MESH NETWORK
              </p>
              <p className="text-[11px] text-green-400 font-semibold">
                Active · Edge mesh online
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-teal-500/15 text-teal-400 border border-teal-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span
                className={`shrink-0 ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}`}
              >
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}

              {/* Alert badge */}
              {item.id === "alerts" && criticalCount > 0 && (
                <span
                  className={`${collapsed ? "absolute top-1 right-1" : "ml-auto"} flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full animate-status-blink`}
                >
                  {criticalCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Health */}
      {!collapsed && (
        <div className="m-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-medium">
            System Health
          </p>
          <div className="space-y-1.5">
            {[
              { label: "CPU", value: 23, color: "bg-green-400" },
              { label: "Memory", value: 61, color: "bg-blue-400" },
              { label: "Gateway", value: 100, color: "bg-teal-400" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-12">{s.label}</span>
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 w-7 text-right">
                  {s.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-700/40">
          <div className="flex items-center gap-1.5">
            <Zap size={11} className="text-yellow-400" />
            <p className="text-[10px] text-slate-500">
              Purbavas v1.0 · Edge AI ready
            </p>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors z-10 shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
