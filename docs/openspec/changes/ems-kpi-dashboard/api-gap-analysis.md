# 页面与接口对应分析

## 已提供接口覆盖

| 原型页面 | 模块 | 已有接口 | 覆盖情况 |
| --- | --- | --- | --- |
| 能源与碳排 | 设备类型/设备下拉 | `GET /api/kpi/energy/device-types`, `GET /api/kpi/energy/devices` | 可覆盖 |
| 能源与碳排 | 单箱能耗 | `GET /api/kpi/energy/single-box-energy-statistics` | 基本覆盖，但外集卡固定空数组与原型有值不一致 |
| 能源与碳排 | 单箱综合成本 | `GET /api/kpi/energy/single-box-energy-cost` | 基本覆盖 |
| 能源与碳排 | 单箱综合碳排 | `GET /api/kpi/energy/carbon-emission-distribution` | 基本覆盖 |
| 能源与碳排 | 能耗趋势 | `GET /api/kpi/energy/energy-trend` | 部分覆盖，原型需要“调度前/调度后”双序列，文档只定义单序列总能耗/均值 |
| 能源与碳排 | 传统电力 vs 绿电 | `GET /api/kpi/energy/traditional-vs-green-power` | 可覆盖 |
| 能源与碳排 | 单车百公里能耗表 | `GET /api/kpi/energy/vehicle-energy-per-100km` | 部分覆盖，原型需要能耗/成本/碳排的调度前后列，文档仅返回单值 |

## 明确缺失接口

| 原型页面 | 缺失模块 | 建议接口 |
| --- | --- | --- |
| 全局 | 顶部 QC301 告警、通知、用户头像/会话 | `GET /api/kpi/common/header-status` |
| 作业效率 | 全部作业统计、装船/卸船/转堆/未知任务统计 | `GET /api/kpi/efficiency/work-summary` |
| 作业效率 | 能耗、效率、设备统计汇总 | `GET /api/kpi/efficiency/summary-cards` |
| 作业效率 | 车辆平均效率、车辆平均空驶率、岸桥效率、场桥效率、车辆平均等待时间 | `GET /api/kpi/efficiency/charts` |
| 关系网 | 设备/区块/岸桥/场桥/车辆/充电桩/换电站节点和边 | `GET /api/kpi/network/topology` |
| 调度分析 | 算法效率提升对比曲线和算法统计卡 | `GET /api/kpi/dispatch/algorithm-efficiency` |
| 调度分析 | Hymala 稳定性响应曲线、成功率、延迟、调用数、超时率 | `GET /api/kpi/dispatch/hymala-stability` |
| 调度分析 | 二次调度时间轴事件 | `GET /api/kpi/dispatch/secondary-events` |
| 能源与碳排 | 分时电价统计和时段表 | `GET /api/kpi/energy/time-of-use-electricity` |
| 能源与碳排 | 能耗趋势调度前后对比 | 建议扩展 `energy-trend` 返回 `beforeEnergyConsumption`、`afterEnergyConsumption` |
| 能源与碳排 | 百公里能耗调度前后对比 | 建议扩展 `vehicle-energy-per-100km` 返回 before/after 子对象 |

## 本阶段处理方式
- 后端 mock 暂时补齐缺失接口，前端只依赖服务层类型。
- 已有能源接口保留文档原路径，mock 中兼容原字段和前端展示字段。
- 在真实后端补齐前，缺失接口不得标记为生产可用。
