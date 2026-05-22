# EMS KPI Dashboard Specification

## Requirement 1: Application Architecture
The system MUST run as a decoupled client-server architecture with a React-based frontend and a Node.js Express backend.

### Acceptance Criteria
- **Given** the backend mock service is running
- **When** the frontend initiates page load or filter requests
- **Then** all statistics and series must be retrieved from backend HTTP endpoints (under `/api/kpi/*`) rather than hardcoded in React state.
- **Given** the application shell is rendered
- **When** a user clicks on tabs in the top navigation
- **Then** the page view switches and the navigation selection state updates with a smooth hover/focus indicator.

---

## Requirement 2: Global Filtering Bar
The dashboard MUST feature a unified filtering system managing query durations and device profiles.

### Acceptance Criteria
- **Given** the global `FilterBar` is mounted
- **When** a user selects a duration preset (2h, 8h, 1d, 3d, 7d) or custom calendar dates, and clicks the `Query` button
- **Then** the active view reloads data from the backend applying the selected time boundaries, maintaining the selected filter state.
- **Given** filters are applied (e.g. custom date range or a specific device)
- **When** the user clicks the `Reset` button
- **Then** the time filter reverts to the default `1d` preset, date selectors clear, device selection returns to `全部` (All), and the page reloads default values.

---

## Requirement 3: Operational Efficiency Page (作业效率)
The dashboard MUST display general operational throughput and efficiency metrics.

### Acceptance Criteria
- **Given** the user selects the "作业效率" tab
- **When** the view loads
- **Then** it must display four operational summary cards (全部作业统计, 装船作业统计, 卸船作业统计, 转栈作业统计) showing TEUs, natural boxes, vehicle cycles, and container length distribution.
- **Given** the backend returns efficiency charts dataset
- **When** charts are rendered
- **Then** the average vehicle efficiency, empty running rate, QC efficiency, YC efficiency, and waiting time charts must show comparative plots representing dispatch effectiveness.

---

## Requirement 4: Relationship Network Page (关系网)
The system MUST render an interactive node-link visualization of dispatch assets.

### Acceptance Criteria
- **Given** the user selects the "关系网" tab
- **When** the view loads
- **Then** the page must render an interactive, responsive SVG force layout graphing operational nodes: Cranes (QC), Yard Cranes (YC), Vehicles (Trucks), Blocks, Ships, and Charging/Swapping Stations.
- **Given** nodes are displayed
- **When** a user hovers over a node
- **Then** the node should scale up, its label should highlight, and a custom tooltip drawer should show detailed asset specs (e.g. current battery, active assignment, node code).
- **Given** links represent assignments
- **When** dispatch states change
- **Then** paths between nodes must render in colors indicating task progress.

---

## Requirement 5: Dispatch Analysis Page (调度分析)
The system MUST display statistical indicators of dispatch algorithm operations.

### Acceptance Criteria
- **Given** the user selects the "调度分析" tab
- **When** the view loads
- **Then** the page must display:
  - An algorithm efficiency improvement comparison line chart.
  - A Hymala world model stability line chart plotting success rate, request volume, latency, and timeouts.
  - A horizontal Gantt-like timeline visualizing dispatch event sequences (二次调度分析).
- **Given** the horizontal event timeline is rendered
- **When** events are positioned on the time axis
- **Then** each block should display details like task name (e.g., 耳轴换介, 重选退出), execution status, and click events to inspect event properties.

---

## Requirement 6: Energy & Carbon Emission Page (能源与碳排)
The dashboard MUST display detailed energy consumption metrics, complying with the spec paths defined in the backend API documentation.

### Acceptance Criteria
- **Given** the backend serves `/api/kpi/energy/single-box-energy-statistics`
- **When** the Energy page loads
- **Then** the "单箱能耗" component must display a stacked bar breakdown with segments for QC, 水平运输, YC, and 外集卡, showing percentages for 柴油, 火力, and 绿电.
- **Given** the backend serves `/api/kpi/energy/time-of-use-electricity`
- **When** the view loads
- **Then** the page must display the electricity load shifting cards (调度前, 调度后, 节省金额, 避峰率) and a detailed interval table comparison.
- **Given** the backend serves `/api/kpi/energy/energy-trend`
- **When** the view loads
- **Then** the line chart must plot two separate series: before dispatch energy and after dispatch energy.
- **Given** the backend serves `/api/kpi/energy/vehicle-energy-per-100km`
- **When** the view loads
- **Then** the performance table must show a tabular comparison of vehicle energy, cost, and carbon emissions before vs. after dispatch.

---

## Requirement 7: Quality Verification Gates
The project codebase MUST include commands to run automated compilation and validation.

### Acceptance Criteria
- **Given** developers run verification commands
- **When** executing `npm run typecheck`
- **Then** all files must pass TypeScript compilation without errors.
- **Given** frontend project compilation is requested
- **When** running `npm run build`
- **Then** the Vite compiler must generate optimized production files in the `/dist` directory.
