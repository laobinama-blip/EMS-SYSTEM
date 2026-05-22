# EMS KPI Dashboard API Gap Analysis

This document provides a detailed mapping between the frontend prototype dashboard components and the backend API specification. It highlights the coverage of existing endpoints, identifies missing APIs, and designs the specific data schemas needed to bridge these gaps.

---

## 1. API Coverage Matrix (Four Prototype Pages)

| Page / Tab | UI Component / Chart | Associated API Endpoint | Coverage Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Global Shell** | Top header KPI alerts, notification count, user session profile | `GET /api/kpi/common/header-status` | **MISSING** | Required for "QC301 efficiency alert" and user badge. |
| **Operational Efficiency** | Total stats (TEU, natural boxes, vehicle cycles, container length segments) | `GET /api/kpi/efficiency/work-summary` | **MISSING** | Aggregated stats for the past 2h/8h/1d/3d/7d. |
| **Operational Efficiency** | KPI Summary cards (Energy, Efficiency, Equipment) | `GET /api/kpi/efficiency/summary-cards` | **MISSING** | Summarized cost, cost rate, equipment count. |
| **Operational Efficiency** | Avg Vehicle Efficiency, Avg Empty Rate, QC Efficiency, YC Efficiency, Avg Wait Time charts | `GET /api/kpi/efficiency/charts` | **MISSING** | Series data for before vs. after dispatch comparison. |
| **Relationship Network** | Node-link graph (QCs, YCs, Vehicles, Charging Stations, Blocks, Connections) | `GET /api/kpi/network/topology` | **MISSING** | Graph topology dataset (nodes & edges) with status tags. |
| **Dispatch Analysis** | "Algorithm Efficiency Improvement" comparison & statistics card | `GET /api/kpi/dispatch/algorithm-efficiency` | **MISSING** | Dispatch algorithm performance indicators. |
| **Dispatch Analysis** | "Hymala World Model Stability" trend & KPI indicators | `GET /api/kpi/dispatch/hymala-stability` | **MISSING** | Success rate, latency, request count, timeout rate. |
| **Dispatch Analysis** | "Secondary Dispatch Analysis" horizontal Gantt chart | `GET /api/kpi/dispatch/secondary-events` | **MISSING** | Chronological timeline of dispatch events and tasks. |
| **Energy & Carbon** | Top filter bar selectors & dropdown menus | `GET /api/kpi/energy/device-types`<br>`GET /api/kpi/energy/devices` | **COVERED** | Base endpoints for dropdown options. |
| **Energy & Carbon** | Single Box Energy (3.517 kWh/TEU bar breakdown) | `GET /api/kpi/energy/single-box-energy-statistics` | **COVERED** | Basic coverage; external truck is fixed to empty. |
| **Energy & Carbon** | Single Box Integrated Cost (2.473 RMB/TEU breakdown) | `GET /api/kpi/energy/single-box-energy-cost` | **COVERED** | Calculated using energy value * price configs. |
| **Energy & Carbon** | Single Box Carbon Emission (3.285 tCO2/TEU breakdown) | `GET /api/kpi/energy/carbon-emission-distribution` | **COVERED** | Calculated using energy value * carbon factor configs. |
| **Energy & Carbon** | Energy Trend (24h line comparison before/after) | `GET /api/kpi/energy/energy-trend` | **GAP** | Document only defines single total/average series. |
| **Energy & Carbon** | Traditional Power vs. Green Power (badge & 24h trend) | `GET /api/kpi/energy/traditional-vs-green-power` | **COVERED** | Full coverage for traditional vs green series. |
| **Energy & Carbon** | Time-of-use Electricity Price (避峰率 & hourly comparison) | `GET /api/kpi/energy/time-of-use-electricity` | **MISSING** | Missing comparison for electricity load shifting. |
| **Energy & Carbon** | Single Vehicle Energy per 100km table | `GET /api/kpi/energy/vehicle-energy-per-100km` | **GAP** | Document only defines single values for each vehicle. |

---

## 2. Deep Dive: Critical Gaps & Proposed API Solutions

