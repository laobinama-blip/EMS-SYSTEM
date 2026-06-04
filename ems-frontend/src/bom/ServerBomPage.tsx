import { type ReactNode, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  Check,
  Cpu,
  Database,
  Download,
  HardDrive,
  Network,
  Send,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { buildBomQuote, type BomOptions } from './bomMath'
import { vehicleTiers, type VehicleLimit } from './bomData'

const supportOptions: BomOptions['supportYears'][] = [1, 2, 3]

function money(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(value)
}

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    server: '服务器',
    storage: '存储',
    network: '网络',
    service: '服务',
  }
  return labels[category] ?? category
}

export function ServerBomPage({ refreshTick: _refreshTick }: { refreshTick?: number }) {
  const [vehicleLimit, setVehicleLimit] = useState<VehicleLimit>(100)
  const [highAvailability, setHighAvailability] = useState(true)
  const [backupStorage, setBackupStorage] = useState(true)
  const [gpuAcceleration, setGpuAcceleration] = useState(false)
  const [supportYears, setSupportYears] = useState<BomOptions['supportYears']>(1)

  const quote = useMemo(() => buildBomQuote({
    vehicleLimit,
    highAvailability,
    backupStorage,
    gpuAcceleration,
    supportYears,
  }), [backupStorage, gpuAcceleration, highAvailability, supportYears, vehicleLimit])

  const serverCount = quote.lines
    .filter((line) => line.category === 'server')
    .reduce((sum, line) => sum + line.quantity, 0)

  return (
    <section className="bom-page">
      <div className="bom-hero">
        <div>
          <h1>Reewell 服务器 BOM 配置</h1>
          <p>按车辆规模与高可用等级自动推荐服务器、网络、存储和交付服务。</p>
        </div>
        <div className="bom-hero-actions">
          <button className="bom-icon-button" type="button" title="导出 BOM">
            <Download size={18} />
          </button>
          <button className="bom-primary-action" type="button">
            <Send size={17} />
            提交方案
          </button>
        </div>
      </div>

      <div className="bom-layout">
        <div className="bom-config">
          <section className="bom-panel bom-tier-panel">
            <div className="bom-panel-heading">
              <div>
                <span>车辆规模</span>
                <strong>选择系统管理车辆数量</strong>
              </div>
              <CarScale value={vehicleLimit} />
            </div>
            <div className="bom-tier-grid">
              {vehicleTiers.map((tier) => (
                <button
                  className={clsx('bom-tier', tier.limit === vehicleLimit && 'active')}
                  key={tier.limit}
                  onClick={() => setVehicleLimit(tier.limit)}
                  type="button"
                >
                  <span>{tier.label}</span>
                  <strong>{tier.limit}</strong>
                  <small>{tier.description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="bom-panel bom-recommendation">
            <div className="bom-panel-heading">
              <div>
                <span>推荐配置</span>
                <strong>{quote.tier.recommendedSpec}</strong>
              </div>
              <ShieldCheck size={22} />
            </div>
            <div className="bom-spec-grid">
              <SpecItem icon={<Server size={19} />} label="服务器节点" value={`${serverCount} 台`} />
              <SpecItem icon={<Database size={19} />} label="数据库部署" value={quote.lines.some((line) => line.id === 'db-server') ? '独立节点' : '随应用部署'} />
              <SpecItem icon={<Network size={19} />} label="核心网络" value={quote.lines.find((line) => line.id === 'core-network')?.model ?? '-'} />
              <SpecItem icon={<HardDrive size={19} />} label="主存储" value={quote.lines.find((line) => line.id === 'primary-storage')?.model ?? '-'} />
            </div>
          </section>

          <section className="bom-panel bom-options-panel">
            <div className="bom-panel-heading">
              <div>
                <span>可靠性与选配</span>
                <strong>像配置座舱一样配置服务器方案</strong>
              </div>
            </div>
            <div className="bom-option-list">
              <ToggleRow
                checked={highAvailability}
                description="应用、数据库和核心网络按冗余规则计入。"
                icon={<ShieldCheck size={20} />}
                label="HA 高可用"
                onChange={setHighAvailability}
              />
              <ToggleRow
                checked={backupStorage}
                description="增加 48TB 备份归档存储，适合生产环境。"
                icon={<HardDrive size={20} />}
                label="备份与归档存储"
                onChange={setBackupStorage}
              />
              <ToggleRow
                checked={gpuAcceleration}
                description="用于视觉识别、轨迹分析和边缘推理扩展。"
                icon={<Cpu size={20} />}
                label="GPU 加速"
                onChange={setGpuAcceleration}
              />
            </div>
            <div className="bom-support">
              <span>维保年限</span>
              <div>
                {supportOptions.map((year) => (
                  <button
                    className={clsx(year === supportYears && 'active')}
                    key={year}
                    onClick={() => setSupportYears(year)}
                    type="button"
                  >
                    {year} 年
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bom-panel bom-table-panel">
            <div className="bom-panel-heading">
              <div>
                <span>BOM 明细</span>
                <strong>{quote.lines.length} 个条目，随配置实时更新</strong>
              </div>
            </div>
            <div className="bom-table-wrap">
              <table className="bom-table">
                <thead>
                  <tr>
                    <th>分类</th>
                    <th>名称</th>
                    <th>型号/规格</th>
                    <th>数量</th>
                    <th>单价</th>
                    <th>小计</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lines.map((line) => (
                    <tr key={line.id}>
                      <td><span className={`bom-category ${line.category}`}>{categoryLabel(line.category)}</span></td>
                      <td>
                        <strong>{line.name}</strong>
                        <small>{line.note}</small>
                      </td>
                      <td>{line.model}</td>
                      <td>{line.quantity}</td>
                      <td>{money(line.unitPrice)}</td>
                      <td>{money(line.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="bom-summary">
          <div className="bom-total">
            <span>当前方案成本</span>
            <strong>{money(quote.summary.total)}</strong>
            <p>{quote.tier.label} / {highAvailability ? 'HA 高可用' : '标准部署'} / {supportYears} 年维保</p>
          </div>
          <div className="bom-cost-bars">
            <CostBar label="硬件成本" value={quote.summary.hardware} total={quote.summary.total} />
            <CostBar label="服务成本" value={quote.summary.service} total={quote.summary.total} />
            <CostBar label="HA 增量" value={quote.summary.haUplift} total={quote.summary.total} />
          </div>
          <div className="bom-delivery">
            <h2>交付建议</h2>
            <ul>
              <li><Check size={16} /> 服务器规格随车辆规模自动接替。</li>
              <li><Check size={16} /> 100 辆以上数据库独立部署。</li>
              <li><Check size={16} /> 500 辆以上默认双核心网络。</li>
              <li><Check size={16} /> HA 方案包含切换演练与健康检查。</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}

function CarScale({ value }: { value: VehicleLimit }) {
  return <div className="bom-scale">≤ {value} 辆</div>
}

function SpecItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bom-spec-item">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ToggleRow({
  checked,
  description,
  icon,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  icon: ReactNode
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <button className={clsx('bom-toggle-row', checked && 'active')} onClick={() => onChange(!checked)} type="button">
      <span className="bom-toggle-icon">{icon}</span>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <i />
    </button>
  )
}

function CostBar({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total > 0 ? `${Math.max(2, Math.round((value / total) * 100))}%` : '2%'
  return (
    <div className="bom-cost-bar">
      <div>
        <span>{label}</span>
        <strong>{money(value)}</strong>
      </div>
      <i><b style={{ width }} /></i>
    </div>
  )
}
