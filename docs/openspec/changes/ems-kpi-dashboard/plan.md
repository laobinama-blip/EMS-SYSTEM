# EMS KPI 看板项目实施计划 (Implementation Plan)

本实施计划规定了 EMS 项目的目录结构、设计规范、计算口径及最终编译验证流程。

---

## 1. 单体工程目录结构 (Monorepo Layout)

我们将在 [EMS](file:///c:/Antigravity/EMS) 目录下创建前端与后端的独立工作空间：

```
c:/Antigravity/EMS/
├── openapi.yaml                 # OpenAPI 3.1.0 接口规范契约
├── ems-backend/                 # Node.js + Express + TypeScript 模拟后端
│   ├── src/
│   │   ├── controllers/         # 接口路由控制器
│   │   ├── services/            # 仿真内存数据库、公式计算与聚合模型
│   │   ├── config/              # 全局配置 (单价、碳排系数、设备静态列表)
│   │   └── server.ts            # Express 启动文件与 Swagger 路由
│   ├── tsconfig.json
│   └── package.json
└── ems-frontend/                # Vite + React + TS 前端看板
    ├── public/
    ├── src/
    │   ├── components/          # 共享组件 (FilterBar, AppShell, MetricCard)
    │   ├── pages/               # 四大看板视图 (Efficiency, Network, Dispatch, Energy)
    │   ├── services/            # Axios API 客户端封装
    │   ├── index.css            # 全局样式系统、CSS 变量、深色玻璃拟物主题
    │   ├── App.tsx              # React 路由与页面切换控制
    │   └── main.tsx             # 应用挂载入口
    ├── tsconfig.json
    └── package.json
```

---

## 2. 设计系统与视觉规范 (Design System)

为实现高颜值的深色拟物玻璃化 (Glassmorphism) 主题，系统将严格遵循原生 CSS 变量配置：
- **基础背景色**：`#0b0f19` (深暗黑蓝色)。
- **卡片/容器背景**：`rgba(17, 24, 39, 0.7)` 配合背景模糊 `backdrop-filter: blur(12px)` 和微透明浅边框 `1px solid rgba(255, 255, 255, 0.08)`。
- **高亮辅助色 (HSL 渐变)**：
  - 翡翠绿 (`#10b981` / HSL `160, 84%, 39%`)：代表运行正常或调度后高效率。
  - 电力蓝 (`#3b82f6` / HSL `220, 90%, 59%`)：基础指标或调度前状态。
  - 魅惑紫 (`#8b5cf6` / HSL `260, 90%, 65%`)：二级辅助状态。
  - 温暖黄 (`#f59e0b` / HSL `38, 95%, 50%`)：告警、充电或低电量提示。
- **字体规范**：通过 Google Fonts 导入 `Inter` 或 `Outfit` 字体，严格区分字体粗细（400 Regular, 500 Medium, 600 Semi-bold），杜绝使用浏览器默认宋体或无衬线黑体。

---

## 3. 后端算法计算口径与公式 (Formulas & Logic)

后端服务在模拟 relational/timeseries 数据时，必须统一执行以下计算口径：

### 3.1 TEU 箱量换算
在 WI 记录中，按箱长折算 TEU 数值：
- 20 英尺箱 = 1.0 TEU
- 40 英尺箱 = 2.0 TEU
- 45 英尺箱 = 2.25 TEU
- 其余未知情况默认按 1.0 TEU 统计。

### 3.2 能耗成本计算
$$\text{总成本} = \text{能耗值 (电 kWh 或 柴油 L)} \times \text{对应单价}$$
- 柴油价格固定为：`7.50 RMB/L`。
- 电力标准价格固定为：`0.80 RMB/kWh`。

### 3.3 碳排放量计算
$$\text{碳排放量 (kgCO2)} = \text{能耗值 (电 kWh 或 柴油 L)} \times \text{碳排系数}$$
- 电力碳排放系数：`0.527 kgCO2/kWh`。
- 柴油碳排放系数：`2.63 kgCO2/L`。

### 3.4 分时电价 (Time-of-Use Rates) 避峰口径
在 `time-of-use-electricity` 接口中，电价将按照具体时间段变化：
- **高峰时段** (`06:00-12:00`、`12:00-18:00`)：`1.20 RMB/kWh`。
- **平段** (`18:00-22:00`)：`0.80 RMB/kWh`。
- **低谷时段** (`22:00-24:00`、`00:00-06:00`)：`0.40 RMB/kWh`。
*调度模拟算法会合理将集卡的充电/作业任务从高峰时段向谷段转移，实现原型展示的 **42% 成本节约和避峰率**。*

---

## 4. 前端核心组件分解 (Component Layout)

- **`AppShell`**：提供主布局，左上角 Reewell Logo 标志、顶部四大页面 Tab 切换导航、右上角动态告警通知（点击弹出告警明细）及当前用户 Badge。
- **`FilterBar`**：水平筛选条，包含快捷按钮组（2h, 8h, 1d, 3d, 7d）和自定义双日期选择器、设备下拉多选菜单，以及“查询”和“重置”按钮。
- **`MetricCard`**：基础指标容器，包含指标标题、主数值、占比色条、同比升降幅百分比箭头，支持玻璃模糊毛玻璃效果。
- **`RelationshipGraph`**：定制化原生 SVG 画布，基于力导向拓扑关系模型手写绘制 QC、YC、Vehicle、Block 节点，连线支持动态流光特效，点击节点能滑出卡片信息。
- **`GanttChart`**：二次调度分析专用的水平 Gantt 时间轴，按时间刻度比例渲染不同作业事件的色块块。
- **`TrendChart`**：对 Recharts `LineChart` 的封装，配置渐变色填充与 HSL 曲线视觉。
- **`BarCompareChart`**：对 Recharts `BarChart` 的封装，实现双色柱对比效果（调度前 vs 调度后）。

---

## 5. 项目验证命令清单 (Verification Commands)

我们将在各工作区下运行以下 CLI 命令以验证开发质量：

- **TypeScript 类型检查**：
  ```powershell
  # 进入 ems-backend
  cd C:\Antigravity\EMS\ems-backend
  npm run typecheck
  
  # 进入 ems-frontend
  cd C:\Antigravity\EMS\ems-frontend
  npm run typecheck
  ```
- **前端生产构建**：
  ```powershell
  # 在 ems-frontend 目录下
  npm run build
  ```
- **本地服务联调运行**：
  ```powershell
  # 启动后端 (监听端口 20003)
  npm run dev
  
  # 启动前端 (监听端口 5173 并反向代理至 20003)
  npm run dev
  ```
