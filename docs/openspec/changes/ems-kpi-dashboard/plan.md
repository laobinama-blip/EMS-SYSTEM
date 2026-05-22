# EMS KPI 看板项目实施计划 (Implementation Plan)

本计划基于 4 张原型图、已上传的能源与碳排接口文档，以及 2026-05-22 复核结论更新。结论：总体方向同意，但必须按本版修正后再进入开发。前端必须以原型为高保真设计源。

---

## 1. 首期开发范围与工程目录结构

以 GitHub 仓库 `laobinama-blip/EMS-SYSTEM` 的 `main` 分支为唯一基准。开发前应重新 clone/pull 远端仓库，避免复用未确认的本地临时代码。

首期范围调整为**前端-only 开发**：不在本仓库开发生产后端。前端通过 Vite proxy / `apiClient` 调用真实后端接口；真实接口未覆盖的数据使用前端 mock adapter / fixtures 支撑页面高保真展示。

```
EMS-SYSTEM/
├── openapi.yaml
└── ems-frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── mocks/
    │   ├── index.css
    │   ├── App.tsx
    │   └── main.tsx
    ├── tsconfig.json
    └── package.json
```

---

## 2. 高保真设计系统与视觉规范

原型图是浅色工业 KPI 看板，不采用深色 glassmorphism 主题。实现必须贴近原型：

- **页面背景**：浅灰 `#f1f3f7` / `#f4f6fa`。
- **顶部栏**：白色、细边框、横向 Tab 导航，选中态为黑色底部粗线。
- **筛选条**：白色大圆角容器，浅灰分段按钮，选中项为白色胶囊并带轻阴影；查询按钮为亮蓝色。
- **卡片容器**：白色或近白背景，8-16px 圆角，浅灰边框，轻阴影；不使用大面积深色毛玻璃。
- **图表样式**：调度后使用亮绿色 `#18d88a`，调度前使用中性灰 `#8a8f93`；虚线网格、轻量坐标轴、紧凑图例、白色 tooltip。
- **告警样式**：红色描边、浅红背景、左侧告警图标，与原型右上角胶囊一致。
- **字体与密度**：使用系统无衬线字体栈；指标数字清晰中等字重；以 1920px 原型为主验收视口。
- **高保真验收**：每个页面完成后必须用浏览器截图与对应原型对照，记录至少 5 个核对点：布局、颜色、字体、卡片、图表/拓扑/时间轴。

---

## 3. API 契约与适配策略

- 能源与碳排官方接口路径必须保留 `/api/kpi/energy/*`。
- 缺失接口按 `api-gap-analysis.md` 定义补齐前端 mock 数据源，包括 common、efficiency、network、dispatch 和 time-of-use-electricity。
- OpenAPI 需覆盖官方 10 个能源接口和新增 mock/扩展接口；不要写死“11 个接口”。
- 前端 mock 数据可按 `{ code, message, data }` envelope 组织，但 `apiClient` 必须兼容真实服务可能直接返回 body 的情况。
- `energy-trend` 与 `vehicle-energy-per-100km` 的“调度前/调度后”字段是 EMS 看板扩展字段，必须在 OpenAPI 中标注。

---

## 4. 数据计算口径与公式

- TEU 换算：20 英尺 = 1.0 TEU，40 英尺 = 2.0 TEU，45 英尺 = 2.25 TEU，未知默认 1.0 TEU。
- 成本计算：能耗值乘能源单价；首期 fixture 固化，后续可替换为真实后端配置。
- 碳排计算：能耗值乘碳排系数，单位需在 OpenAPI 中明确区分 kgCO2、tCO2。
- 分时电价：按原型 6 个时间段计算；避峰率和节省金额用于支持原型展示，首期为前端 mock 口径。
- 外集卡：官方文档说明当前固定空数组，若前端展示原型里的外集卡数值，必须标注为 mock 展示数据。

---

## 5. 前端核心组件

- `AppShell`：Reewell 顶部品牌、四页 Tab、告警胶囊、工具按钮和头像。
- `FilterBar`：2h、8h、1天、3天、7天、自定义日期、设备选择、查询、重置。
- `MetricCard` / `Panel`：复用白色卡片容器和指标排布。
- `TrendChart` / `BarCompareChart`：Recharts 封装，支持调度前后双序列。
- `RelationshipGraph`：原生 SVG 画布，节点悬停/点击反馈，贴近第二张原型。
- `GanttChart`：调度分析二次事件时间轴，贴近第三张原型。

---

## 6. 验证命令

```powershell
# frontend
cd EMS-SYSTEM\ems-frontend
npm run typecheck
npm run build
npm run dev
```

前端默认监听 `5173`，并将 `/api` 代理到真实服务 `http://10.105.64.36:20003/api`；真实服务不可访问或接口缺失时，由前端 mock adapter 返回页面所需数据。
