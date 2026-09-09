"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar, { type ActiveTab } from "@/components/Sidebar";
import Header from "@/components/Header";
import OverviewTab from "@/components/OverviewTab";
import RiskMapView from "@/components/RiskMapView";
import AlertsFeed from "@/components/AlertsFeed";
import NodeManagement from "@/components/NodeManagement";
import SettingsPanel from "@/components/SettingsPanel";
import NodeDrawer from "@/components/NodeDrawer";
import {
  INITIAL_NODES,
  INITIAL_ALERTS,
  type SensorNode,
  type Alert,
} from "@/lib/mockData";

// Simulate real-time sensor data fluctuation
function mutateTelemetry(nodes: SensorNode[]): SensorNode[] {
  return nodes.map((node) => {
    if (node.status === "Offline") return node;

    const rand = (base: number, range: number, min = 0, max = Infinity) =>
      parseFloat(
        Math.min(max, Math.max(min, base + (Math.random() - 0.5) * range)).toFixed(2)
      );

    const newWaterLevel = rand(node.telemetry.waterLevel, 0.08, 0);
    const newAqi = Math.round(rand(node.telemetry.aqi, 5, 0, 500));
    const newTemp = rand(node.telemetry.temperature, 0.3, -10, 60);
    const newSoilMoisture = Math.round(rand(node.telemetry.soilMoisture, 2, 0, 100));
    const newGasPpm = Math.round(rand(node.telemetry.gasPpm, 15, 0, 800));
    const newRainfall = Math.max(0, rand(node.telemetry.rainfall, 1.5, 0, 100));
    const newHumidity = Math.round(rand(node.telemetry.humidity, 2, 0, 100));

    // Update history — push new reading, remove oldest
    const lastEntry = node.history[node.history.length - 1];
    const now = new Date();
    const newHistoryEntry = {
      time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
      waterLevel: newWaterLevel,
      aqi: newAqi,
      temperature: newTemp,
      soilMoisture: newSoilMoisture,
    };

    // Only push if time changed
    const newHistory =
      lastEntry.time !== newHistoryEntry.time
        ? [...node.history.slice(1), newHistoryEntry]
        : node.history.map((h, i) =>
            i === node.history.length - 1 ? newHistoryEntry : h
          );

    return {
      ...node,
      telemetry: {
        ...node.telemetry,
        waterLevel: newWaterLevel,
        aqi: newAqi,
        temperature: newTemp,
        soilMoisture: newSoilMoisture,
        gasPpm: newGasPpm,
        rainfall: newRainfall,
        humidity: newHumidity,
      },
      history: newHistory,
      lastSync: `${Math.floor(Math.random() * 60 + 1)}s ago`,
    };
  });
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [nodes, setNodes] = useState<SensorNode[]>(INITIAL_NODES);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [selectedNode, setSelectedNode] = useState<SensorNode | null>(null);
  const [drawerNode, setDrawerNode] = useState<SensorNode | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulate real-time data streaming (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) => mutateTelemetry(prev));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate occasional new alert (every ~30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldTrigger = Math.random() > 0.6;
      if (!shouldTrigger) return;

      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      if (randomNode.status === "Offline" || randomNode.inference.riskLevel === "Normal")
        return;

      const newAlert: Alert = {
        id: `ALT-${Date.now()}`,
        nodeId: randomNode.id,
        nodeName: randomNode.name,
        zone: randomNode.location.zone,
        hazardType: randomNode.inference.hazardType,
        riskLevel: randomNode.inference.riskLevel,
        confidence: Math.round(70 + Math.random() * 25),
        timestamp: new Date().toISOString(),
        message: `Updated inference: ${randomNode.inference.hazardType} risk persists at ${randomNode.name}.`,
        recommendation: randomNode.inference.recommendation,
        acknowledged: false,
        notified: false,
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);
    }, 30000);
    return () => clearInterval(interval);
  }, [nodes]);

  const handleNodeClick = useCallback((node: SensorNode) => {
    setSelectedNode(node);
    setDrawerNode(node);
  }, []);

  const handleAcknowledge = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const handleNotify = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, notified: true, acknowledged: true } : a
      )
    );
  }, []);

  const handleAcknowledgeAll = useCallback(() => {
    setAlerts((prev) =>
      prev.map((a) => (a.riskLevel !== "Normal" ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const criticalCount = alerts.filter(
    (a) => a.riskLevel === "Critical" && !a.acknowledged
  ).length;
  const unreadCount = alerts.filter(
    (a) => !a.acknowledged && a.riskLevel !== "Normal"
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-950 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div
        className={`fixed lg:relative lg:flex z-50 lg:z-auto transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
          criticalCount={criticalCount}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          criticalAlerts={criticalCount}
          unreadAlerts={unreadCount}
          onlineNodes={42}
          totalNodes={45}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAlertBellClick={() => setActiveTab("alerts")}
        />

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-2 bg-slate-900/80 border-b border-slate-700/40">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h12M3 12h12M3 18h12" />
            </svg>
          </button>
          <span className="text-sm font-bold text-white">
            {activeTab === "overview"
              ? "Overview"
              : activeTab === "riskmap"
                ? "Risk Map"
                : activeTab === "alerts"
                  ? "Alert Feed"
                  : activeTab === "nodes"
                    ? "Node Management"
                    : "Settings"}
          </span>
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-[1800px] mx-auto">
            {/* Tab Content */}
            {activeTab === "overview" && (
              <OverviewTab
                nodes={nodes}
                alerts={alerts}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
                onAcknowledge={handleAcknowledge}
                onNotify={handleNotify}
                onAcknowledgeAll={handleAcknowledgeAll}
              />
            )}

            {activeTab === "riskmap" && (
              <RiskMapView
                nodes={nodes}
                selectedNode={selectedNode}
                onNodeClick={handleNodeClick}
              />
            )}

            {activeTab === "alerts" && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-black text-white">Alert Feed</h2>
                  <p className="text-xs text-slate-500">
                    Real-time Edge AI inference alerts from all sensor nodes
                  </p>
                </div>
                <AlertsFeed
                  alerts={alerts}
                  onAcknowledge={handleAcknowledge}
                  onNotify={handleNotify}
                  onAcknowledgeAll={handleAcknowledgeAll}
                />
              </div>
            )}

            {activeTab === "nodes" && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-black text-white">
                    Node Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Monitor and manage all ESP32 sensor nodes in the network.
                    Click a node for details.
                  </p>
                </div>
                <NodeManagement
                  nodes={nodes}
                  onNodeSelect={handleNodeClick}
                />
              </div>
            )}

            {activeTab === "settings" && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-black text-white">Settings</h2>
                  <p className="text-xs text-slate-500">
                    System configuration and preferences
                  </p>
                </div>
                <SettingsPanel />
              </div>
            )}
          </div>
        </main>

        {/* Footer / Status Bar */}
        <footer className="border-t border-slate-700/40 bg-slate-900/80 px-4 md:px-6 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-node-pulse" />
                <span className="text-[10px] text-slate-500">
                  System Operational
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span className="text-[10px] text-slate-500">
                  Gateway: 192.168.1.254
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-[10px] text-slate-500">
                  MQTT: Connected
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-600">
                EnvNet OS v4.1.2
              </span>
              <span className="text-[10px] text-slate-600">
                © 2024 Environmental Intelligence Network
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Node Detail Drawer */}
      <NodeDrawer
        node={drawerNode}
        onClose={() => setDrawerNode(null)}
      />
    </div>
  );
}
