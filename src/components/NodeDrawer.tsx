"use client";

import { useEffect } from "react";
import {
  X,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Sun,
  Cpu,
  Thermometer,
  Droplets,
  Wind,
  Waves,
  Sprout,
  Flame,
  Clock,
  Radio,
  Signal,
  CheckCircle,
  AlertTriangle,
  Gauge,
  Zap,
} from "lucide-react";
import type { SensorNode } from "@/lib/mockData";

interface NodeDrawerProps {
  node: SensorNode | null;
  onClose: () => void;
}

function SignalBars({ dbm }: { dbm: number }) {
  // -30 excellent, -60 good, -75 fair, -90 poor
  const strength =
    dbm >= -55 ? 4 : dbm >= -65 ? 3 : dbm >= -75 ? 2 : dbm >= -85 ? 1 : 0;
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`rounded-sm w-2 transition-all ${
            bar <= strength ? "bg-green-400" : "bg-slate-600"
          }`}
          style={{ height: `${bar * 25}%` }}
        />
      ))}
    </div>
  );
}

function BatteryIndicator({ level }: { level: number }) {
  const color =
    level > 50 ? "text-green-400" : level > 25 ? "text-yellow-400" : "text-red-400";
  const Icon = level > 20 ? Battery : BatteryLow;
  return (
    <div className="flex items-center gap-1">
      <Icon size={14} className={color} />
      <span className={`text-xs font-bold ${color}`}>{level}%</span>
    </div>
  );
}

