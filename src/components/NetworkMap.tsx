"use client";

import dynamic from "next/dynamic";
import type { SensorNode } from "@/lib/mockData";

interface NetworkMapProps {
  nodes: SensorNode[];
  onNodeClick: (node: SensorNode) => void;
  selectedNodeId: string | null;
}

const InteractiveNetworkMap = dynamic(() => import("./InteractiveNetworkMap"), {
  ssr: false,
  loading: () => <div className="h-full min-h-80 rounded-2xl border border-slate-200 bg-[#f3f5ef] animate-pulse" />,
});

export default function NetworkMap(props: NetworkMapProps) {
  return <InteractiveNetworkMap {...props} />;
}
