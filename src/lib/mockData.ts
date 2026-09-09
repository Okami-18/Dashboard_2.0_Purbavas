export type NodeStatus = "Online" | "Offline" | "Low-Bandwidth";
export type HazardType =
  | "Flood"
  | "Fire"
  | "Pollution"
  | "Landslide"
  | "Extreme Heat"
  | "Normal";
export type RiskLevel = "Normal" | "Precursor Detected" | "Alert" | "Critical";

export interface SensorNode {
  id: string;
  name: string;
  location: { lat: number; lon: number; zone: string };
  status: NodeStatus;
  wifiSignal: number; // dBm -30 to -90
  batteryLevel: number; // 0-100%
  solarInput: number; // Watts
  lastSync: string;
  firmware: string;
  aiModel: string;
  telemetry: {
    temperature: number; // °C
    humidity: number; // %
    aqi: number; // PM2.5 µg/m³
    pm10: number;
    waterLevel: number; // meters
    soilMoisture: number; // %
    gasPpm: number; // ppm
    windSpeed: number; // km/h
    rainfall: number; // mm/hr
  };
  inference: {
    hazardType: HazardType;
    confidence: number; // 0-100
    riskLevel: RiskLevel;
    triggeredAt: string;
    recommendation: string;
  };
  history: {
    time: string;
    waterLevel: number;
    aqi: number;
    temperature: number;
    soilMoisture: number;
  }[];
}

export interface Alert {
  id: string;
  nodeId: string;
  nodeName: string;
  zone: string;
  hazardType: HazardType;
  riskLevel: RiskLevel;
  confidence: number;
  timestamp: string;
  message: string;
  recommendation: string;
  acknowledged: boolean;
  notified: boolean;
}

function generateHistory(
  baseWater: number,
  baseAqi: number,
  baseTemp: number,
  baseSoil: number
) {
  const history = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now - i * 60 * 60 * 1000);
    history.push({
      time: `${t.getHours().toString().padStart(2, "0")}:00`,
      waterLevel: parseFloat(
        Math.max(0, baseWater + (Math.random() - 0.5) * 0.4).toFixed(2)
      ),
      aqi: Math.round(Math.max(0, baseAqi + (Math.random() - 0.5) * 20)),
      temperature: parseFloat(
        (baseTemp + (Math.random() - 0.5) * 3).toFixed(1)
      ),
      soilMoisture: Math.round(
        Math.min(100, Math.max(0, baseSoil + (Math.random() - 0.5) * 10))
      ),
    });
  }
  return history;
}