const RISK_COLORS = {
  Normal: { bg: "bg-green-500/15", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-400" },
  "Precursor Detected": { bg: "bg-yellow-500/15", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-400" },
  Alert: { bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-400", dot: "bg-orange-400" },
  Critical: { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-400" },
};

function TelemetryRow({
  icon,
  label,
  value,
  unit,
  warning,
  danger,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  warning?: number;
  danger?: number;
  max: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const barColor =
    danger && value >= danger
      ? "bg-red-400"
      : warning && value >= warning
        ? "bg-yellow-400"
        : "bg-teal-400";

  return (
    <div className="py-2.5 border-b border-slate-700/30 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">{icon}</span>
          <span className="text-xs text-slate-400">{label}</span>
        </div>
        <span
          className={`text-sm font-bold font-mono ${
            danger && value >= danger
              ? "text-red-400"
              : warning && value >= warning
                ? "text-yellow-400"
                : "text-white"
          }`}
        >
          {value} <span className="text-[10px] font-normal text-slate-500">{unit}</span>
        </span>
      </div>
      <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function NodeDrawer({ node, onClose }: NodeDrawerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!node) return null;

  const riskStyle = RISK_COLORS[node.inference.riskLevel];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-slate-900 border-l border-slate-700/60 z-50 animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700/60 p-4 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    node.status === "Online"
                      ? "bg-green-400 animate-node-pulse"
                      : node.status === "Low-Bandwidth"
                        ? "bg-yellow-400 animate-status-blink"
                        : "bg-red-400"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold ${
                    node.status === "Online"
                      ? "text-green-400"
                      : node.status === "Low-Bandwidth"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {node.status.toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-black text-white">{node.name}</h2>
              <p className="text-[10px] font-mono text-slate-500">{node.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* AI Inference Banner */}
          <div
            className={`rounded-xl p-3.5 border ${riskStyle.bg} ${riskStyle.border}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Radio size={14} className={riskStyle.text} />
                <p className="text-xs font-bold text-white">Edge AI Inference</p>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${riskStyle.bg} ${riskStyle.border} ${riskStyle.text} uppercase tracking-wider`}
              >
                {node.inference.riskLevel}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">AI Model</p>
                <p className="text-xs font-bold text-white">{node.aiModel}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Hazard Type</p>
                <p className={`text-xs font-bold ${riskStyle.text}`}>
                  {node.inference.hazardType}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Confidence</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        node.inference.confidence >= 85
                          ? "bg-red-400"
                          : node.inference.confidence >= 70
                            ? "bg-orange-400"
                            : "bg-yellow-400"
                      } rounded-full`}
                      style={{ width: `${node.inference.confidence}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${riskStyle.text}`}>
                    {node.inference.confidence > 0 ? `${node.inference.confidence}%` : "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Triggered</p>
                <p className="text-xs text-slate-300">{node.inference.triggeredAt}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-700/30">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">
                Recommended Action
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {node.inference.recommendation}
              </p>
            </div>
          </div>

          {/* Hardware Status */}
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/40">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">
              Hardware Status
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* WiFi Signal */}
              <div className="bg-slate-900/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  {node.status !== "Offline" ? (
                    <Wifi size={12} className="text-teal-400" />
                  ) : (
                    <WifiOff size={12} className="text-red-400" />
                  )}
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">
                    Wi-Fi Signal
                  </p>
                </div>
                <SignalBars dbm={node.wifiSignal} />
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  {node.wifiSignal} dBm
                </p>
              </div>

              {/* Battery */}
              <div className="bg-slate-900/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Battery size={12} className="text-yellow-400" />
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">
                    Battery
                  </p>
                </div>
                <BatteryIndicator level={node.batteryLevel} />
                <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      node.batteryLevel > 50
                        ? "bg-green-400"
                        : node.batteryLevel > 25
                          ? "bg-yellow-400"
                          : "bg-red-400"
                    }`}
                    style={{ width: `${node.batteryLevel}%` }}
                  />
                </div>
              </div>

              {/* Solar Input */}
              <div className="bg-slate-900/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sun size={12} className="text-yellow-400" />
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">
                    Solar Input
                  </p>
                </div>
                <p className="text-sm font-bold text-yellow-400">
                  {node.solarInput}W
                </p>
                <p className="text-[9px] text-slate-600">
                  {node.solarInput > 3 ? "Charging" : node.solarInput > 0 ? "Low light" : "No input"}
                </p>
              </div>

              {/* Last Sync */}
              <div className="bg-slate-900/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={12} className="text-blue-400" />
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">
                    Last Sync
                  </p>
                </div>
                <p className="text-sm font-bold text-blue-400">{node.lastSync}</p>
                <p className="text-[9px] text-slate-600 font-mono">
                  FW: {node.firmware}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="mt-2 bg-slate-900/50 rounded-lg p-2.5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">
                Location
              </p>
              <p className="text-[10px] font-mono text-slate-300">
                {node.location.lat.toFixed(4)}°N, {node.location.lon.toFixed(4)}°E
              </p>
              <p className="text-[10px] text-slate-500">{node.location.zone}</p>
            </div>
          </div>

          {/* Live Telemetry */}
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/40">
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={13} className="text-teal-400" />
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Live Sensor Readouts
              </p>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-teal-400 animate-node-pulse" />
                <span className="text-[9px] text-teal-400">Live</span>
              </div>
            </div>

            <TelemetryRow
              icon={<Thermometer size={13} />}
              label="Temperature"
              value={node.telemetry.temperature}
              unit="°C"
              warning={35}
              danger={40}
              max={60}
            />
            <TelemetryRow
              icon={<Droplets size={13} />}
              label="Humidity"
              value={node.telemetry.humidity}
              unit="%"
              max={100}
            />
            <TelemetryRow
              icon={<Wind size={13} />}
              label="AQI (PM2.5)"
              value={node.telemetry.aqi}
              unit="µg/m³"
              warning={100}
              danger={150}
              max={300}
            />
            <TelemetryRow
              icon={<Waves size={13} />}
              label="Water Level"
              value={node.telemetry.waterLevel}
              unit="m"
              warning={2.5}
              danger={4.0}
              max={6}
            />
            <TelemetryRow
              icon={<Sprout size={13} />}
              label="Soil Moisture"
              value={node.telemetry.soilMoisture}
              unit="%"
              warning={75}
              danger={90}
              max={100}
            />
            <TelemetryRow
              icon={<Flame size={13} />}
              label="Gas (PPM)"
              value={node.telemetry.gasPpm}
              unit="ppm"
              warning={300}
              danger={450}
              max={600}
            />
            <TelemetryRow
              icon={<Zap size={13} />}
              label="Wind Speed"
              value={node.telemetry.windSpeed}
              unit="km/h"
              warning={50}
              danger={80}
              max={120}
            />
            <TelemetryRow
              icon={<Droplets size={13} />}
              label="Rainfall"
              value={node.telemetry.rainfall}
              unit="mm/hr"
              warning={15}
              danger={30}
              max={60}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-xs font-bold rounded-xl hover:bg-teal-500/25 transition-all">
              <Signal size={14} />
              Ping Node
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-700/60 border border-slate-600/40 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-600/60 transition-all">
              <Cpu size={14} />
              Update Firmware
            </button>
          </div>

          {/* Firmware Info */}
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2 font-bold">
              System Info
            </p>
            <div className="space-y-1">
              {[
                { label: "Firmware", value: node.firmware },
                { label: "AI Model", value: node.aiModel },
                { label: "Connectivity", value: "Wi-Fi 802.11n / LoRa fallback" },
                { label: "MCU", value: "ESP32-S3 @ 240MHz" },
                { label: "Flash", value: "8MB PSRAM 4MB" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{item.label}</span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
