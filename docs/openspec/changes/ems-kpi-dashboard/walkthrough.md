# EMS KPI 看板前端开发 Walkthrough (Walkthrough Report)

已成功构建并打包高保真 EMS KPI 看板前端应用程序。本报告概述了主要实现详情、页面布局还原、交互细节和构建验证结果。

## 页面实现详情 (Page Walkthrough)

### 1. 全局框架 Shell 与 筛选栏
- **顶部 AppShell Header**：
  - 左侧展示 `Reewell World | EMS KPI` 和定位 SVG 图标。
  - 中间为文字加粗、选中带底部横线的 Tab 导航（作业效率、关系网、调度分析、能源与碳排）。
  - 右侧包含：
    - 红框浅红底的**告警胶囊**（`QC301效率 25.4箱/h，低于阈值30箱/h`）。
    - 带红点角标的**通知按钮**和**设置按钮**。
    - 用户头像（根据 `Reewell Operator` 生成的字符缩写 `RE`）。
- **全局 FilterBar**：
  - 圆角胶囊容器，包含快捷时间 presets (2h/8h/1天/3天/7天/自定义)。
  - 自定义输入起始与结束时间，以及设备类型 (All, Vehicle, QC, YC) 和编码的选择下拉框，通过 `查询` / `重置` 控制全局状态。

---

### 2. 作业效率页 (Page 1 - Efficiency.tsx)
- **作业统计区**：
  - 左侧 1.2fr 的全场总统计（包含 TEU、自然箱数、集卡循环及 20/40/45尺箱量细分进度条）。
  - 右侧 2.8fr 的三列细分统计（装船、卸船、转堆），以相同的进度条和小圆点色块区分。
- **中部统计**：
  - 呈现能耗、效率、设备状态指标卡。
- **图表对比区**：
  - 右侧垂直排列的“车辆平均作业效率”和“车辆平均空驶率”双折线图。
  - 底部三列分别展示“岸桥平均作业效率 (折线)”、“场桥平均作业效率 (折线)”、“岸下集卡平均等待时间 (柱状)”。
  - **色彩对齐**：调度前使用中灰（`#858c8c`，虚线），调度后使用亮绿（`#19d98f`，实线）。

---

### 3. 关系网拓扑页 (Page 2 - Network.tsx)
- **SVG 拓扑画布**：
  - 背景渲染 `#d3daf0` 密布点阵网格，支持平滑悬停与连线交互。
  - 节点坐标按照 `EMS2.png` 严格比例换算成固定像素，包含 Ship、QC、RTG, Vehicle, Block, Charging 和 Swapping 等各类节点。
  - 连线采用实线与虚线以表达主/备任务路线，当鼠标悬停于某一节点时，自动高亮该节点的所有关联边为蓝色，其他节点半透明。
- **信息浮层与图例**：
  - 点击任一节点，左侧滑出详细数据抽屉（如运行状态、当前任务、电池电量、靠泊时间等）。
  - 右下角展示可收缩的拓扑图例面板。

---

### 4. 调度分析页 (Page 3 - Dispatch.tsx)
- **对比图表**：
  - “算法作业效率提升”：Recharts 填充渐变绿色的 Area 面积图，并以灰色虚线展示标准 Baseline。
  - “Hymala 模型稳定性与延迟”：蓝色折线图显示决策延迟 (ms)，辅以绿色虚线反映成功率 (%)。
- **健康度 KPI**：
  - 右侧面板以大字号醒目展示：成功率 `99.8%`、超时次数 `2次`、决策计算总调用 `14,502次`。
- **二次调度甘特图**：
  - 横向时间轴刻度（0 ~ 100分钟，以 `13:04` 起点进行时间换算）。
  - 胶囊块精确定位：`startEpoch` 转化为 CSS `left` 百分比，`durationSeconds` 转化为 `width` 百分比。
  - 颜色对齐：“耳轴换介” (Orange)、“等待复位” (Yellow)、“重选退出” (Teal)、“避让锁死” (Red)。
  - 点击任一胶囊块，右侧详情卡片展示冲突原因描述与 Hymala 生成的二次调度避让决策方案。

---

### 5. 能源与碳排页 (Page 4 - Energy.tsx)
- **单箱堆叠进度条**：
  - “单箱能耗结构”、“单箱综合成本结构”、“单箱碳排放分布”。
  - 各类设备 (QC、AGV、YC、外来集卡) 按照柴油（橙色）、火电（灰色）与绿电（绿色）的配比以多段堆叠展示；外来集卡按照 gap spec 进行空态与 mock 标示。
- **趋势分析**：
  - “总能耗变化趋势”与“传统电力 vs 绿电配比与占比”。
- **分时避峰表**：
  - 左侧展示极具工业美感的避峰率 KPI `42%`、节约电费 `1330元`；右侧展示六个时段（谷/峰/平）的用电量及电费对照。
- **百公里能耗表**：
  - 详细罗列 T101 ~ T106 的电耗、成本和碳排，辅以绿色向下箭头（代表节能）或红色向上箭头。

---

## 编译与打包验证 (Compilation & Build Verification)

在 `ems-frontend` 目录下对 TypeScript 模块和 Production Bundle 进行验证，编译成功：

```bash
> tsc -b && vite build

vite v8.0.14 building client environment for production...
transforming...✓ 633 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.46 kB │ gzip:   0.29 kB
dist/assets/index-BsxYvopR.css    8.96 kB │ gzip:   2.41 kB
dist/assets/index-phnsKV9N.js   686.61 kB │ gzip: 200.18 kB

✓ built in 252ms
```

### 降级防错机制 (Fallback & Decoupling Strategy)
`apiClient.ts` 中拦截器已配置妥当：
1. 优先通过代理请求真实后端接口 `http://10.105.64.36:20003/api`。
2. 一旦检测到网络异常或接口不通（404/连接拒绝/超时），将自动回退到 `src/mocks/fixtures.ts` 中 100% 贴合原型指标的 Mock 数据包，保障前端完整交互畅通运行，满足原型还原演练。

## 提交清单 (Delivery Files)

- 页面组件：
  - [Efficiency.tsx](file:///C:/Antigravity/EMS/ems-frontend/src/pages/Efficiency.tsx)
  - [Network.tsx](file:///C:/Antigravity/EMS/ems-frontend/src/pages/Network.tsx)
  - [Dispatch.tsx](file:///C:/Antigravity/EMS/ems-frontend/src/pages/Dispatch.tsx)
  - [Energy.tsx](file:///C:/Antigravity/EMS/ems-frontend/src/pages/Energy.tsx)
- 全局主框架：
  - [App.tsx](file:///C:/Antigravity/EMS/ems-frontend/src/App.tsx)
- 接口与数据适配器：
  - [apiClient.ts](file:///C:/Antigravity/EMS/ems-frontend/src/services/apiClient.ts)
  - [fixtures.ts](file:///C:/Antigravity/EMS/ems-frontend/src/mocks/fixtures.ts)
