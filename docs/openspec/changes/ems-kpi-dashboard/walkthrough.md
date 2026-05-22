# EMS KPI 前端开发 Walkthrough

## 当前实现状态

已在 `ems-frontend/` 下实现首版 React + Vite + TypeScript 前端页面。当前版本以本地 fixtures / 静态数据驱动四个页面，优先保证原型视觉和交互流程可演示，暂不阻塞于真实后端接口。

## 已实现页面

- **作业效率**：顶部作业统计、能耗/效率/设备统计、右侧双折线图、底部岸桥/场桥/等待时间图表。
- **关系网**：SVG 点阵拓扑画布、车辆/QC/RTG/Block/船舶/充换电节点、连线高亮、图例与节点信息浮层。
- **调度分析**：算法效率提升曲线、Hymala 稳定性曲线、服务指标卡、二次调度时间轴。
- **能源与碳排**：单箱能耗/成本/碳排堆叠条、能耗趋势、传统电力 vs 绿电、分时电价表、百公里能耗表。

## 已实现交互

- 顶部四个页签切换。
- 时间筛选分段控件、查询、重置。
- 图表 tooltip。
- 关系网节点 hover/click、图例展开。
- 调度时间轴事件 hover/click 视觉反馈。
- 表格行 hover 与涨跌颜色。

## 验证结果

在 `ems-frontend` 目录已通过：

```bash
npm run typecheck
npm run build
npm run lint
```

构建存在 Recharts 相关 chunk size warning，但不影响运行。后续如需优化，可按页面做动态 import 拆包。

## 仍待完成

- 使用浏览器对四张原型进行逐页截图比对和 CSS 微调。
- 将页面 fixtures 拆分为独立 mock/service 模块。
- 按真实后端接口补齐 `apiClient` 与 fallback 策略。
