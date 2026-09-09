import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "EnvNet Control Center – Environmental Intelligence Network",
  description:
    "Regional control center for distributed edge-AI powered ESP32 sensor nodes monitoring multi-hazard environmental risks.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