### Gap 1: Time-of-use Electricity Price (分时电价)
* **UI Requirement:** Display "Before Dispatch Cost" (RMB), "After Dispatch Cost" (RMB), "Savings" (RMB), "Average Electricity Price per km" (RMB/km), and "Peak Shifting Rate" (%). Show a tabular comparison of energy usage (kWh) and cost (RMB) across six intervals: `00:00-02:00`, `02:00-06:00`, `06:00-12:00`, `12:00-18:00`, `18:00-22:00`, `22:00-24:00`.
* **Proposed API:** `GET /api/kpi/energy/time-of-use-electricity`
* **Response Schema:**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "kpis": {
      "beforeDispatchCost": 6351.0,
      "afterDispatchCost": 5021.0,
      "savingsAmount": 1330.0,
      "averagePricePerKm": 0.45,
      "peakShiftingRate": 42.0
    },
    "intervals": [
      {
        "timeRange": "00:00-02:00",
        "beforeDispatchKwh": 1112.0,
        "afterDispatchKwh": 946.0,
        "beforeDispatchCost": 311.14,
        "afterDispatchCost": 120.20
      },
      {
        "timeRange": "02:00-06:00",
        "beforeDispatchKwh": 3688.0,
        "afterDispatchKwh": 3120.0,
        "beforeDispatchCost": 1025.66,
        "afterDispatchCost": 899.20
      },
      {
        "timeRange": "06:00-12:00",
        "beforeDispatchKwh": 3256.0,
        "afterDispatchKwh": 3120.0,
        "beforeDispatchCost": 1524.12,
        "afterDispatchCost": 12200.20
      },
      {
        "timeRange": "12:00-18:00",
        "beforeDispatchKwh": 4512.0,
        "afterDispatchKwh": 3744.0,
        "beforeDispatchCost": 1951.18,
        "afterDispatchCost": 1789.70
      },
      {
        "timeRange": "18:00-22:00",
        "beforeDispatchKwh": 3256.0,
        "afterDispatchKwh": 4400.0,
        "beforeDispatchCost": 1394.74,
        "afterDispatchCost": 1076.20
      },
      {
        "timeRange": "22:00-24:00",
        "beforeDispatchKwh": 1196.0,
        "afterDispatchKwh": 908.0,
        "beforeDispatchCost": 285.37,
        "afterDispatchCost": 216.71
      }
    ]
  }
}
```

### Gap 2: Energy Trend Comparison (能耗趋势)
* **UI Requirement:** Line chart showing two series over time (day or hour): "Before Dispatch" and "After Dispatch".
* **Proposed Extension:** Update `/api/kpi/energy/energy-trend` to return dual metrics.
* **Response Schema:**
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "statTime": "2026-05-21 00:00:00",
      "beforeDispatchEnergy": 55.4,
      "afterDispatchEnergy": 51.2
    },
    {
      "statTime": "2026-05-21 02:00:00",
      "beforeDispatchEnergy": 48.1,
      "afterDispatchEnergy": 42.6
    }
  ]
}
```

### Gap 3: Single Vehicle Energy per 100km (单车百公里能耗)
* **UI Requirement:** Compare vehicle metrics before vs. after dispatch for energy (kWh/100km), cost (RMB/100km), and carbon emissions (kgCO2/100km).
* **Proposed Extension:** Update `/api/kpi/energy/vehicle-energy-per-100km` to return comparison objects.
* **Response Schema:**
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "deviceCode": "T001",
      "energy": {
        "beforeDispatch": 32.4,
        "afterDispatch": 32.4
      },
      "cost": {
        "beforeDispatch": 25.8,
        "afterDispatch": 25.8
      },
      "carbonEmission": {
        "beforeDispatch": 14.8,
        "afterDispatch": 14.8
      }
    },
    {
      "deviceCode": "T010",
      "energy": {
        "beforeDispatch": 32.1,
        "afterDispatch": 32.1
      },
      "cost": {
        "beforeDispatch": 25.2,
        "afterDispatch": 25.2
      },
      "carbonEmission": {
        "beforeDispatch": 14.8,
        "afterDispatch": 14.8
      }
    }
  ]
}
```

---

## 3. Local Mock Backend Strategy

To enable seamless frontend development and prevent dependencies on remote databases or offline models, the backend will implement a fully independent mock database:
1. **PostgreSQL Simulation:** An in-memory store simulating relational query aggregates over work instructions (`kpi_work_instruction_snapshot` and `kpi_work_instruction_energy_fact`).
2. **InfluxDB Simulation:** Time-series query simulation yielding realistic energy drop intervals over the active time queries.
3. **Calculation Formulas:**
   - **Cost calculation:** $Cost = Energy \times UnitPrice$
     - Electricity: `0.80 RMB/kWh`
     - Diesel: `7.50 RMB/L`
   - **Carbon calculation:** $Carbon = Energy \times CarbonFactor$
     - Electricity: `0.527 kgCO2/kWh`
     - Diesel: `2.63 kgCO2/L`
4. **Transition to Production:** The frontend services must import a unified Axios request instance (`apiClient.ts`). When remote services become available, only the base API URL needs to be changed.
