"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { SensorNode } from "@/lib/mockData";
import { Layers, LocateFixed, RefreshCw, RotateCcw, Satellite } from "lucide-react";

interface Props { nodes: SensorNode[]; onNodeClick: (node: SensorNode) => void; selectedNodeId: string | null; }
type MapStyle = "satellite" | "streets" | "terrain";

const mapStyles: Record<MapStyle, { label: string; url: string; attribution: string }> = {
  satellite: { label: "Satellite", url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "Tiles © Esri" },
  streets: { label: "Street", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "© OpenStreetMap contributors" },
  terrain: { label: "Terrain", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: "© OpenTopoMap, © OpenStreetMap contributors" },
};

const hazardColor: Record<string, string> = { Flood: "#3182ce", Fire: "#df4a4a", Pollution: "#7c5cc4", Landslide: "#c28b28", "Extreme Heat": "#e77832", Normal: "#32a875" };
const hazardLineIcon: Record<string, string> = {
  Flood: '<svg viewBox="0 0 24 24"><path d="M12 3s-5 5.6-5 10a5 5 0 0 0 10 0c0-4.4-5-10-5-10Z"/><path d="M8 18c1.1 1 2.3 1.5 4 1.5"/></svg>',
  Fire: '<svg viewBox="0 0 24 24"><path d="M12 22a7 7 0 0 0 7-7c0-5-3-7-5-11-1 3-4 4-5 8-1-1-1-2-1-3-2 2-3 4-3 6a7 7 0 0 0 6 7Z"/><path d="M12 22a3 3 0 0 0 3-3c0-2-1.2-3-2-4.5-.8 1.2-2 2-2 4.5a3 3 0 0 0 1 3Z"/></svg>',
  Pollution: '<svg viewBox="0 0 24 24"><path d="M4 9h9a3 3 0 1 0-3-3"/><path d="M3 13h14a3 3 0 1 1-3 3"/><path d="M6 17h7"/></svg>',
  Landslide: '<svg viewBox="0 0 24 24"><path d="m3 20 7-14 4 8 2-4 5 10Z"/><path d="m10 14 2 2m1-4 2 2"/></svg>',
  "Extreme Heat": '<svg viewBox="0 0 24 24"><path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.4-6.4-1.4 1.4M7 17.2l-1.4 1.4m12.8 0-1.4-1.4M7 6.8 5.6 5.4"/><circle cx="12" cy="12" r="4"/></svg>',
  Normal: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
};

function FlyToSelection({ node }: { node?: SensorNode }) {
  const map = useMap();
  const lastSelectedId = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!node || node.id === lastSelectedId.current) return;
    lastSelectedId.current = node.id;
    map.flyTo([node.location.lat, node.location.lon], 9, { duration: 1.2 });
  }, [map, node?.id, node?.location.lat, node?.location.lon]);
  return null;
}

function MapReady({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

export default function InteractiveNetworkMap({ nodes, onNodeClick, selectedNodeId }: Props) {
  const [style, setStyle] = useState<MapStyle>("satellite");
  const [tileKey, setTileKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [map, setMap] = useState<L.Map | null>(null);
  const selected = useMemo(() => nodes.find((node) => node.id === selectedNodeId), [nodes, selectedNodeId]);
  const activeAlerts = nodes.filter((node) => node.inference.riskLevel !== "Normal");

  useEffect(() => {
    const refresh = () => { setTileKey((key) => key + 1); setLastRefresh(new Date()); };
    const interval = window.setInterval(refresh, 30 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const zoomToIndia = () => map?.flyTo([22.6, 79.4], 5, { duration: 1 });
  const styleInfo = mapStyles[style];

  return <div className="relative h-full min-h-[480px] overflow-hidden rounded-2xl border border-slate-200 bg-[#eef3ec] shadow-sm">
    <MapContainer center={[22.6, 79.4]} zoom={5} minZoom={4} maxZoom={18} scrollWheelZoom className="h-full w-full" zoomControl={false}>
      <TileLayer key={`${style}-${tileKey}`} url={`${styleInfo.url}?v=${tileKey}`} attribution={styleInfo.attribution} />
      <MapReady onReady={setMap} />
      <FlyToSelection node={selected} />
      {nodes.map((node) => {
        const color = hazardColor[node.inference.hazardType];
        const urgent = node.inference.riskLevel === "Critical" || node.inference.riskLevel === "Alert";
        const icon = L.divIcon({ className: "purbavas-hazard-marker", html: `<span class="hazard-pin ${urgent ? "hazard-pin-urgent" : ""}" style="--hazard-color:${color}">${hazardLineIcon[node.inference.hazardType]}</span>`, iconSize: [38, 38], iconAnchor: [19, 19] });
        return <Marker key={node.id} position={[node.location.lat, node.location.lon]} icon={icon} eventHandlers={{ click: () => { onNodeClick(node); map?.flyTo([node.location.lat, node.location.lon], 10, { duration: 1.2 }); } }}>
          <Popup><div className="min-w-44 text-slate-800"><p className="font-bold">{node.name}</p><p className="text-xs text-slate-500">{node.location.zone}</p><p className="mt-2 text-xs"><b>{node.inference.hazardType}</b> · {node.inference.riskLevel}</p><p className="text-xs">AI confidence: {node.inference.confidence}%</p><p className="mt-2 text-xs text-slate-600">{node.inference.recommendation}</p></div></Popup>
        </Marker>;
      })}
    </MapContainer>

    <div className="absolute left-3 top-3 z-[500] w-48 rounded-xl border border-white/80 bg-white/92 p-3 shadow-lg backdrop-blur"><div className="flex items-center gap-2"><Satellite size={15} className="text-teal-700" /><div><p className="text-[10px] font-black uppercase tracking-wider text-teal-800">India GIS intelligence</p><p className="text-[10px] text-slate-500">{activeAlerts.length} active hazard locations</p></div></div><div className="mt-2 flex gap-1">{(Object.keys(mapStyles) as MapStyle[]).map((kind) => <button key={kind} onClick={() => setStyle(kind)} className={`rounded-md px-2 py-1 text-[9px] font-bold ${style === kind ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{mapStyles[kind].label}</button>)}</div></div>
    <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2"><button onClick={() => map?.zoomIn()} className="map-control">+</button><button onClick={() => map?.zoomOut()} className="map-control">−</button><button onClick={zoomToIndia} title="Reset to India" className="map-control"><LocateFixed size={16} /></button><button onClick={() => { setTileKey((key) => key + 1); setLastRefresh(new Date()); }} title="Refresh satellite tiles" className="map-control"><RefreshCw size={15} /></button></div>
    <div className="absolute bottom-3 left-3 z-[500] max-w-xs rounded-xl border border-white/80 bg-white/92 p-2.5 shadow-lg"><div className="flex items-center gap-2"><Layers size={14} className="text-teal-700" /><p className="text-[10px] font-bold text-slate-700">Click any alert marker to zoom into its hazard.</p></div><p className="mt-1 text-[9px] text-slate-500">Auto-refreshes tiles every 30 min · Last refreshed {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div>
    <div className="absolute bottom-3 right-3 z-[500] flex items-center gap-1 rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-[9px] text-slate-500 shadow"><RotateCcw size={11} className="text-slate-400" /> North-up map · drag to pan</div>
  </div>;
}
