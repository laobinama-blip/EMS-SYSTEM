# EMS KPI Dashboard Proposal

## 1. Background
The goal is to develop a front-end and back-end separated Energy Management System (EMS) dashboard based on four high-fidelity prototype wireframe pages (Operational Efficiency, Relationship Network, Dispatch Analysis, Energy & Carbon Emission). 

Currently, formal backend documentation ([02_第三页_能源与碳排接口与表结构梳理.md](file:///c:/Antigravity/EMS/02_第三页_能源与碳排接口与表结构梳理.md)) covers only the Energy & Carbon page. This proposal outlines the setup of an integrated development framework where the missing components are isolated using an Express API adapter/mock layer, enabling parallel development of the interactive elements and facilitating seamless production integration later.

---

## 2. Project Scope

### Frontend Dashboard
- Implement a unified dashboard container (`AppShell`) featuring the Reewell brand header, top tab navigation, notification drawer, and active alert systems (e.g., "QC301 efficiency alert").
- Implement a global `FilterBar` that manages filter states (2h, 8h, 1d, 3d, 7d, Custom Date Range, and device selection) and triggers component updates on Query/Reset.
- Implement four interactive dashboard views:
  1. **作业效率 (Operational Efficiency):** Display statistics cards (TEU, cycles, etc.) and five analytical charts (efficiency, empty rate, crane/bridge rates, etc.).
  2. **关系网 (Relationship Network):** Create an interactive SVG-based force-directed node-link graph visualizing cranes, vehicles, blocks, and charging stations with real-time assignment visual connections.
  3. **调度分析 (Dispatch Analysis):** Display algorithm improvement curves, Hymala stability trends, and a horizontal timeline visualizing job execution events.
  4. **能源与碳排 (Energy and Carbon Emission):** Real-time energy, cost, and carbon breakdown cards, line charts (energy trend, green power ratio), time-of-use cost matrices, and vehicle performance lists.

### Backend Mock Server
- Set up a Node.js Express server configured with TypeScript that serves all backend endpoints.
- Align the Energy & Carbon endpoints exactly with the provided documentation paths.
- Provision simulated REST endpoints under `/api/kpi/efficiency/*`, `/api/kpi/network/*`, and `/api/kpi/dispatch/*` to return realistic operational statistics.
- Provide a Swagger documentation view for API inspection.

---

## 3. Out of Scope
- Integration with real, active production databases (PostgreSQL or InfluxDB clusters).
- Deployment of actual dispatch optimization models or Hymala World model code.
- User authentication, role-based access control, or live webhook alert triggers.
- Deployment to staging/production cloud servers.

---

## 4. Architectural Decisions
- **Frontend Stack:** React 19 + TypeScript + Vite + Vanilla CSS. Using CSS custom properties and HSL-based colors to implement a modern, premium glassmorphic dark theme (`#0b0f19`).
- **Charting Control:** Recharts for premium, responsive charts and SVG elements for the custom force-directed graph.
- **Backend Stack:** Express + TypeScript + ts-node. In-memory data simulator representing postgres/influx tables, maintaining data relationships and applying formulas.

---

## 5. Risks & Mitigation

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **API Gaps in Documentation** | High | Design mock API models containing the necessary before/after comparison fields and time-of-use tables. |
| **High Resolution UI Constraints** | Medium | Implement elastic grid layouts and flex components, allowing horizontal scrolling or single-column stack layout on lower desktop widths. |
| **Interactive Graph Performance** | Medium | Build using optimized React-SVG nodes rather than heavy external canvas libraries to keep load speeds fast. |

---

## 6. Rollback Plan
All changes are self-contained inside the [EMS](file:///c:/Antigravity/EMS) workspace. No modifications are made to external system components. To roll back, simply terminate the node/react local processes and delete the project folder or discard git modifications.

---

## 7. Acceptance Criteria
- Top navigation tabs allow switching between the four views without layout shifts.
- Global filter bar inputs trigger data refetches on click and clear on reset.
- Chart legends, tooltip states, and hover effects function fluidly.
- Network graph nodes and edges render correctly with colored status highlights.
- The Energy & Carbon page consumes APIs matching the official backend specification.
- `npm run typecheck` and `npm run build` pass without warnings.
