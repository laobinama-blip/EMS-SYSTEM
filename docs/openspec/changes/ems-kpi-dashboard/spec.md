# EMS KPI Dashboard Spec

## Requirement 1: 应用框架
系统 MUST 以 React 前端和 Node/Express 后端分离运行。

### Acceptance
- Given 后端服务已启动 When 前端请求 `/api/kpi/*` Then 数据必须来自 HTTP 接口而不是组件内硬编码。
- Given 用户点击顶部导航 When 切换页面 Then 当前页面内容和导航选中态必须同步更新。

## Requirement 2: 全局筛选
系统 MUST 提供 2h、8h、1天、3天、7天、自定义时间筛选和查询/重置按钮。

### Acceptance
- Given 用户选择不同时间范围 When 点击查询 Then 当前页面刷新数据并保持选中态。
- Given 用户点击重置 Then 时间范围回到 1天，设备筛选回到全部。

## Requirement 3: 作业效率页
系统 MUST 展示原型中的作业统计、能耗、效率、设备和 5 张趋势/柱状图。

### Acceptance
- Given 用户进入作业效率页 Then 可看到全部作业统计、能耗、效率和设备分组。
- Given 后端返回图表数据 Then 折线/柱状图必须展示调度前后对比。

## Requirement 4: 关系网页
系统 MUST 展示关系网络画布，包含车辆、岸桥、场桥、区块、船舶、换电站和充电桩节点。

### Acceptance
- Given 用户进入关系网页 Then 关系图应在大画布内显示节点与连线。
- Given 用户悬停或点击节点 Then 节点应有可感知的状态反馈。

## Requirement 5: 调度分析页
系统 MUST 展示算法效率提升、Hymala 稳定性和二次调度事件时间轴。

### Acceptance
- Given 用户进入调度分析页 Then 应看到两张主曲线、一组指标卡和横向时间轴。
- Given 事件数据存在 Then 时间轴应按时间位置展示事件标签。

## Requirement 6: 能源与碳排页
系统 MUST 对齐已提供能源接口文档，并展示单箱能耗/成本/碳排、能耗趋势、传统电力 vs 绿电、分时电价和百公里能耗表。

### Acceptance
- Given 后端提供 `/api/kpi/energy/single-box-energy-statistics` When 页面加载 Then 单箱能耗结构应展示 QC、水平运输、YC、外集卡四段。
- Given 后端提供 `/api/kpi/energy/energy-trend` When 页面加载 Then 页面应展示调度前后曲线；若真实接口未扩展，mock adapter 必须注明兼容字段。
- Given 后端提供 `/api/kpi/energy/vehicle-energy-per-100km` When 页面加载 Then 表格应展示设备、能耗、成本、碳排数据。

## Requirement 7: Harness 质量门禁
系统 MUST 提供可重复验证命令。

### Acceptance
- Given 开发完成 When 运行 `npm run typecheck` Then 前后端 TypeScript 检查通过。
- Given 开发完成 When 运行 `npm run build` Then 前端生产构建通过。
- Given 服务启动 When 浏览器打开页面 Then 四个导航页面可见且无空白主界面。
