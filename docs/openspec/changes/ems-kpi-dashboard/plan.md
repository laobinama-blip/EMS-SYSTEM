# EMS KPI 看板项目实施计划 (Implementation Plan)

本计划基于 4 张原型图、已上传的能源与碳排接口文档，以及 2026-05-22 复核结论更新。结论：总体方向同意，但必须按本版修正后再进入开发。

---

## 1. 工程目录结构 (Monorepo Layout)

以 GitHub 仓库 `laobinama-blip/EMS-SYSTEM` 的 `main` 分支为唯一基准。开发前应重新 clone/pull 远端仓库，避免复用未确认的本地临时代码。

```
EMS-SYSTEM/
├── openapi.yaml                 # OpenAPI 3.1.0 接口契约
├── ems-backend/                 # Node.js + Express + TypeScript mock/API adapter
│   ├── src/
│   │   ├── controllers/         # 路由控制器
│   │   ├── services/            # mock 数据、聚合口径、计算公式
│   │   ├── config/              # 单价、碳排系数、设备枚举、分时电价配置
│   │   └── server.ts            # Express 启动入口与 Swagger 路由
│   ├── tsconfig.json
│   └── package.json
└── ems-frontend/                # Vite + React + TypeScript 前端看板
    ├── src/
    │   ├── components/          # AppShell, FilterBar, MetricCard, charts
    │   ├── pages/               # Efficiency, Network, Dispatch, Energy
    │   ├── services/            # apiClient 与接口类型
    │   ├── index.css            # 原型浅色设计系统
    │   ├── App.tsx
    │   └── main.tsx
    ├── tsconfig.json
    └── package.json
```

---

## 2. 设计系统与视觉规范 (Design System)

原型图是浅色工业 KPI 看板，不采用深色 glassmorphism 主题。实现必须贴近原型：

- **页面背景**：浅灰 `#f1f3f7` / `#f4f6fa`。
- **顶部栏**：白色、细边框、横向 Tab 导航，选中态为黑色底部粗线。
- **卡片容器**：白色或近白色背景，8-16px 圆角，浅灰边框，轻阴影，不使用大面积深色毛玻璃。
- **主色**：调度后/正向使用亮绿色 `#18d88a`，调度前使用中性灰 `#8a8f93`，查询按钮使用亮蓝 `#2fbaf4`，告警使用红色描边和浅红底。
- **字体**：优先使用系统无衬线字体栈，避免依赖外网 Google Fonts；数字指标使用清晰中等字重。
- **布局密度**：以 1920px 原型为主要验收视口，移动端只做合理降级，不作为首版核心验收。

---

## 3. API 契约与适配策略

- 能源与碳排官方接口路径必须保留 `/api/kpi/energy/*`。
- 缺失接口按 `api-gap-analysis.md` 定义补齐 mock 路径，包括 common、efficiency、network、dispatch 和 time-of-use-electricity。
- OpenAPI 需覆盖官方 10 个能源接口和新增 mock/扩展接口；不要再写死“11 个接口”。
- Mock 服务可统一返回 `{ code, message, data }`，但前端 `apiClient` 必须兼容真实服务可能直接返回 body 的情况。
- `energy-trend` 与 `vehicle-energy-per-100km` 的“调度前/调度后”字段是扩展字段，必须在 OpenAPI 中标记为 EMS 看板扩展，不假装官方文档已有。

---

## 4. 后端计算口径与公式

- TEU 换算：20 英尺 = 1.0 TEU，40 英尺 = 2.0 TEU，45 英尺 = 2.25 TEU，未知默认 1.0 TEU。
- 成本计算：能耗值乘能源单价，单价配置放在后端 config 中，后续可替换为表配置。
- 碳排计算：能耗值乘碳排系数，单位需在 OpenAPI 中明确区分 kgCO2、tCO2。
- 分时电价：按高峰、平段、低谷时段计算；避峰率和节省金额用于支持原型展示，但首版为 mock/仿真口径。
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
# backend
cd EMS-SYSTEM\ems-backend
npm run typecheck
npm run dev

# frontend
cd EMS-SYSTEM\ems-frontend
npm run typecheck
npm run build
npm run dev
```

后端默认监听 `20003`，前端默认监听 `5173` 并代理 `/api` 到 `20003`。
