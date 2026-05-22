# EMS KPI 看板接口缺口与映射分析 (API Gap Analysis)

本文件详细梳理了监控看板前端原型页面与后端 API 接口的对应关系，识别出缺失接口，并设计了数据结构，以在 mock 服务中填补这些缺口。

---

## 1. 页面与接口对应矩阵 (覆盖 4 个原型页面)

| 页面 / 页签 | 模块 / 组件 | 关联 API 接口 | 覆盖状态 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **全局导航外壳** | 顶部 KPI 警报、未读消息、用户头像会话 | `GET /api/kpi/common/header-status` | **缺失 (MISSING)** | 提供“QC301 效率告警”等全局动态状态。 |
| **作业效率** | 作业汇总数据（TEU、自然箱、集卡循环、箱长） | `GET /api/kpi/efficiency/work-summary` | **缺失 (MISSING)** | 聚合 2h/8h/1d/3d/7d 的分类作业数据。 |
| **作业效率** | KPI 汇总卡片（能耗、效率、设备） | `GET /api/kpi/efficiency/summary-cards` | **缺失 (MISSING)** | 汇总平均成本、作业单价、在线设备数。 |
| **作业效率** | 车辆平均效率、空驶率、岸桥/场桥效率、等待图表 | `GET /api/kpi/efficiency/charts` | **缺失 (MISSING)** | 提供调度前后双序列时序数据。 |
| **关系网** | 拓扑图画布（岸桥、场桥、车辆、充换电站等） | `GET /api/kpi/network/topology` | **缺失 (MISSING)** | 返回拓扑网络节点 (Nodes) 与连线 (Edges) 及状态。 |
| **调度分析** | “算法效率提升”对比曲线与统计卡 | `GET /api/kpi/dispatch/algorithm-efficiency` | **缺失 (MISSING)** | 算法带来的效率提升百分比及关键统计指标。 |
| **调度分析** | “Hymala 世界模型稳定性”趋势与指标 | `GET /api/kpi/dispatch/hymala-stability` | **缺失 (MISSING)** | 包含成功率、调用时延、调用数、超时率。 |
| **调度分析** | “二次调度分析”横向时间轴甘特图 | `GET /api/kpi/dispatch/secondary-events` | **缺失 (MISSING)** | 事件列表，包含发生时刻、设备、任务和原因。 |
| **能源与碳排** | 顶部过滤下拉选择框 | `GET /api/kpi/energy/device-types`<br>`GET /api/kpi/energy/devices` | **已覆盖** | 静态设备类型与基于快照去重得到的设备编码。 |
| **能源与碳排** | 单箱能耗（3.517 kWh/TEU 柱状细分） | `GET /api/kpi/energy/single-box-energy-statistics` | **已覆盖** | 依赖事实表，外集卡数据固定为空数组。 |
| **能源与碳排** | 单箱综合成本（2.473 RMB/TEU 细分） | `GET /api/kpi/energy/single-box-energy-cost` | **已覆盖** | 单箱能耗乘单价配置。 |
| **能源与碳排** | 单箱综合碳排（3.285 tCO2/TEU 细分） | `GET /api/kpi/energy/carbon-emission-distribution` | **已覆盖** | 单箱能耗乘碳排系数配置。 |
| **能源与碳排** | 能耗趋势（24h 调度前/后对比线） | `GET /api/kpi/energy/energy-trend` | **存在缺口 (GAP)** | 原文档仅有单序列，需要扩展为调度前/后双序列。 |
| **能源与碳排** | 传统电力 vs 绿电趋势及比例 | `GET /api/kpi/energy/traditional-vs-green-power` | **已覆盖** | 基于画像的绿能标识对齐聚合。 |
| **能源与碳排** | 分时电价统计与时段能耗分析表 | `GET /api/kpi/energy/time-of-use-electricity` | **缺失 (MISSING)** | 展示避峰率及 6 个时间段的对比。 |
| **能源与碳排** | 单车百公里能耗表 | `GET /api/kpi/energy/vehicle-energy-per-100km` | **存在缺口 (GAP)** | 原文档仅定义单序列，需要扩展为调度前/后对比。 |

---

## 2. 关键缺失接口与缺口设计

