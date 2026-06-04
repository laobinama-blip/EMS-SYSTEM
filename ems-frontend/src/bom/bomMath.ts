import { backupStorage, gpuAccelerator, vehicleTiers, type BomTier, type VehicleLimit } from './bomData'

export type BomOptions = {
  vehicleLimit: VehicleLimit
  highAvailability: boolean
  backupStorage: boolean
  gpuAcceleration: boolean
  supportYears: 1 | 2 | 3
}

export type BomLine = {
  id: string
  category: 'server' | 'storage' | 'network' | 'service'
  name: string
  model: string
  quantity: number
  unitPrice: number
  subtotal: number
  note: string
}

export type BomSummary = {
  hardware: number
  service: number
  haUplift: number
  total: number
}

export type BomQuote = {
  tier: BomTier
  lines: BomLine[]
  summary: BomSummary
}

const hardwareCategories = new Set<BomLine['category']>(['server', 'storage', 'network'])

function line(input: Omit<BomLine, 'subtotal'>): BomLine {
  return {
    ...input,
    subtotal: input.quantity * input.unitPrice,
  }
}

function findTier(vehicleLimit: VehicleLimit): BomTier {
  return vehicleTiers.find((tier) => tier.limit === vehicleLimit) ?? vehicleTiers[vehicleTiers.length - 1]
}

function coreMultiplier(highAvailability: boolean): number {
  return highAvailability ? 2 : 1
}

export function buildBomQuote(options: BomOptions): BomQuote {
  const tier = findTier(options.vehicleLimit)
  const multiplier = coreMultiplier(options.highAvailability)
  const networkQuantity = options.highAvailability || tier.limit >= 500 ? 2 : 1
  const lines: BomLine[] = [
    line({
      id: 'app-server',
      category: 'server',
      name: 'Reewell 应用计算服务器',
      model: `${tier.limit <= 50 ? 'RS-A240' : 'RS-A360'} / ${tier.recommendedSpec}`,
      quantity: tier.appServers * multiplier,
      unitPrice: tier.appServerUnit,
      note: options.highAvailability ? 'HA 模式下应用节点双活冗余' : '承载调度、API、任务编排服务',
    }),
    line({
      id: 'core-network',
      category: 'network',
      name: '核心交换与安全接入',
      model: tier.limit >= 500 ? '双万兆核心交换 / 防火墙接入' : '万兆上联交换 / 安全接入',
      quantity: networkQuantity,
      unitPrice: tier.networkUnit,
      note: networkQuantity > 1 ? '双核心链路，避免单点故障' : '单核心链路，适合标准场站',
    }),
    line({
      id: 'primary-storage',
      category: 'storage',
      name: '主数据存储',
      model: tier.limit >= 300 ? 'NVMe + RAID 业务存储' : 'SSD RAID 业务存储',
      quantity: 1,
      unitPrice: tier.storageUnit,
      note: '保存车辆状态、任务日志和报表数据',
    }),
    line({
      id: 'implementation',
      category: 'service',
      name: '部署实施与联调',
      model: 'Reewell 现场交付包',
      quantity: 1,
      unitPrice: tier.implementationUnit,
      note: '包含服务器上架、系统部署、基础联调',
    }),
    line({
      id: 'support',
      category: 'service',
      name: '软件维保与远程支持',
      model: '标准支持服务',
      quantity: options.supportYears,
      unitPrice: tier.supportUnit,
      note: `${options.supportYears} 年支持服务`,
    }),
  ]

  if (tier.databaseServers > 0) {
    lines.splice(1, 0, line({
      id: 'db-server',
      category: 'server',
      name: 'Reewell 数据库服务器',
      model: tier.limit >= 500 ? 'RS-D520 / 高吞吐数据库节点' : 'RS-D320 / 独立数据库节点',
      quantity: tier.databaseServers * multiplier,
      unitPrice: tier.databaseUnit,
      note: options.highAvailability ? '数据库主备或集群部署' : '数据库独立部署',
    }))
  }

  if (tier.managementNodes > 0) {
    lines.splice(2, 0, line({
      id: 'management-node',
      category: 'server',
      name: '观测与管理节点',
      model: 'RS-M260 / 日志、监控、告警',
      quantity: tier.managementNodes,
      unitPrice: tier.managementUnit,
      note: '承载监控、日志、告警和运维门户',
    }))
  }

  if (options.highAvailability) {
    lines.push(line({
      id: 'ha-service',
      category: 'service',
      name: 'HA 高可用实施包',
      model: '集群配置 / 演练 / 故障切换验证',
      quantity: 1,
      unitPrice: tier.haServiceUnit,
      note: '包含双机热备、健康检查和切换演练',
    }))
  }

  if (options.backupStorage) {
    lines.push(line({
      id: backupStorage.id,
      category: 'storage',
      name: backupStorage.name,
      model: backupStorage.model,
      quantity: 1,
      unitPrice: backupStorage.unitPrice,
      note: '用于离线备份、归档和故障恢复',
    }))
  }

  if (options.gpuAcceleration) {
    lines.push(line({
      id: gpuAccelerator.id,
      category: 'server',
      name: gpuAccelerator.name,
      model: gpuAccelerator.model,
      quantity: 1,
      unitPrice: gpuAccelerator.unitPrice,
      note: '支持视觉识别、轨迹分析和边缘推理扩展',
    }))
  }

  const hardware = lines
    .filter((item) => hardwareCategories.has(item.category))
    .reduce((sum, item) => sum + item.subtotal, 0)
  const service = lines
    .filter((item) => item.category === 'service')
    .reduce((sum, item) => sum + item.subtotal, 0)
  const baseQuote = options.highAvailability
    ? buildBomQuote({ ...options, highAvailability: false })
    : undefined

  return {
    tier,
    lines,
    summary: {
      hardware,
      service,
      haUplift: baseQuote ? hardware + service - baseQuote.summary.total : 0,
      total: hardware + service,
    },
  }
}
