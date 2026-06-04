export type VehicleLimit = 10 | 50 | 100 | 300 | 500 | 1000

export type BomTier = {
  limit: VehicleLimit
  label: string
  description: string
  appServers: number
  appServerUnit: number
  databaseServers: number
  databaseUnit: number
  managementNodes: number
  managementUnit: number
  networkUnit: number
  storageUnit: number
  implementationUnit: number
  supportUnit: number
  haServiceUnit: number
  recommendedSpec: string
}

export const vehicleTiers: BomTier[] = [
  {
    limit: 10,
    label: '10辆以下',
    description: '试点环境，单节点部署，适合小规模 PoC 和现场演示。',
    appServers: 1,
    appServerUnit: 68000,
    databaseServers: 0,
    databaseUnit: 0,
    managementNodes: 0,
    managementUnit: 0,
    networkUnit: 18000,
    storageUnit: 18000,
    implementationUnit: 18000,
    supportUnit: 12000,
    haServiceUnit: 8000,
    recommendedSpec: '1台 16C / 64G / 2TB 应用服务器',
  },
  {
    limit: 50,
    label: '50辆以下',
    description: '标准单场站部署，覆盖调度、监控和基础报表。',
    appServers: 1,
    appServerUnit: 98000,
    databaseServers: 0,
    databaseUnit: 0,
    managementNodes: 0,
    managementUnit: 0,
    networkUnit: 28000,
    storageUnit: 32000,
    implementationUnit: 30000,
    supportUnit: 18000,
    haServiceUnit: 12000,
    recommendedSpec: '1台 24C / 128G / 4TB 应用服务器',
  },
  {
    limit: 100,
    label: '100辆以下',
    description: '生产入门部署，数据库独立，适合单园区连续运行。',
    appServers: 1,
    appServerUnit: 112000,
    databaseServers: 1,
    databaseUnit: 78000,
    managementNodes: 0,
    managementUnit: 0,
    networkUnit: 36000,
    storageUnit: 50000,
    implementationUnit: 45000,
    supportUnit: 22000,
    haServiceUnit: 20000,
    recommendedSpec: '应用 24C / 128G，数据库 16C / 96G，8TB 存储',
  },
  {
    limit: 300,
    label: '300辆以下',
    description: '中大型部署，加入管理节点和更高吞吐网络。',
    appServers: 2,
    appServerUnit: 118000,
    databaseServers: 1,
    databaseUnit: 88000,
    managementNodes: 1,
    managementUnit: 68000,
    networkUnit: 48000,
    storageUnit: 76000,
    implementationUnit: 68000,
    supportUnit: 26000,
    haServiceUnit: 32000,
    recommendedSpec: '2台应用、1台数据库、1台管理节点，12TB 存储',
  },
  {
    limit: 500,
    label: '500辆以下',
    description: '高并发生产部署，推荐双核心网络与观测节点。',
    appServers: 3,
    appServerUnit: 128000,
    databaseServers: 2,
    databaseUnit: 96000,
    managementNodes: 1,
    managementUnit: 82000,
    networkUnit: 62000,
    storageUnit: 110000,
    implementationUnit: 90000,
    supportUnit: 30000,
    haServiceUnit: 45000,
    recommendedSpec: '3台应用、2台数据库、1台观测管理节点，20TB 存储',
  },
  {
    limit: 1000,
    label: '1000辆以下',
    description: '集团级大规模部署，面向多场站和高吞吐数据接入。',
    appServers: 5,
    appServerUnit: 138000,
    databaseServers: 3,
    databaseUnit: 118000,
    managementNodes: 2,
    managementUnit: 92000,
    networkUnit: 78000,
    storageUnit: 180000,
    implementationUnit: 135000,
    supportUnit: 42000,
    haServiceUnit: 68000,
    recommendedSpec: '5台应用、3台数据库、2台观测管理节点，40TB 存储',
  },
]

export const gpuAccelerator = {
  id: 'gpu-accelerator',
  name: '边缘推理 GPU 加速卡',
  model: 'NVIDIA L4 24GB / Reewell Vision Ready',
  unitPrice: 180000,
}

export const backupStorage = {
  id: 'backup-storage',
  name: '备份与归档存储',
  model: 'Reewell Backup NAS 48TB',
  unitPrice: 120000,
}
