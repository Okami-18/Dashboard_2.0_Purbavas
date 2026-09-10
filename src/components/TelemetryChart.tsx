"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import type { SensorNode } from "@/lib/mockData";
import { Activity, TrendingUp } from "lucide-react";

interface TelemetryChartProps {
  node: SensorNode;
}

type MetricKey = "waterLevel" | "aqi" | "temperature" | "soilMoisture";

interface MetricConfig {
  label: string;
  color: string;
  unit: string;
  danger?: number;
  warning?: number;
}

const METRICS: Record<MetricKey, MetricConfig> = {
  waterLevel: {
    label: "Water Level",
    color: "#3b82f6",
    unit: "m",
    danger: 4.0,
    warning: 2.5,
  },
  aqi: {
    label: "AQI (PM2.5)",
    color: "#a78bfa",
    unit: "µg/m³",
    danger: 150,
    warning: 100,
  },
  temperature: {
    label: "Temperature",
    color: "#f97316",
    unit: "°C",
    danger: 40,
    warning: 35,
  },
  soilMoisture: {
    label: "Soil Moisture",
    color: "#10b981",
    unit: "%",
    danger: 90,
    warning: 75,
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  unit: string;
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600/60 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[10px] text-slate-400 mb-1 font-mono">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-xs text-slate-300">
              {p.name}:{" "}
              <span className="font-bold text-white">
                {p.value} {unit}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function TelemetryChart({ node }: TelemetryChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("waterLevel");
  const [chartType, setChartType] = useState<"line" | "area">("area");

  const metric = METRICS[activeMetric];
  const data = node.history;

  const currentVal = node.telemetry[
    activeMetric === "aqi"
      ? "aqi"
      : activeMetric === "temperature"
        ? "temperature"
        : activeMetric === "soilMoisture"
          ? "soilMoisture"
          : "waterLevel"
  ] as number;

  const lastVal = data[data.length - 2]?.[activeMetric] ?? 0;
  const trend = currentVal > lastVal ? "↑" : currentVal < lastVal ? "↓" : "→";
  const trendColor =
    activeMetric === "soilMoisture"
      ? currentVal > lastVal
        ? "text-yellow-400"
        : "text-green-400"
      : currentVal > lastVal
        ? "text-red-400"
        : "text-green-400";

  return (
    <div className="flex flex-col h-full bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Activity size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Live Telemetry</p>
              <p className="text-[10px] text-slate-500">{node.name} · {node.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={11} className={trendColor} />
            <span className={`text-sm font-bold ${trendColor}`}>
              {currentVal} {metric.unit}
            </span>
            <span className={`text-xs font-bold ${trendColor}`}>{trend}</span>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex gap-1.5 flex-wrap">
          {(Object.entries(METRICS) as [MetricKey, MetricConfig][]).map(
            ([key, m]) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  activeMetric === key
                    ? "border-opacity-60 text-white"
                    : "border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600"
                }`}
                style={
                  activeMetric === key
                    ? {
                        backgroundColor: m.color + "20",
                        borderColor: m.color + "60",
                        color: m.color,
                      }
                    : {}
                }
              >
                {m.label}
              </button>
            )
          )}

          <div className="ml-auto flex gap-1">
            {(["area", "line"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`text-[9px] px-2 py-1 rounded border transition-all capitalize ${
                  chartType === t
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "border-slate-700/30 text-slate-600 hover:text-slate-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-3 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart
              data={data}
              margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`gradient-${activeMetric}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: "#475569", fontSize: 9, fontFamily: "monospace" }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                content={<CustomTooltip unit={metric.unit} />}
                cursor={{ stroke: metric.color, strokeWidth: 1, strokeOpacity: 0.4 }}
              />
              {metric.danger !== undefined && (
                <ReferenceLine
                  y={metric.danger}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  strokeWidth={1}
                  label={{
                    value: "Danger",
                    fill: "#ef4444",
                    fontSize: 8,
                    position: "right",
                  }}
                />
              )}
              {metric.warning !== undefined && (
                <ReferenceLine
                  y={metric.warning}
                  stroke="#eab308"
                  strokeDasharray="4 2"
                  strokeWidth={1}
                  label={{
                    value: "Warning",
                    fill: "#eab308",
                    fontSize: 8,
                    position: "right",
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={metric.color}
                strokeWidth={1.5}
                fill={`url(#gradient-${activeMetric})`}
                dot={false}
                activeDot={{ r: 4, fill: metric.color, stroke: "#0f172a", strokeWidth: 2 }}
                name={metric.label}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                strokeOpacity={0.8}
              />
              <XAxis
                dataKey="time"
                tick={{ fill: "#475569", fontSize: 9, fontFamily: "monospace" }}
                axisLine={{ stroke: "#1e293b" }}
                tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                content={<CustomTooltip unit={metric.unit} />}
                cursor={{ stroke: metric.color, strokeWidth: 1, strokeOpacity: 0.4 }}
              />
              {metric.danger !== undefined && (
                <ReferenceLine
                  y={metric.danger}
                  stroke="#ef4444"
                  strokeDasharray="4 2"
                  strokeWidth={1}
                />
              )}
              {metric.warning !== undefined && (
                <ReferenceLine
                  y={metric.warning}
                  stroke="#eab308"
                  strokeDasharray="4 2"
                  strokeWidth={1}
                />
              )}
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke={metric.color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, fill: metric.color, stroke: "#0f172a", strokeWidth: 2 }}
                name={metric.label}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="px-4 py-2 border-t border-slate-700/40 grid grid-cols-3 gap-3">
        {[
          {
            label: "Current",
            value: `${currentVal} ${metric.unit}`,
            color: metric.color,
          },
          {
            label: "24h Max",
            value: `${Math.max(...data.map((d) => d[activeMetric])).toFixed(1)} ${metric.unit}`,
            color: "#ef4444",
          },
          {
            label: "24h Min",
            value: `${Math.min(...data.map((d) => d[activeMetric])).toFixed(1)} ${metric.unit}`,
            color: "#22c55e",
          },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">
              {s.label}
            </p>
            <p className="text-xs font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
