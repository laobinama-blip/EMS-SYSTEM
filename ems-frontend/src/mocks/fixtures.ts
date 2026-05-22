// High-Fidelity Mock Data Fixtures for EMS KPI Dashboard
// These fixtures match the exact specifications and numbers from the wireframes.

export interface HeaderStatus {
  alertMessage: string | null;
  notificationCount: number;
  user: {
    username: string;
    role: string;
  };
}

export interface EfficiencyGroup {
  teu: number;
  naturalBox: number;
  vehicleLoops: number;
  boxRatio: {
    twentyFeet: number; // in %
    fortyFeet: number;  // in %
    fortyFiveFeet: number; // in %
  };
}

export interface WorkSummary {
  total: EfficiencyGroup;
  loading: EfficiencyGroup;
  unloading: EfficiencyGroup;
  transfer: EfficiencyGroup;
}

export interface SummaryCards {
  averageCost: number;
  operationUnitPrice: number;
  onlineEquipmentCount: number;
}

export interface ComparePoint {
  statTime: string;
  beforeDispatch: number;
  afterDispatch: number;
}

export interface EfficiencyCharts {
  vehicleEfficiency: ComparePoint[];
  emptyRunningRate: ComparePoint[];
  qcEfficiency: ComparePoint[];
  ycEfficiency: ComparePoint[];
  vehicleWaitingTime: ComparePoint[];
}

export interface TopologyNode {
  id: string;
  type: 'QC' | 'YC' | 'VEHICLE' | 'BLOCK' | 'SHIP' | 'CHARGING' | 'SWAPPING';
  label: string;
  status: 'active' | 'idle' | 'charging' | 'swapping' | 'alert';
  x: number;
  y: number;
  details?: Record<string, any>;
}

