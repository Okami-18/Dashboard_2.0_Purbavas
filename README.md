# 🌍 Purbavas - Environmental Intelligence Network Dashboard

> **Real-time Environmental Monitoring, Edge AI Hazard Inference & IoT Sensor Network Management Platform (EnvNet OS).**

---

## 📖 Overview

**Purbavas Dashboard** is an advanced environmental intelligence operations platform designed to monitor distributed IoT sensor nodes (e.g., ESP32-based field telemetry units), evaluate real-time hazard risks using Edge AI inference models, and coordinate disaster mitigation and emergency broadcasts.

The system continuously tracks environmental parameters such as flood water levels, air quality index (AQI), gas concentrations, soil moisture, rainfall, temperature, and humidity across geographically dispersed monitoring zones.

---

## ✨ Features

- 📊 **Real-time Telemetry Streaming**: Live simulation and telemetry updates for water level, air quality, toxic gases (PPM), soil moisture, rainfall, temperature, and humidity.
- 🤖 **Edge AI Risk Inference**: Automated risk assessment categorized into *Normal*, *Elevated*, *High*, and *Critical* for early disaster detection (Floods, Landslides, Toxic Gas, Wildfires).
- 🗺️ **Interactive Geospatial Risk Map**: Visual map representation of deployed sensor nodes with live status indicators, signal strengths (RSSI), and contextual hazard markers.
- 🚨 **Live Alert Feed & Dispatch**: Prioritized emergency alerts with acknowledgment actions and one-click community notification dispatching.
- 📡 **Fleet & Node Management**: Comprehensive node drawer with battery telemetry, firmware versions, hardware metrics, and individual historical telemetry charts.
- 📈 **Historical Trend Visualizations**: Responsive time-series charts powered by Recharts for trend analysis and anomaly detection.
- ⚙️ **Network & Threshold Settings**: Configurable alert thresholds, MQTT gateway configurations, and system preferences.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Frontend Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Visualizations**: [Recharts](https://recharts.org/)
- **Database / ORM**: [Drizzle ORM](https://orm.drizzle.team/) & [node-postgres (`pg`)](https://node-postgres.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18+ or v20+ / v24+ recommended)
- [npm](https://www.npmjs.com/) (or `pnpm` / `yarn` / `bun`)
- PostgreSQL (Optional, for persistent database backend)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ranit121105/Purbavas_Dashboard.git
   cd Purbavas_Dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (optional):**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/purbavas"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 📂 Project Structure

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── health/        # Health check endpoint
│   │   ├── globals.css        # Global CSS & Tailwind styling
│   │   ├── layout.tsx         # Root application layout
│   │   └── page.tsx           # Main dashboard orchestrator
│   ├── components/
│   │   ├── AlertsFeed.tsx     # Emergency alert feed and action triggers
│   │   ├── Header.tsx         # Top navigation bar & system status
│   │   ├── KpiCards.tsx       # Key performance indicators
│   │   ├── NetworkMap.tsx     # Node topology visualizer
│   │   ├── NodeDrawer.tsx     # Detailed node inspection slide-out drawer
│   │   ├── NodeManagement.tsx # Fleet monitoring & node table
│   │   ├── OverviewTab.tsx    # Primary operational summary view
│   │   ├── RiskMapView.tsx    # Geospatial risk analysis view
│   │   ├── SettingsPanel.tsx  # Threshold & MQTT settings
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── TelemetryChart.tsx # Interactive historical data charts
│   ├── db/
│   │   ├── index.ts           # Database connection & pooling
│   │   └── schema.ts          # Drizzle schema definitions
│   └── lib/
│       └── mockData.ts        # Simulated node fleet & sensor telemetry
├── drizzle.config.json        # Drizzle configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Project metadata and dependencies
└── tsconfig.json              # TypeScript configuration
```

---

## 📜 Available Scripts

- `npm run dev` — Starts the Next.js development server with Turbopack.
- `npm run build` — Builds the optimized production application.
- `npm run start` — Starts the production Next.js server.
- `npm run lint` — Runs ESLint code quality checks.
- `npm run typecheck` — Validates TypeScript types without emitting files.

---

## 📄 License

This project is licensed under the MIT License.
