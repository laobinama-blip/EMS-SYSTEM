# EMS KPI Dashboard Implementation Plan

This plan details the folder structure, development workflow, design tokens, and testing procedures for the EMS project.

---

## 1. Directory Structure & Monorepo Design

We will implement the front-end and back-end projects inside the [EMS](file:///c:/Antigravity/EMS) workspace using a clean, separated structure:

```
c:/Antigravity/EMS/
├── openapi.yaml                 # OpenAPI 3.1.0 spec contract
├── ems-backend/                 # Node.js + Express API Server (TS)
│   ├── src/
│   │   ├── controllers/         # Handles routing endpoints
│   │   ├── services/            # Simulated DB models, formulas, aggregation
│   │   ├── config/              # Constants (price indices, carbon factors)
│   │   └── server.ts            # Bootstraps Express and Swagger UI
│   ├── tsconfig.json
│   └── package.json
└── ems-frontend/                # Vite + React + TS Frontend Dashboard
    ├── public/
    ├── src/
    │   ├── components/          # Reusable components (FilterBar, AppShell, cards)
    │   ├── pages/               # Page components (Efficiency, Network, Dispatch, Energy)
    │   ├── services/            # Axios API client modules
    │   ├── index.css            # Global CSS variables, theme styling
    │   ├── App.tsx              # React entry router
    │   └── main.tsx             # DOM bootstrapper
    ├── tsconfig.json
    └── package.json
```

---

## 2. Design System & Style Guide

We will use Vanilla CSS variables to define a state-of-the-art dark theme that feels premium and immersive:
- **Base Background:** `#0b0f19` (rich deep dark navy).
- **Cards & Containers:** Background `rgba(17, 24, 39, 0.7)` with `backdrop-filter: blur(12px)` and a thin semi-transparent border `1px solid rgba(255, 255, 255, 0.08)`.
- **Primary Accents:** 
  - Glowing Emerald green (`#10b981` / HSL `160, 84%, 39%`) for dispatch efficiency.
  - Electric Blue (`#3b82f6`) for standard metrics.
  - Vibrant Violet (`#8b5cf6`) for secondary indicators.
  - Warm Amber (`#f59e0b`) for alerts/charging states.
- **Typography:** `Inter` or `Outfit` from Google Fonts, utilizing clear weight differentiation (400 regular, 500 medium, 600 semi-bold) instead of standard browser sans-serif.

---

## 3. Backend Formulas & Logic

The mock service will maintain logical consistency over PostgreSQL/InfluxDB simulated tables:
1. **TEU Conversion:** Convert 20ft container (1 TEU), 40ft (2 TEU), 45ft (2.25 TEU) when aggregating mock snapshot databases.
2. **Electricity Cost:**
   $$\text{Electricity Cost} = \text{Energy (kWh)} \times 0.80\text{ RMB}$$
3. **Diesel Cost:**
   $$\text{Diesel Cost} = \text{Fuel (L)} \times 7.50\text{ RMB}$$
4. **Carbon Footprint:**
   $$\text{Electricity Carbon} = \text{Energy (kWh)} \times 0.527\text{ kgCO2}$$
   $$\text{Diesel Carbon} = \text{Fuel (L)} \times 2.63\text{ kgCO2}$$
5. **Time-of-use (TOU) Rates:**
   - Peak hours (06:00-12:00, 12:00-18:00): `1.2 RMB/kWh`.
   - Normal hours (18:00-22:00): `0.8 RMB/kWh`.
   - Valley hours (22:00-24:00, 00:00-06:00): `0.4 RMB/kWh`.
   - Dispatch models will simulate shifts in truck schedules from Peak to Valley hours to achieve the 42% cost reduction shown in the prototype.

---

## 4. Frontend Component Breakdown

- **`AppShell`:** Top shell layout holding navigation links, site branding, user badge, and the real-time header alert widget.
- **`FilterBar`:** Horizontal bar with quick select buttons (2h, 8h, 1d, 3d, 7d, custom), start/end inputs, and query/reset callbacks.
- **`MetricCard`:** Unified container displaying KPI text, percentage changes, small trend indicators, and supporting CSS glassmorphism.
- **`RelationshipGraph`:** Customized SVG-based force layout renderer drawing nodes for cranes, vehicles, blocks, and connections with active tooltips.
- **`GanttChart`:** SVG timeline chart representing dispatch events (e.g. secondary dispatch).
- **`TrendChart`:** Wrapper using Recharts `LineChart` and HSL gradient fills.
- **`BarCompareChart`:** Recharts `BarChart` comparing before vs. after dispatch.

---

## 5. Verification Commands

### Quality Gates
We will run CLI checks inside the `ems-backend` and `ems-frontend` folders to confirm build stability:

- **Type Checking:**
  ```powershell
  # Inside ems-backend
  npm run typecheck
  # Inside ems-frontend
  npm run typecheck
  ```
- **Production Build:**
  ```powershell
  # Inside ems-frontend
  npm run build
  ```
- **Local Launch:**
  ```powershell
  # Start backend
  npm run dev (on port 20003)
  # Start frontend
  npm run dev (on port 5173)
  ```
