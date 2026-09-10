"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Wifi,
  Shield,
  Database,
  Cpu,
  Moon,
  Volume2,
  Radio,
  Save,
  RotateCcw,
} from "lucide-react";

function Toggle({ defaultOn = true, label }: { defaultOn?: boolean; label: string }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-700/30 last:border-0">
      <span className="text-xs text-slate-300">{label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-10 h-5 rounded-full transition-all duration-200 ${
          on ? "bg-teal-500" : "bg-slate-600"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function NumberInput({
  label,
  defaultVal,
  min,
  max,
  unit,
}: {
  label: string;
  defaultVal: number;
  min: number;
  max: number;
  unit: string;
}) {
  const [val, setVal] = useState(defaultVal);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-700/30 last:border-0">
      <span className="text-xs text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="w-16 bg-slate-900/60 border border-slate-700/40 text-sm text-white text-right rounded-lg px-2 py-1 outline-none focus:border-teal-500/50 font-mono"
        />
        <span className="text-[10px] text-slate-500 w-8">{unit}</span>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/40 bg-slate-900/30">
        <span className="text-teal-400">{icon}</span>
        <p className="text-xs font-bold text-white uppercase tracking-wider">{title}</p>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

export default function SettingsPanel() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <Settings size={16} className="text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">System Configuration</p>
            <p className="text-[10px] text-slate-500">EnvNet Control Center settings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-700/60 border border-slate-600/40 text-slate-400 rounded-lg hover:text-white transition-colors">
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-lg transition-all ${
              saved
                ? "bg-green-500/20 border-green-500/40 text-green-400"
                : "bg-teal-500/15 border-teal-500/30 text-teal-400 hover:bg-teal-500/25"
            }`}
          >
            <Save size={12} />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Alert Thresholds */}
      <Section title="Alert Thresholds" icon={<Bell size={14} />}>
        <NumberInput label="Flood Alert Water Level" defaultVal={4} min={0} max={10} unit="m" />
        <NumberInput label="Fire AQI PM2.5 Threshold" defaultVal={150} min={50} max={500} unit="µg/m³" />
        <NumberInput label="Heat Alert Temperature" defaultVal={40} min={30} max={60} unit="°C" />
        <NumberInput label="Landslide Soil Moisture" defaultVal={85} min={60} max={100} unit="%" />
        <NumberInput label="Gas PPM Alert Level" defaultVal={450} min={100} max={1000} unit="ppm" />
        <NumberInput label="Minimum AI Confidence" defaultVal={70} min={50} max={99} unit="%" />
      </Section>

      {/* Notification Settings */}
      <Section title="Notifications" icon={<Volume2 size={14} />}>
        <Toggle label="Enable Critical Alert Sound" defaultOn={true} />
        <Toggle label="Push Notifications to Mobile App" defaultOn={true} />
        <Toggle label="SMS Alerts to Emergency Contacts" defaultOn={false} />
        <Toggle label="Email Daily Summary Report" defaultOn={true} />
        <Toggle label="Auto-notify Authorities on Critical" defaultOn={false} />
      </Section>

      {/* Network Settings */}
      <Section title="Network & Gateway" icon={<Wifi size={14} />}>
        <NumberInput label="Node Polling Interval" defaultVal={30} min={5} max={300} unit="sec" />
        <NumberInput label="Offline Timeout Threshold" defaultVal={120} min={30} max={600} unit="sec" />
        <NumberInput label="Max Reconnect Attempts" defaultVal={5} min={1} max={20} unit="×" />
        <Toggle label="LoRa Fallback Mode" defaultOn={true} />
        <Toggle label="Mesh Network Auto-Heal" defaultOn={true} />
        <Toggle label="Low-Bandwidth Data Compression" defaultOn={true} />
      </Section>

      {/* AI Model Settings */}
      <Section title="Edge AI Configuration" icon={<Cpu size={14} />}>
        <Toggle label="Enable Edge Inference on Nodes" defaultOn={true} />
        <Toggle label="Cloud Fallback Inference" defaultOn={false} />
        <Toggle label="Auto-Update AI Models OTA" defaultOn={true} />
        <NumberInput label="Inference Interval" defaultVal={60} min={10} max={3600} unit="sec" />
        <NumberInput label="Confidence Score Minimum" defaultVal={65} min={40} max={99} unit="%" />
      </Section>

      {/* Security */}
      <Section title="Security" icon={<Shield size={14} />}>
        <Toggle label="Encrypt Node Communications (TLS)" defaultOn={true} />
        <Toggle label="Two-Factor Authentication" defaultOn={false} />
        <Toggle label="API Rate Limiting" defaultOn={true} />
        <Toggle label="Node Certificate Pinning" defaultOn={true} />
      </Section>

      {/* Display */}
      <Section title="Display & UI" icon={<Moon size={14} />}>
        <Toggle label="Dark Mode" defaultOn={true} />
        <Toggle label="Animated Node Pulse" defaultOn={true} />
        <Toggle label="Real-time Chart Updates" defaultOn={true} />
        <Toggle label="Show Offline Nodes on Map" defaultOn={true} />
        <NumberInput label="Chart History Duration" defaultVal={24} min={1} max={168} unit="hrs" />
        <NumberInput label="Alert Feed Max Items" defaultVal={50} min={10} max={200} unit="rows" />
      </Section>

      {/* Data */}
      <Section title="Data Management" icon={<Database size={14} />}>
        <Toggle label="Local Data Caching" defaultOn={true} />
        <Toggle label="Auto-Archive Alerts" defaultOn={true} />
        <NumberInput label="Data Retention Period" defaultVal={90} min={7} max={365} unit="days" />
        <Toggle label="Export to CSV on Alert" defaultOn={false} />
      </Section>

      {/* Gateway Status */}
      <Section title="Gateway Status" icon={<Radio size={14} />}>
        <div className="py-3 space-y-2">
          {[
            { label: "Gateway IP", value: "192.168.1.254", color: "text-teal-400" },
            { label: "Protocol", value: "MQTT over TLS 1.3", color: "text-blue-400" },
            { label: "Message Broker", value: "Mosquitto v2.0.18", color: "text-slate-300" },
            { label: "Active Subscriptions", value: "42 topics", color: "text-green-400" },
            { label: "Uptime", value: "14d 7h 22m", color: "text-slate-300" },
            { label: "Messages/sec", value: "~128 msg/s", color: "text-purple-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">{item.label}</span>
              <span className={`text-[10px] font-mono font-bold ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