export const INITIAL_NODES: SensorNode[] = [
  {
    id: "ESP32-001",
    name: "Riverside Alpha",
    location: { lat: 14.12, lon: 121.23, zone: "Zone A – River Basin" },
    status: "Online",
    wifiSignal: -45,
    batteryLevel: 87,
    solarInput: 4.2,
    lastSync: "12s ago",
    firmware: "v3.2.1",
    aiModel: "FloodWatch v2",
    telemetry: {
      temperature: 31.4,
      humidity: 84,
      aqi: 42,
      pm10: 55,
      waterLevel: 3.81,
      soilMoisture: 78,
      gasPpm: 120,
      windSpeed: 12,
      rainfall: 18.4,
    },
    inference: {
      hazardType: "Flood",
      confidence: 91,
      riskLevel: "Critical",
      triggeredAt: "2 min ago",
      recommendation: "Evacuate riverside settlements immediately.",
    },
    history: generateHistory(3.5, 42, 31, 78),
  },
  {
    id: "ESP32-002",
    name: "Forest Bravo",
    location: { lat: 14.25, lon: 121.45, zone: "Zone B – Forest Cover" },
    status: "Online",
    wifiSignal: -62,
    batteryLevel: 73,
    solarInput: 3.8,
    lastSync: "45s ago",
    firmware: "v3.2.1",
    aiModel: "FireSentinel v1.3",
    telemetry: {
      temperature: 38.7,
      humidity: 22,
      aqi: 95,
      pm10: 130,
      waterLevel: 0.1,
      soilMoisture: 18,
      gasPpm: 480,
      windSpeed: 28,
      rainfall: 0,
    },
    inference: {
      hazardType: "Fire",
      confidence: 88,
      riskLevel: "Alert",
      triggeredAt: "8 min ago",
      recommendation: "Deploy fire response teams. Alert forestry dept.",
    },
    history: generateHistory(0.1, 95, 38, 18),
  },
  {
    id: "ESP32-003",
    name: "Urban Charlie",
    location: { lat: 14.08, lon: 121.31, zone: "Zone C – Urban Core" },
    status: "Online",
    wifiSignal: -38,
    batteryLevel: 92,
    solarInput: 2.1,
    lastSync: "5s ago",
    firmware: "v3.3.0",
    aiModel: "AirGuard v2.1",
    telemetry: {
      temperature: 34.2,
      humidity: 61,
      aqi: 158,
      pm10: 200,
      waterLevel: 0.3,
      soilMoisture: 42,
      gasPpm: 290,
      windSpeed: 8,
      rainfall: 0,
    },
    inference: {
      hazardType: "Pollution",
      confidence: 94,
      riskLevel: "Alert",
      triggeredAt: "15 min ago",
      recommendation: "Issue AQI health advisory. Restrict outdoor activity.",
    },
    history: generateHistory(0.3, 158, 34, 42),
  },
  {
    id: "ESP32-004",
    name: "Highland Delta",
    location: { lat: 14.33, lon: 121.18, zone: "Zone D – Highland Slopes" },
    status: "Online",
    wifiSignal: -71,
    batteryLevel: 55,
    solarInput: 5.1,
    lastSync: "2m ago",
    firmware: "v3.1.8",
    aiModel: "SlideWatch v1.0",
    telemetry: {
      temperature: 26.1,
      humidity: 91,
      aqi: 28,
      pm10: 35,
      waterLevel: 0.9,
      soilMoisture: 89,
      gasPpm: 80,
      windSpeed: 15,
      rainfall: 32.1,
    },
    inference: {
      hazardType: "Landslide",
      confidence: 76,
      riskLevel: "Precursor Detected",
      triggeredAt: "22 min ago",
      recommendation: "Monitor slope stability. Prepare evacuation routes.",
    },
    history: generateHistory(0.9, 28, 26, 89),
  },
  {
    id: "ESP32-005",
    name: "Valley Echo",
    location: { lat: 14.18, lon: 121.52, zone: "Zone E – Agricultural Valley" },
    status: "Online",
    wifiSignal: -54,
    batteryLevel: 68,
    solarInput: 4.9,
    lastSync: "30s ago",
    firmware: "v3.2.1",
    aiModel: "FloodWatch v2",
    telemetry: {
      temperature: 29.8,
      humidity: 73,
      aqi: 35,
      pm10: 42,
      waterLevel: 1.2,
      soilMoisture: 65,
      gasPpm: 95,
      windSpeed: 10,
      rainfall: 5.2,
    },
    inference: {
      hazardType: "Flood",
      confidence: 52,
      riskLevel: "Precursor Detected",
      triggeredAt: "1h ago",
      recommendation: "Continue monitoring. Prepare flood barriers.",
    },
    history: generateHistory(1.2, 35, 29, 65),
  },
  {
    id: "ESP32-006",
    name: "Coastal Foxtrot",
    location: { lat: 13.98, lon: 121.42, zone: "Zone F – Coastal Belt" },
    status: "Low-Bandwidth",
    wifiSignal: -82,
    batteryLevel: 34,
    solarInput: 1.2,
    lastSync: "8m ago",
    firmware: "v3.1.5",
    aiModel: "HeatWatch v1.2",
    telemetry: {
      temperature: 41.3,
      humidity: 55,
      aqi: 68,
      pm10: 82,
      waterLevel: 0.4,
      soilMoisture: 31,
      gasPpm: 145,
      windSpeed: 22,
      rainfall: 0,
    },
    inference: {
      hazardType: "Extreme Heat",
      confidence: 83,
      riskLevel: "Alert",
      triggeredAt: "35 min ago",
      recommendation: "Open cooling centers. Issue heat warning.",
    },
    history: generateHistory(0.4, 68, 41, 31),
  },
  {
    id: "ESP32-007",
    name: "Ridge Golf",
    location: { lat: 14.41, lon: 121.36, zone: "Zone G – Northern Ridge" },
    status: "Online",
    wifiSignal: -49,
    batteryLevel: 81,
    solarInput: 6.3,
    lastSync: "18s ago",
    firmware: "v3.3.0",
    aiModel: "MultiHazard v1.0",
    telemetry: {
      temperature: 24.5,
      humidity: 68,
      aqi: 22,
      pm10: 28,
      waterLevel: 0.2,
      soilMoisture: 52,
      gasPpm: 65,
      windSpeed: 6,
      rainfall: 0.8,
    },
    inference: {
      hazardType: "Normal",
      confidence: 97,
      riskLevel: "Normal",
      triggeredAt: "—",
      recommendation: "No action required.",
    },
    history: generateHistory(0.2, 22, 24, 52),
  },
  {
    id: "ESP32-008",
    name: "Wetland Hotel",
    location: { lat: 14.05, lon: 121.15, zone: "Zone H – Wetlands" },
    status: "Online",
    wifiSignal: -58,
    batteryLevel: 76,
    solarInput: 3.5,
    lastSync: "1m ago",
    firmware: "v3.2.1",
    aiModel: "FloodWatch v2",
    telemetry: {
      temperature: 28.3,
      humidity: 88,
      aqi: 31,
      pm10: 38,
      waterLevel: 2.1,
      soilMoisture: 94,
      gasPpm: 110,
      windSpeed: 7,
      rainfall: 11.8,
    },
    inference: {
      hazardType: "Flood",
      confidence: 64,
      riskLevel: "Precursor Detected",
      triggeredAt: "45 min ago",
      recommendation: "Monitor wetland water levels closely.",
    },
    history: generateHistory(2.1, 31, 28, 94),
  },
  {
    id: "ESP32-009",
    name: "Summit India",
    location: { lat: 14.48, lon: 121.28, zone: "Zone I – Summit Station" },
    status: "Offline",
    wifiSignal: -95,
    batteryLevel: 12,
    solarInput: 0,
    lastSync: "2h ago",
    firmware: "v3.1.5",
    aiModel: "MultiHazard v1.0",
    telemetry: {
      temperature: 19.2,
      humidity: 72,
      aqi: 18,
      pm10: 22,
      waterLevel: 0.1,
      soilMoisture: 58,
      gasPpm: 55,
      windSpeed: 35,
      rainfall: 3.5,
    },
    inference: {
      hazardType: "Normal",
      confidence: 0,
      riskLevel: "Normal",
      triggeredAt: "—",
      recommendation: "Node offline. Check connectivity.",
    },
    history: generateHistory(0.1, 18, 19, 58),
  },
  {
    id: "ESP32-010",
    name: "Plains Juliet",
    location: { lat: 14.22, lon: 121.08, zone: "Zone J – Plains" },
    status: "Online",
    wifiSignal: -43,
    batteryLevel: 95,
    solarInput: 7.2,
    lastSync: "8s ago",
    firmware: "v3.3.0",
    aiModel: "MultiHazard v1.0",
    telemetry: {
      temperature: 33.1,
      humidity: 48,
      aqi: 45,
      pm10: 58,
      waterLevel: 0.5,
      soilMoisture: 38,
      gasPpm: 88,
      windSpeed: 14,
      rainfall: 0,
    },
    inference: {
      hazardType: "Normal",
      confidence: 95,
      riskLevel: "Normal",
      triggeredAt: "—",
      recommendation: "No action required.",
    },
    history: generateHistory(0.5, 45, 33, 38),
  },
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "ALT-001",
    nodeId: "ESP32-001",
    nodeName: "Riverside Alpha",
    zone: "Zone A – River Basin",
    hazardType: "Flood",
    riskLevel: "Critical",
    confidence: 91,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    message:
      "Critical flood level detected. Water at 3.81m, 0.19m below danger threshold.",
    recommendation: "Evacuate riverside settlements immediately.",
    acknowledged: false,
    notified: false,
  },
  {
    id: "ALT-002",
    nodeId: "ESP32-002",
    nodeName: "Forest Bravo",
    zone: "Zone B – Forest Cover",
    hazardType: "Fire",
    riskLevel: "Alert",
    confidence: 88,
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    message:
      "Fire precursors detected. High gas concentration (480 ppm) with low humidity (22%).",
    recommendation: "Deploy fire response teams. Alert forestry dept.",
    acknowledged: false,
    notified: true,
  },
  {
    id: "ALT-003",
    nodeId: "ESP32-003",
    nodeName: "Urban Charlie",
    zone: "Zone C – Urban Core",
    hazardType: "Pollution",
    riskLevel: "Alert",
    confidence: 94,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    message: "Unhealthy AQI level 158 µg/m³ (PM2.5). Visibility reduced.",
    recommendation: "Issue AQI health advisory. Restrict outdoor activity.",
    acknowledged: true,
    notified: true,
  },
  {
    id: "ALT-004",
    nodeId: "ESP32-006",
    nodeName: "Coastal Foxtrot",
    zone: "Zone F – Coastal Belt",
    hazardType: "Extreme Heat",
    riskLevel: "Alert",
    confidence: 83,
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    message:
      "Heat index at 41.3°C, exceeding danger threshold. Low-bandwidth mode.",
    recommendation: "Open cooling centers. Issue heat warning.",
    acknowledged: false,
    notified: false,
  },
  {
    id: "ALT-005",
    nodeId: "ESP32-004",
    nodeName: "Highland Delta",
    zone: "Zone D – Highland Slopes",
    hazardType: "Landslide",
    riskLevel: "Precursor Detected",
    confidence: 76,
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    message:
      "Soil saturation at 89%. Heavy rainfall 32.1mm/hr on unstable slope.",
    recommendation: "Monitor slope stability. Prepare evacuation routes.",
    acknowledged: false,
    notified: false,
  },
  {
    id: "ALT-006",
    nodeId: "ESP32-009",
    nodeName: "Summit India",
    zone: "Zone I – Summit Station",
    hazardType: "Normal",
    riskLevel: "Normal",
    confidence: 0,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    message: "Node went offline. Last battery level: 12%. No solar input.",
    recommendation: "Dispatch maintenance team to Summit India node.",
    acknowledged: false,
    notified: false,
  },
];

export const REGION_STATS = {
  totalNodes: 45,
  onlineNodes: 42,
  offlineNodes: 3,
  criticalAlerts: 1,
  activeAlerts: 3,
  avgAQI: 62,
  highestRiskZone: "Zone A – River Basin",
  systemStatus: "Operational",
  gatewayIP: "192.168.1.254",
  lastMeshSync: "3s ago",
};
