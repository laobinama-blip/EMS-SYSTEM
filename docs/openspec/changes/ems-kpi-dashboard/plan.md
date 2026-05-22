# Implementation Plan

## 架构
- `apps/backend`: Express API adapter，提供 mock 数据和后续真实服务代理入口。
- `apps/frontend`: Vite React 应用，使用服务层请求后端。
- `docs/openspec`: OpenSpec 风格规格、计划、任务和缺口分析。

## 前端组件
- `AppShell`: 顶部品牌、导航、告警、工具按钮。
- `FilterBar`: 时间范围、日期输入、查询、重置。
- `MetricCard`/`SectionCard`: 统一卡片容器。
- `TrendChart`/`BarCompareChart`: 图表基础组件。
- `RelationshipGraph`: 关系网络 SVG 画布。
- 页面组件：`EfficiencyPage`、`NetworkPage`、`DispatchPage`、`EnergyPage`。

## 后端接口
- 能源接口保留文档原路径。
- 缺失接口提供临时 mock 路径并在缺口文档中标记。
- API 响应保持稳定 JSON shape，后续真实后端只替换 service 实现。

## 验证
- `npm run typecheck`
- `npm run build`
- `npm run dev` 后浏览器检查四页。

## Agent 预算
- `max_iterations`: 5
- `max_runtime_minutes`: 90
- `max_cost_usd`: local/unmetered