### 缺口 1: 分时电价接口 (`GET /api/kpi/energy/time-of-use-electricity`)
* **界面需求**：显示“调度前电费”(RMB)、“调度后电费”(RMB)、“节省金额”(RMB)、“百公里平均电价”(RMB/100km)、“避峰率”(%)。下方展示 6 个分时时段的电量与电费对比列表：`00:00-02:00`、`02:00-06:00`、`06:00-12:00`、`12:00-18:00`、`18:00-22:00`、`22:00-24:00`。
* **数据结构响应示例**：
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "kpis": {
      "beforeDispatchCost": 6351.0,
      "afterDispatchCost": 5021.0,
      "savingsAmount": 1330.0,
      "averagePricePer100km": 36.4,
      "peakShiftingRate": 42.0
    },
    "intervals": [
      {
        "timeRange": "00:00-02:00",
        "beforeDispatchKwh": 1112.0,
        "afterDispatchKwh": 946.0,
        "beforeDispatchCost": 444.8,
        "afterDispatchCost": 378.4
      },
      {
        "timeRange": "02:00-06:00",
        "beforeDispatchKwh": 3688.0,
        "afterDispatchKwh": 3120.0,
        "beforeDispatchCost": 1475.2,
        "afterDispatchCost": 1248.0
      },
      {
        "timeRange": "06:00-12:00",
        "beforeDispatchKwh": 3256.0,
        "afterDispatchKwh": 1200.0,
        "beforeDispatchCost": 3907.2,
        "afterDispatchCost": 1440.0
      },
      {
        "timeRange": "12:00-18:00",
        "beforeDispatchKwh": 4512.0,
        "afterDispatchKwh": 2744.0,
        "beforeDispatchCost": 5414.4,
        "afterDispatchCost": 3292.8
      },
      {
        "timeRange": "18:00-22:00",
        "beforeDispatchKwh": 3256.0,
        "afterDispatchKwh": 3100.0,
        "beforeDispatchCost": 2604.8,
        "afterDispatchCost": 2480.0
      },
      {
        "timeRange": "22:00-24:00",
        "beforeDispatchKwh": 1196.0,
        "afterDispatchKwh": 908.0,
        "beforeDispatchCost": 478.4,
        "afterDispatchCost": 363.2
      }
    ]
  }
}
```

### 缺口 2: 能耗趋势扩展 (`GET /api/kpi/energy/energy-trend`)
* **界面需求**：线图展示随时间（天或小时）变化的“调度前”与“调度后”两个趋势。
* **扩展数据结构示例**：
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "statTime": "2026-05-21 00:00:00",
      "beforeDispatchEnergy": 55.4,
      "afterDispatchEnergy": 51.2
    },
    {
      "statTime": "2026-05-21 02:00:00",
      "beforeDispatchEnergy": 48.1,
      "afterDispatchEnergy": 42.6
    }
  ]
}
```

### 缺口 3: 单车百公里能耗扩展 (`GET /api/kpi/energy/vehicle-energy-per-100km`)
* **界面需求**：表格展示每台车辆在调度前 vs 调度后的百公里能耗 (kWh/100km)、百公里成本 (RMB/100km)、百公里碳排 (kgCO2/100km) 数据对比。
* **扩展数据结构示例**：
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "deviceCode": "T001",
      "energy": {
        "beforeDispatch": 32.4,
        "afterDispatch": 28.1
      },
      "cost": {
        "beforeDispatch": 25.9,
        "afterDispatch": 18.5
      },
      "carbonEmission": {
        "beforeDispatch": 17.1,
        "afterDispatch": 14.8
      }
    }
  ]
}
```

---

## 3. 本地 Mock 服务设计策略

为了在没有生产库的环境中确保计算合理性，后端服务将构建完整的内存数据库状态机：
1. **PostgreSQL 仿真**：模拟真实的 WI 数据库快照 `kpi_work_instruction_snapshot` 以及事实表 `kpi_work_instruction_energy_fact`，并在接口调用时执行仿真 SQL 式聚合。
2. **InfluxDB 时序仿真**：针对 `fms_vehicle_chassis` 进行累加器的时序递增模拟，提供合理的百公里能耗计算基准。
3. **计算公式绑定**：
   - **能耗成本** = 能耗值 × 对应价格
     - 电价：`0.80 RMB/kWh` (分时电价区间详见 Implementation Plan)
     - 柴油：`7.50 RMB/L`
   - **碳排放** = 能耗值 × 碳排系数
     - 电力系数：`0.527 kgCO2/kWh`
     - 柴油系数：`2.63 kgCO2/L`
4. **无缝替换**：前端统一基于 Axios 请求工具 `apiClient.ts` 发起请求，并在后台将请求代理到 Node 端口 `20003`。后续只需替换 baseUrl 即可切入真实生产服务。
