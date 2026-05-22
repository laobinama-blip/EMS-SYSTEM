# EMS KPI 看板开发任务清单 (Tasks)

- [x] **T1: 原型与接口文档调研分析**
  - [x] 阅读并分析四张高保真设计图。
  - [x] 解析《02_第三页_能源与碳排接口与表结构梳理.md》，掌握接口、表结构、字段含义与计算公式。

- [x] **T2: 缺口分析与规格合并**
  - [x] 制定页面与 API 接口对应矩阵。
  - [x] 明确作业效率、关系网、调度分析等页面的缺失接口。
  - [x] 将 Proposal、Spec、Plan、Harness Gates 等文档上传至 GitHub。

- [x] **T3: 最新方案复核与视觉基准对齐**
  - [x] 基于 GitHub 最新文档重新复核方案。
  - [x] 修正深色 glassmorphism 与原型浅色界面冲突的问题。
  - [x] 复制 `EMS1.png` - `EMS4.png` 到本地 Artifact 目录，作为最终高保真对齐源。
  - [x] 增补前端高保真设计门禁。

- [x] **T4: API 契约与标准设计**
  - [x] 在仓库根目录编写 `openapi.yaml`。
  - [x] 覆盖官方 10 个能源接口和新增 mock/扩展接口。
  - [x] 明确 mock envelope `{ code, message, data }` 与真实接口 direct body 的前端兼容策略。

- [x] **T4.5: 前端高保真与交互规范补充**
  - [x] 新增 `frontend-fidelity-spec.md`，逐页定义视觉布局、组件细节和交互流程。
  - [x] 明确当前阶段先不依赖接口，优先用 fixtures 保证四页完整还原。

- [/] **T5: 前端工程骨架搭建**
  - [x] 从 GitHub `main` 分支重新 clone/pull，作为唯一开发基准。
  - [x] 创建 `ems-frontend` (Vite/React/TypeScript) 项目骨架。
  - [x] 配置 TypeScript、基础脚本、Recharts、Axios 或 Fetch 封装等依赖。
  - [x] 配置 Vite proxy，将 `/api` 指向 `http://10.105.64.36:20003/api`。
  - [x] 实现并编写全局布局筛选栏 `FilterBar.tsx`。

- [/] **T6: 前端接口适配与 mock 数据源**
  - [x] 实现 `apiClient`，兼容真实接口 direct body 与 mock envelope `{ code, message, data }`。
  - [x] 优先接入 `/api/kpi/energy/*` 真实接口。
  - [x] 为 common、efficiency、network、dispatch、time-of-use-electricity 和调度前后对比字段提供前端 fixtures。
  - [x] 对官方文档中 `externalTruck` 当前固定空数组的问题进行 mock 标示。

- [ ] **T7: 前端全局框架与基础组件**
  - [ ] 严格按 `frontend-fidelity-spec.md` 建立 design tokens。
  - [ ] 编写贴近原型的浅色设计系统，不使用深色 glassmorphism 主题。
  - [ ] 实现 `AppShell` 顶部导航、告警胶囊、通知按钮和头像。

- [/] **T8: 四个看板视图开发**
  - [/] 作业效率：实现作业统计、能耗、效率、设备模块和 5 张折线/柱状图表。
  - [ ] 关系网：SVG 拓扑画布，节点和连线支持悬停/点击反馈。
  - [ ] 调度分析：算法效率、Hymala 稳定性和二次调度事件时间轴。
  - [ ] 能源与碳排：单箱能耗/成本/碳排、趋势、传统电力 vs 绿电、分时电价、百公里能耗表。

- [ ] **T9: 高保真视觉门禁截图比对**
  - [ ] 浏览器截图与 `EMS1.png` - `EMS4.png` 进行对照。
  - [ ] 输出差异清单，每页至少覆盖 8 个核对点，并逐项微调 CSS 边距、颜色和字重，确保 100% 贴合原型。

- [ ] **T10: 最终编译构建与交付验证**
  - [ ] 前端 `npm run typecheck` 与 `npm run build` 成功通过。
  - [ ] 启动前端并进行运行时烟雾测试，验证真实接口降级逻辑。
  - [ ] 将完整代码与 walkthrough 报告 Push 并归档。