export interface TopologyEdge {
  source: string;
  target: string;
  type: 'solid' | 'dashed' | 'active';
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface AlgorithmEfficiencyPoint {
  statTime: string;
  optimalRate: number;
  standardRate: number;
}

export interface HymalaStability {
  kpis: {
    successRate: number;
    timeoutCount: number;
    totalCalls: number;
  };
  series: {
    statTime: string;
    successRate: number;
    latencyMs: number;
  }[];
}

export interface SecondaryEvent {
  eventId: string;
  eventName: string;
  deviceCode: string;
  startEpoch: number;
  durationSeconds: number;
  status: 'RESOLVED' | 'PENDING';
  description: string;
}

export interface EnergyDetailItem {
  energyType: string;
  energyValue: number;
  energyUnit: string;
}

export interface SingleBoxEnergyStatistics {
  qc: EnergyDetailItem[];
  horizontalTransport: EnergyDetailItem[];
  yc: EnergyDetailItem[];
  externalTruck: EnergyDetailItem[];
}

export interface CostDetailItem {
  energyType: string;
  energyValue: number;
  unitPrice: number;
  energyAmount: number;
}

export interface SingleBoxEnergyCost {
  qc: CostDetailItem[];
  horizontalTransport: CostDetailItem[];
  yc: CostDetailItem[];
  externalTruck: CostDetailItem[];
}

export interface CarbonDetailItem {
  energyType: string;
  energyValue: number;
  carbonFactor: number;
  carbonEmission: number;
}

export interface SingleBoxCarbonEmission {
  qc: CarbonDetailItem[];
  horizontalTransport: CarbonDetailItem[];
  yc: CarbonDetailItem[];
  externalTruck: CarbonDetailItem[];
}

export interface EnergyTrendPoint {
  statTime: string;
  beforeDispatchEnergy: number;
  afterDispatchEnergy: number;
  totalEnergyConsumption: number;
  averageEnergyConsumption: number;
}

export interface EnergyRankingItem {
  deviceCode: string;
  totalEnergyConsumption: number;
  averageUsageDuration: number;
  greenEnergyRate: number;
}

export interface DeviceEnergyRatioDetails {
  deviceCode: string;
  energyType: string;
  energyConsumption: number;
}

export interface DeviceEnergyRatioItem {
  deviceType: string;
  deviceEnergyRate: number;
  deviceEnergyDetails: DeviceEnergyRatioDetails[];
}

export interface TraditionalVsGreenPoint {
  statTime: string;
  traditionalPower: number;
  greenPower: number;
  greenEnergyRate: number;
}

export interface TimeOfUseElectricity {
  kpis: {
    beforeDispatchCost: number;
    afterDispatchCost: number;
    savingsAmount: number;
    averagePricePer100km: number;
    peakShiftingRate: number;
  };
  intervals: {
    timeRange: string;
    beforeDispatchKwh: number;
    afterDispatchKwh: number;
    beforeDispatchCost: number;
    afterDispatchCost: number;
  }[];
}

export interface VehicleEnergyItem {
  deviceCode: string;
  energy: {
    beforeDispatch: number;
    afterDispatch: number;
  };
  cost: {
    beforeDispatch: number;
    afterDispatch: number;
  };
  carbonEmission: {
    beforeDispatch: number;
    afterDispatch: number;
  };
}

// ==========================================
// FIXTURE DATA INSTANCES
// ==========================================

export const HEADER_STATUS: HeaderStatus = {
  alertMessage: 'QC301效率 25.4箱/h，低于阈值30箱/h',
  notificationCount: 3,
  user: {
    username: 'Reewell Operator',
    role: 'SYS_ADMIN'
  }
};

export const WORK_SUMMARY: WorkSummary = {
  total: {
    teu: 4852,
    naturalBox: 3882,
    vehicleLoops: 1250,
    boxRatio: { twentyFeet: 25, fortyFeet: 60, fortyFiveFeet: 15 }
  },
  loading: {
    teu: 1940,
    naturalBox: 1552,
    vehicleLoops: 500,
    boxRatio: { twentyFeet: 20, fortyFeet: 70, fortyFiveFeet: 10 }
  },
  unloading: {
    teu: 2426,
    naturalBox: 1941,
    vehicleLoops: 625,
    boxRatio: { twentyFeet: 30, fortyFeet: 50, fortyFiveFeet: 20 }
  },
  transfer: {
    teu: 486,
    naturalBox: 389,
    vehicleLoops: 125,
    boxRatio: { twentyFeet: 25, fortyFeet: 60, fortyFiveFeet: 15 }
  }
};

export const SUMMARY_CARDS: SummaryCards = {
  averageCost: 2.47,
  operationUnitPrice: 12.50,
  onlineEquipmentCount: 45
};

const createCompareSeries = (
  baseBefore: number,
  baseAfter: number,
  noiseScale: number,
  isPercentage = false
): ComparePoint[] => {
  const times = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  return times.map((time, index) => {
    const factor = 1 + Math.sin(index) * 0.15;
    let before = baseBefore * factor + (Math.random() - 0.5) * noiseScale;
    let after = baseAfter * factor + (Math.random() - 0.5) * noiseScale;
    if (isPercentage) {
      before = Math.max(0, Math.min(100, before));
      after = Math.max(0, Math.min(100, after));
    } else {
      before = Math.max(0, before);
      after = Math.max(0, after);
    }
    return {
      statTime: time,
      beforeDispatch: parseFloat(before.toFixed(1)),
      afterDispatch: parseFloat(after.toFixed(1))
    };
  });
};

export const EFFICIENCY_CHARTS: EfficiencyCharts = {
  vehicleEfficiency: createCompareSeries(22, 30, 2),
  emptyRunningRate: createCompareSeries(42, 20, 3, true),
  qcEfficiency: createCompareSeries(24, 30, 2),
  ycEfficiency: createCompareSeries(20, 26, 1.5),
  vehicleWaitingTime: createCompareSeries(22, 9, 2)
};

export const TOPOLOGY_DATA: TopologyData = {
  nodes: [
    { id: 'ship1', type: 'SHIP', label: '船舶 01 (中远海运)', status: 'active', x: 120, y: 350, details: { berthingTime: '2026-05-22 06:00', estDeparture: '2026-05-23 18:00', status: '作业中' } },
    { id: 'qc301', type: 'QC', label: 'QC301', status: 'alert', x: 350, y: 220, details: { currentTask: '卸船装车', efficiency: '25.4箱/h', status: '效率偏低告警' } },
    { id: 'qc302', type: 'QC', label: 'QC302', status: 'active', x: 350, y: 480, details: { currentTask: '装船卸车', efficiency: '32.1箱/h', status: '正常作业' } },
    { id: 'v101', type: 'VEHICLE', label: 'T101', status: 'active', x: 600, y: 160, details: { power: '78%', task: 'QC301 -> Block A', status: '重载行驶' } },
    { id: 'v102', type: 'VEHICLE', label: 'T102', status: 'active', x: 600, y: 280, details: { power: '62%', task: 'Block B -> QC301', status: '空载行驶' } },
    { id: 'v103', type: 'VEHICLE', label: 'T103', status: 'charging', x: 600, y: 420, details: { power: '24%', task: '前往充换电', status: '充电中' } },
    { id: 'v104', type: 'VEHICLE', label: 'T104', status: 'active', x: 600, y: 540, details: { power: '85%', task: 'QC302 -> Block C', status: '重载行驶' } },
    { id: 'rtg01', type: 'YC', label: 'RTG01', status: 'active', x: 920, y: 220, details: { currentTask: '出场发车', efficiency: '24.5箱/h', status: '正常作业' } },
    { id: 'rtg02', type: 'YC', label: 'RTG02', status: 'active', x: 920, y: 480, details: { currentTask: '进场收车', efficiency: '26.8箱/h', status: '正常作业' } },
    { id: 'blockA', type: 'BLOCK', label: 'Block A (进口箱区)', status: 'active', x: 1180, y: 180, details: { capacity: '64%', boxCount: '1,240 TEU', status: '可作业' } },
    { id: 'blockB', type: 'BLOCK', label: 'Block B (出口箱区)', status: 'active', x: 1180, y: 350, details: { capacity: '42%', boxCount: '850 TEU', status: '可作业' } },
    { id: 'blockC', type: 'BLOCK', label: 'Block C (堆存空箱)', status: 'active', x: 1180, y: 520, details: { capacity: '15%', boxCount: '320 TEU', status: '可作业' } },
    { id: 'charging01', type: 'CHARGING', label: '充电桩 01', status: 'active', x: 1420, y: 160, details: { powerOutput: '120kW', connectedVehicles: 'T103', status: '作业中' } },
    { id: 'swapping01', type: 'SWAPPING', label: '一号换电站', status: 'active', x: 1420, y: 450, details: { batteryCount: '8块可用', currentQueue: '0台', status: '待机就绪' } }
  ],
  edges: [
    { source: 'ship1', target: 'qc301', type: 'solid' },
    { source: 'ship1', target: 'qc302', type: 'solid' },
    { source: 'qc301', target: 'v101', type: 'active' },
    { source: 'qc301', target: 'v102', type: 'active' },
    { source: 'qc302', target: 'v104', type: 'active' },
    { source: 'v101', target: 'rtg01', type: 'solid' },
    { source: 'v104', target: 'rtg02', type: 'solid' },
    { source: 'rtg01', target: 'blockA', type: 'solid' },
    { source: 'rtg02', target: 'blockB', type: 'solid' },
    { source: 'v102', target: 'blockC', type: 'dashed' },
    { source: 'v103', target: 'charging01', type: 'dashed' }
  ]
};

export const ALGORITHM_EFFICIENCY: AlgorithmEfficiencyPoint[] = [
  { statTime: '08:00', optimalRate: 14.2, standardRate: 10.0 },
  { statTime: '09:00', optimalRate: 16.5, standardRate: 10.0 },
  { statTime: '10:00', optimalRate: 18.9, standardRate: 10.0 },
  { statTime: '11:00', optimalRate: 17.4, standardRate: 10.0 },
  { statTime: '12:00', optimalRate: 21.2, standardRate: 10.0 },
  { statTime: '13:00', optimalRate: 22.8, standardRate: 10.0 },
  { statTime: '14:00', optimalRate: 20.5, standardRate: 10.0 },
  { statTime: '15:00', optimalRate: 19.8, standardRate: 10.0 },
  { statTime: '16:00', optimalRate: 22.4, standardRate: 10.0 },
  { statTime: '17:00', optimalRate: 23.5, standardRate: 10.0 }
];

export const HYMALA_STABILITY: HymalaStability = {
  kpis: {
    successRate: 99.8,
    timeoutCount: 2,
    totalCalls: 14502
  },
  series: [
    { statTime: '08:00', successRate: 99.8, latencyMs: 38 },
    { statTime: '09:00', successRate: 99.9, latencyMs: 42 },
    { statTime: '10:00', successRate: 99.7, latencyMs: 48 },
    { statTime: '11:00', successRate: 99.8, latencyMs: 45 },
    { statTime: '12:00', successRate: 99.9, latencyMs: 36 },
    { statTime: '13:00', successRate: 99.8, latencyMs: 34 },
    { statTime: '14:00', successRate: 99.8, latencyMs: 41 },
    { statTime: '15:00', successRate: 99.7, latencyMs: 49 },
    { statTime: '16:00', successRate: 99.9, latencyMs: 37 },
    { statTime: '17:00', successRate: 99.8, latencyMs: 39 }
  ]
};

// Start epoch: 1779416697 corresponds to a fixed timestamp in 2026
const startBase = 1779416697;
export const SECONDARY_EVENTS: SecondaryEvent[] = [
  {
    eventId: 'EV-091',
    eventName: '耳轴换介',
    deviceCode: 'T102',
    startEpoch: startBase + 300,
    durationSeconds: 360,
    status: 'RESOLVED',
    description: '前车避让对位失败，触发二次路由重算，重新计算避让路径。'
  },
  {
    eventId: 'EV-092',
    eventName: '等待复位',
    deviceCode: 'QC301',
    startEpoch: startBase + 1200,
    durationSeconds: 240,
    status: 'RESOLVED',
    description: '起重吊具感应器反馈延迟触发，系统指令集卡就地等待，正在复位。'
  },
  {
    eventId: 'EV-093',
    eventName: '重选退出',
    deviceCode: 'T105',
    startEpoch: startBase + 2100,
    durationSeconds: 180,
    status: 'RESOLVED',
    description: '前车突发暂停作业，堆场道路临时占用，车辆重选路径退出冲突区。'
  },
  {
    eventId: 'EV-094',
    eventName: '避让锁死',
    deviceCode: 'T101',
    startEpoch: startBase + 3200,
    durationSeconds: 400,
    status: 'RESOLVED',
    description: '窄道双向会车发生路径锁死，安全网关下发干预，回退后重新规划。'
  },
  {
    eventId: 'EV-095',
    eventName: '耳轴换介',
    deviceCode: 'T104',
    startEpoch: startBase + 4500,
    durationSeconds: 300,
    status: 'RESOLVED',
    description: '场桥装箱未到位，触发二次路由重算，调整集卡到位顺序。'
  },
  {
    eventId: 'EV-096',
    eventName: '重选退出',
    deviceCode: 'T103',
    startEpoch: startBase + 5400,
    durationSeconds: 200,
    status: 'RESOLVED',
    description: '堆场安全警示区激活，车辆避开当前区块，重选绕行路线。'
  }
];

export const SINGLE_BOX_ENERGY_STATISTICS: SingleBoxEnergyStatistics = {
  qc: [
    { energyType: '柴油', energyValue: 0.0, energyUnit: 'L' },
    { energyType: '火力发电', energyValue: 1.4, energyUnit: 'kWh' },
    { energyType: '绿色电力', energyValue: 2.1, energyUnit: 'kWh' }
  ],
  horizontalTransport: [
    { energyType: '柴油', energyValue: 0.1, energyUnit: 'L' },
    { energyType: '火力发电', energyValue: 0.8, energyUnit: 'kWh' },
    { energyType: '绿色电力', energyValue: 1.2, energyUnit: 'kWh' }
  ],
  yc: [
    { energyType: '柴油', energyValue: 0.0, energyUnit: 'L' },
    { energyType: '火力发电', energyValue: 1.1, energyUnit: 'kWh' },
    { energyType: '绿色电力', energyValue: 1.1, energyUnit: 'kWh' }
  ],
  externalTruck: [] // empty as per official gap spec
};

export const SINGLE_BOX_ENERGY_COST: SingleBoxEnergyCost = {
  qc: [
    { energyType: '柴油', energyValue: 0.0, unitPrice: 7.50, energyAmount: 0.0 },
    { energyType: '火力发电', energyValue: 1.4, unitPrice: 0.80, energyAmount: 1.12 },
    { energyType: '绿色电力', energyValue: 2.1, unitPrice: 0.80, energyAmount: 1.68 }
  ],
  horizontalTransport: [
    { energyType: '柴油', energyValue: 0.1, unitPrice: 7.50, energyAmount: 0.75 },
    { energyType: '火力发电', energyValue: 0.8, unitPrice: 0.80, energyAmount: 0.64 },
    { energyType: '绿色电力', energyValue: 1.2, unitPrice: 0.80, energyAmount: 0.96 }
  ],
  yc: [
    { energyType: '柴油', energyValue: 0.0, unitPrice: 7.50, energyAmount: 0.0 },
    { energyType: '火力发电', energyValue: 1.1, unitPrice: 0.80, energyAmount: 0.88 },
    { energyType: '绿色电力', energyValue: 1.1, unitPrice: 0.80, energyAmount: 0.88 }
  ],
  externalTruck: []
};

export const SINGLE_BOX_CARBON_EMISSION: SingleBoxCarbonEmission = {
  qc: [
    { energyType: '柴油', energyValue: 0.0, carbonFactor: 2.63, carbonEmission: 0.0 },
    { energyType: '火力发电', energyValue: 1.4, carbonFactor: 0.527, carbonEmission: 0.738 },
    { energyType: '绿色电力', energyValue: 2.1, carbonFactor: 0.0, carbonEmission: 0.0 }
  ],
  horizontalTransport: [
    { energyType: '柴油', energyValue: 0.1, carbonFactor: 2.63, carbonEmission: 0.263 },
    { energyType: '火力发电', energyValue: 0.8, carbonFactor: 0.527, carbonEmission: 0.422 },
    { energyType: '绿色电力', energyValue: 1.2, carbonFactor: 0.0, carbonEmission: 0.0 }
  ],
  yc: [
    { energyType: '柴油', energyValue: 0.0, carbonFactor: 2.63, carbonEmission: 0.0 },
    { energyType: '火力发电', energyValue: 1.1, carbonFactor: 0.527, carbonEmission: 0.580 },
    { energyType: '绿色电力', energyValue: 1.1, carbonFactor: 0.0, carbonEmission: 0.0 }
  ],
  externalTruck: []
};

export const ENERGY_TREND: EnergyTrendPoint[] = [
  { statTime: '00:00', beforeDispatchEnergy: 65.4, afterDispatchEnergy: 52.1, totalEnergyConsumption: 52.1, averageEnergyConsumption: 26.0 },
  { statTime: '02:00', beforeDispatchEnergy: 58.1, afterDispatchEnergy: 44.6, totalEnergyConsumption: 44.6, averageEnergyConsumption: 22.3 },
  { statTime: '04:00', beforeDispatchEnergy: 42.4, afterDispatchEnergy: 32.8, totalEnergyConsumption: 32.8, averageEnergyConsumption: 16.4 },
  { statTime: '06:00', beforeDispatchEnergy: 51.5, afterDispatchEnergy: 41.2, totalEnergyConsumption: 41.2, averageEnergyConsumption: 20.6 },
  { statTime: '08:00', beforeDispatchEnergy: 74.2, afterDispatchEnergy: 58.4, totalEnergyConsumption: 58.4, averageEnergyConsumption: 29.2 },
  { statTime: '10:00', beforeDispatchEnergy: 82.5, afterDispatchEnergy: 64.9, totalEnergyConsumption: 64.9, averageEnergyConsumption: 32.45 },
  { statTime: '12:00', beforeDispatchEnergy: 78.9, afterDispatchEnergy: 61.2, totalEnergyConsumption: 61.2, averageEnergyConsumption: 30.6 },
  { statTime: '14:00', beforeDispatchEnergy: 71.3, afterDispatchEnergy: 55.6, totalEnergyConsumption: 55.6, averageEnergyConsumption: 27.8 },
  { statTime: '16:00', beforeDispatchEnergy: 79.4, afterDispatchEnergy: 62.1, totalEnergyConsumption: 62.1, averageEnergyConsumption: 31.05 },
  { statTime: '18:00', beforeDispatchEnergy: 85.6, afterDispatchEnergy: 68.2, totalEnergyConsumption: 68.2, averageEnergyConsumption: 34.1 },
  { statTime: '20:00', beforeDispatchEnergy: 88.2, afterDispatchEnergy: 70.1, totalEnergyConsumption: 70.1, averageEnergyConsumption: 35.05 },
  { statTime: '22:00', beforeDispatchEnergy: 72.1, afterDispatchEnergy: 56.4, totalEnergyConsumption: 56.4, averageEnergyConsumption: 28.2 }
];

export const ENERGY_RANKING: EnergyRankingItem[] = [
  { deviceCode: 'T101', totalEnergyConsumption: 452.1, averageUsageDuration: 12.4, greenEnergyRate: 60.5 },
  { deviceCode: 'T102', totalEnergyConsumption: 412.4, averageUsageDuration: 11.2, greenEnergyRate: 58.2 },
  { deviceCode: 'QC301', totalEnergyConsumption: 388.9, averageUsageDuration: 14.1, greenEnergyRate: 55.4 },
  { deviceCode: 'RTG01', totalEnergyConsumption: 362.5, averageUsageDuration: 10.8, greenEnergyRate: 50.0 },
  { deviceCode: 'T104', totalEnergyConsumption: 342.1, averageUsageDuration: 9.6, greenEnergyRate: 62.0 },
  { deviceCode: 'QC302', totalEnergyConsumption: 322.5, averageUsageDuration: 12.5, greenEnergyRate: 56.2 }
];

export const DEVICE_ENERGY_RATIO: DeviceEnergyRatioItem[] = [
  {
    deviceType: 'VEHICLE',
    deviceEnergyRate: 42.5,
    deviceEnergyDetails: [
      { deviceCode: 'T101', energyType: '绿色电力', energyConsumption: 124.5 },
      { deviceCode: 'T102', energyType: '火力发电', energyConsumption: 98.2 },
      { deviceCode: 'T101', energyType: '柴油', energyConsumption: 15.4 }
    ]
  },
  {
    deviceType: 'QC',
    deviceEnergyRate: 35.0,
    deviceEnergyDetails: [
      { deviceCode: 'QC301', energyType: '绿色电力', energyConsumption: 142.1 },
      { deviceCode: 'QC301', energyType: '火力发电', energyConsumption: 95.4 }
    ]
  },
  {
    deviceType: 'YC',
    deviceEnergyRate: 22.5,
    deviceEnergyDetails: [
      { deviceCode: 'RTG01', energyType: '绿色电力', energyConsumption: 82.5 },
      { deviceCode: 'RTG01', energyType: '火力发电', energyConsumption: 82.5 }
    ]
  }
];

export const TRADITIONAL_VS_GREEN_POWER: TraditionalVsGreenPoint[] = [
  { statTime: '00:00', traditionalPower: 26.0, greenPower: 26.1, greenEnergyRate: 50.1 },
  { statTime: '02:00', traditionalPower: 20.3, greenPower: 24.3, greenEnergyRate: 54.5 },
  { statTime: '04:00', traditionalPower: 13.1, greenPower: 19.7, greenEnergyRate: 60.0 },
  { statTime: '06:00', traditionalPower: 18.5, greenPower: 22.7, greenEnergyRate: 55.1 },
  { statTime: '08:00', traditionalPower: 28.6, greenPower: 29.8, greenEnergyRate: 51.0 },
  { statTime: '10:00', traditionalPower: 31.8, greenPower: 33.1, greenEnergyRate: 51.0 },
  { statTime: '12:00', traditionalPower: 27.5, greenPower: 33.7, greenEnergyRate: 55.1 },
  { statTime: '14:00', traditionalPower: 23.4, greenPower: 32.2, greenEnergyRate: 57.9 },
  { statTime: '16:00', traditionalPower: 26.1, greenPower: 36.0, greenEnergyRate: 58.0 },
  { statTime: '18:00', traditionalPower: 29.3, greenPower: 38.9, greenEnergyRate: 57.0 },
  { statTime: '20:00', traditionalPower: 31.5, greenPower: 38.6, greenEnergyRate: 55.0 },
  { statTime: '22:00', traditionalPower: 25.4, greenPower: 31.0, greenEnergyRate: 55.0 }
];

export const TIME_OF_USE_ELECTRICITY: TimeOfUseElectricity = {
  kpis: {
    beforeDispatchCost: 6351.0,
    afterDispatchCost: 5021.0,
    savingsAmount: 1330.0,
    averagePricePer100km: 36.4,
    peakShiftingRate: 42.0 // 42% cost reduction / peak-shifting efficiency
  },
  intervals: [
    { timeRange: '00:00-02:00', beforeDispatchKwh: 1112.0, afterDispatchKwh: 946.0, beforeDispatchCost: 444.8, afterDispatchCost: 378.4 },
    { timeRange: '02:00-08:00', beforeDispatchKwh: 3688.0, afterDispatchKwh: 3120.0, beforeDispatchCost: 1475.2, afterDispatchCost: 1248.0 },
    { timeRange: '08:00-12:00', beforeDispatchKwh: 3256.0, afterDispatchKwh: 1200.0, beforeDispatchCost: 3907.2, afterDispatchCost: 1440.0 },
    { timeRange: '12:00-18:00', beforeDispatchKwh: 4512.0, afterDispatchKwh: 2744.0, beforeDispatchCost: 5414.4, afterDispatchCost: 3292.8 },
    { timeRange: '18:00-22:00', beforeDispatchKwh: 3256.0, afterDispatchKwh: 3100.0, beforeDispatchCost: 2604.8, afterDispatchCost: 2480.0 },
    { timeRange: '22:00-24:00', beforeDispatchKwh: 1196.0, afterDispatchKwh: 908.0, beforeDispatchCost: 478.4, afterDispatchCost: 363.2 }
  ]
};

export const VEHICLE_ENERGY_PER_100KM: VehicleEnergyItem[] = [
  {
    deviceCode: 'T101',
    energy: { beforeDispatch: 32.4, afterDispatch: 28.1 },
    cost: { beforeDispatch: 25.9, afterDispatch: 18.5 },
    carbonEmission: { beforeDispatch: 17.1, afterDispatch: 14.8 }
  },
  {
    deviceCode: 'T102',
    energy: { beforeDispatch: 34.2, afterDispatch: 29.5 },
    cost: { beforeDispatch: 27.4, afterDispatch: 19.8 },
    carbonEmission: { beforeDispatch: 18.0, afterDispatch: 15.5 }
  },
  {
    deviceCode: 'T103',
    energy: { beforeDispatch: 31.8, afterDispatch: 27.4 },
    cost: { beforeDispatch: 25.4, afterDispatch: 17.9 },
    carbonEmission: { beforeDispatch: 16.8, afterDispatch: 14.4 }
  },
  {
    deviceCode: 'T104',
    energy: { beforeDispatch: 33.6, afterDispatch: 28.8 },
    cost: { beforeDispatch: 26.9, afterDispatch: 19.2 },
    carbonEmission: { beforeDispatch: 17.7, afterDispatch: 15.2 }
  },
  {
    deviceCode: 'T105',
    energy: { beforeDispatch: 35.0, afterDispatch: 30.2 },
    cost: { beforeDispatch: 28.0, afterDispatch: 20.5 },
    carbonEmission: { beforeDispatch: 18.4, afterDispatch: 15.9 }
  },
  {
    deviceCode: 'T106',
    energy: { beforeDispatch: 32.0, afterDispatch: 27.9 },
    cost: { beforeDispatch: 25.6, afterDispatch: 18.2 },
    carbonEmission: { beforeDispatch: 16.9, afterDispatch: 14.7 }
  }
];
