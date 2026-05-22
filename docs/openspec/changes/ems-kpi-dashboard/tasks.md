# EMS KPI 看板开发任务清单 (Tasks)

- [x] **T1: 原型与接口文档调研分析**
  - [x] 阅读并分析四张高保真设计图。
  - [x] 解析《02_第三页_能源与碳排接口与表结构梳理.md》，掌握接口、表结构、字段含义与计算公式。

- [x] **T2: 缺口分析与规格合并**
  - [x] 制定页面与 API 接口对应矩阵。
  - [x] 明确作业效率、关系网、调度分析等页面的缺失接口。
  - [x] 将 Proposal、Spec、Plan、Harness Gates 等文档上传至 GitHub。

- [x] **T3: 最新方案复核**
  - [x] 基于 GitHub 最新文档重新复核方案。
  - [x] 修正深色 glassmorphism 与原型浅色界面冲突的问题。
  - [x] 修正工程目录、API 数量、返回结构兼容策略等落地风险。
  - [x] 增补前端高保真设计门禁。

- [x] **T4: API 契约与标准设计**
  - [x] 在仓库根目录编写 `openapi.yaml`。
  - [x] 覆盖官方 10 个能源接口和新增 mock/扩展接口。
  - [x] 标注 `energy-trend`、`vehicle-energy-per-100km` 中调度前后字段为 EMS 看板扩展字段。
  - [x] 明确 mock envelope `{ code, message, data }` 与真实接口 direct body 的前端兼容策略。

- [x] **T4.5: 前端高保真与交互规范补充**
  - [x] 新增 `frontend-fidelity-spec.md`，逐页定义视觉布局、组件细节和交互流程。
  - [x] 明确当前阶段先不依赖接口，优先用 fixtures 保证四页完整还原。
  - [x] 明确用户确认文档前不进入前端编码实现。

- [ ] **T5: 前端工程骨架搭建**
  - [ ] 等待用户确认文档后再开始。
  - [ ] 从 GitHub `main` 分支重新 clone/pull，作为唯一开发基准。
  - [ ] 创建 `ems-frontend` (Vite/React/TypeScript)。
  - [ ] 配置 TypeScript、基础脚本、Recharts、Axios 或 Fetch 封装等依赖。
  - [ ] 配置 Vite proxy，将 `/api` 指向 `http://10.105.64.36:20003/api`。

- [ ] **T6: 前端接口适配与 mock 数据源**
  - [ ] 实现 `apiClient`，兼容真实接口 direct body 与 mock envelope `{ code, message, data }`。
  - [ ] 优先接入 `/api/kpi/energy/*` 真实接口。
  - [ ] 为 common、efficiency、network、dispatch、time-of-use-electricity 和调度前后对比字段提供前端 fixtures。
  - [ ] 对官方文档中 `externalTruck` 当前固定空数组的问题进行 mock 标注。

- [ ] **T7: 前端全局框架与基础组件**
  - [ ] 严格按 `frontend-fidelity-spec.md` 建立 design tokens。
  - [ ] 编写贴近原型的浅色设计系统，不使用深色 glassmorphism 主题。
  - [ ] 实现 `AppShell` 顶部导航、告警胶囊、通知按钮和头像。
  - [ ] 实现 `FilterBar`，支持快捷时间、自定义时间、设备筛选、查询和重置。
  - [ ] 实现复用卡片、指标栅格、折线图、柱状图、拓扑图和事件时间轴组件。

- [ ] **T8: 四个看板视图开发**
  - [ ] 作业效率：作业统计、能耗、效率、设备模块和 5 张图表。
  - [ ] 关系网：SVG 拓扑画布，节点和连线支持悬停/点击反馈。
  - [ ] 调度分析：算法效率、Hymala 稳定性和二次调度事件时间轴。
  - [ ] 能源与碳排：单箱能耗/成本/碳排、趋势、传统电力 vs 绿电、分时电价、百公里能耗表。

- [ ] **T9: 高保真视觉验收**
  - [ ] 使用 1920px 视口分别截取四个页面浏览器截图。
  - [ ] 与 `EMS1.png`、`EMS2.png`、`EMS3.png`、`EMS4.png` 逐页对比。
  - [ ] 输出视觉差异清单，每页至少覆盖 8 个核对点：布局、背景、顶部栏、筛选条、卡片、字体、图表/画布/表格、交互状态。
  - [ ] 逐项验证页签切换、筛选查询、重置、下拉、图表 hover、拓扑节点 hover/click、图例展开、时间轴事件 hover/click、表格 hover。
  - [ ] 修复所有明显偏差：布局漂移、颜色不符、文本溢出、卡片比例失真、图表样式不符、关键模块缺失。

- [ ] **T10: Harness Gate 验证与上传**
  - [ ] 前端 `npm run typecheck` 通过。
  - [ ] 前端 `npm run build` 通过。
  - [ ] 启动前端并完成运行时烟雾测试。
  - [ ] 验证 `/api/kpi/energy/*` 真实接口可调用；不可调用时前端展示 mock/empty 状态且不阻塞页面。
  - [ ] 完成后将代码、文档、验证结论同步提交至 GitHub。
