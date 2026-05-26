import { type ReactNode, useState, useEffect, Fragment, useRef } from 'react'
import clsx from 'clsx'
import {
  AlertTriangle,
  Anchor,
  BarChart3,
  BatteryCharging,
  Bell,
  Blocks,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  CircleX,
  Clock3,
  Gauge,
  Info,
  LandPlot,
  Leaf,
  LineChart,
  Network,
  RotateCcw,
  Search,
  Ship,
  X,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'
import logoKpiUrl from './assets/reewell-logo-kpi.svg'

type PageKey = 'efficiency' | 'network' | 'dispatch' | 'energy'

const tabs: Array<{ key: PageKey; label: string; icon: typeof BarChart3 }> = [
  { key: 'efficiency', label: '作业效率', icon: BarChart3 },
  { key: 'network', label: '关系网', icon: Network },
  { key: 'dispatch', label: '调度分析', icon: Clock3 },
  { key: 'energy', label: '能源与碳排', icon: Zap },
]

const timeOptions = ['2h', '8h', '1天', '3 天', '7 天', '自定义']

// ─── Chart Data ───────────────────────────────────────────────────────────────
const curveData = [
  { time: '0', before: 36, after: 40, waitBefore: 38, waitAfter: 67 },
  { time: '4', before: 25, after: 32, waitBefore: 32, waitAfter: 58 },
  { time: '8', before: 23, after: 27, waitBefore: 29, waitAfter: 51 },
  { time: '12', before: 29, after: 32, waitBefore: 41, waitAfter: 73 },
  { time: '16', before: 40, after: 43, waitBefore: 18, waitAfter: 32 },
  { time: '4-26', before: 46, after: 49, waitBefore: 44, waitAfter: 57 },
  { time: '4-27', before: 38, after: 42, waitBefore: 36, waitAfter: 63 },
]

const waitingTimeData = [
  { name: '路口一', waitBefore: 34, waitAfter: 63 },
  { name: '路口二', waitBefore: 29, waitAfter: 54 },
  { name: '路口三', waitBefore: 25, waitAfter: 47 },
  { name: '路口四', waitBefore: 37, waitAfter: 68 },
  { name: '路口五', waitBefore: 15, waitAfter: 28 },
  { name: '路口六', waitBefore: 29, waitAfter: 53 },
  { name: '路口七', waitBefore: 40, waitAfter: 74 },
  { name: '路口八', waitBefore: 32, waitAfter: 58 },
]

const hourlyData = Array.from({ length: 25 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  before: Math.max(10, Math.round(24 + Math.sin(i / 0.85) * 6 + Math.sin(i / 2.15) * 5)),
  after: Math.max(29, Math.round(33 + i * 0.45 + Math.sin(i / 1.3) * 3)),
  latency: Math.round(330 + Math.sin(i / 1.2) * 54 + Math.sin(i / 3.5) * 72),
}))



const energyTrend = [
  { time: '00:00', before: 54, after: 50 }, { time: '02:00', before: 43, after: 46 },
  { time: '04:00', before: 38, after: 42 }, { time: '06:00', before: 37, after: 41 },
  { time: '08:00', before: 37, after: 41 }, { time: '10:00', before: 39, after: 42 },
  { time: '12:00', before: 45, after: 46 }, { time: '14:00', before: 52, after: 49 },
  { time: '16:00', before: 59, after: 53 }, { time: '18:00', before: 64, after: 56 },
  { time: '20:00', before: 66, after: 57 }, { time: '22:00', before: 63, after: 55 },
  { time: '24:00', before: 56, after: 52 },
]

// ─── Static Data ──────────────────────────────────────────────────────────────
const workSummary = {
  total: { title: '全部作业统计', totalLabel: '总作业箱量', teu: '12,830', natural: '12,830', loop: '128', boxes: ['5132', '6415', '1283'] },
  jobs: [
    { title: '装船作业统计', label: '装箱箱量', teu: '4500', natural: '4500', loop: '45', boxes: ['1800', '2250', '450'] },
    { title: '卸船作业统计', label: '卸箱箱量', teu: '4800', natural: '4800', loop: '48', boxes: ['1920', '2400', '480'] },
    { title: '转堆作业统计', label: '转堆箱量', teu: '3200', natural: '3200', loop: '32', boxes: ['1280', '1600', '320'] },
    { title: '未知任务作业统计', label: '作业箱量', teu: '330', natural: '330', loop: '3', boxes: ['132', '165', '33'] },
  ],
}

const energySegments = [
  { title: '单箱能耗', value: '3.517', unit: 'kwh/TEU', values: ['0.542', '0.642', '0.812', '0.72'], widths: [18, 23, 36, 23] },
  { title: '单箱综合成本', value: '2.473', unit: '元/TEU', values: ['0.375', '0.532', '0.74', '0.63'], widths: [22, 24, 30, 24] },
  { title: '单箱综合碳排', value: '3.285', unit: 'tCO₂/TEU', values: ['0.542', '0.642', '0.612', '0.72'], widths: [24, 15, 27, 34] },
]

const segmentNames = ['QC', '水平运输', 'YC', '外集卡']
const segmentColors = ['#bfeeff', '#b8f3db', '#d9c2ff', '#fff0ad']

const tariffColumns = ['00:00-02:00', '02:00-08:00', '08:00-12:00', '12:00-18:00', '18:00-22:00', '22:00-24:00']
const tariffRows = [
  { group: '用电量\n(kwh)', label: '调度前', values: ['1,112', '3,688', '3,256', '4,512', '3,256', '1,196'] },
  { group: '用电量\n(kwh)', label: '调度后', values: ['946 ↓', '3,120 ↓', '3,120 ↓', '3,744 ↓', '4,400 ↑', '908 ↓'] },
  { group: '总电量\n(元)', label: '调度前', values: ['311.14', '1,025.66', '1,524.12', '1,951.18', '1,394.74', '285.37'] },
  { group: '总电量\n(元)', label: '调度后', values: ['120.2 ↓', '899.2 ↓', '12,200.2 ↓', '1,289.2 ↓', '1,076.20 ↓', '216.21 ↓'] },
]

const vehicleRows = ['T001', 'T010', 'T009', 'T002', 'T003'].map((id, i) => ({
  id, energy: (32.4 - i * 0.4).toFixed(1), cost: (25.8 - i * 0.55).toFixed(1), carbon: '14.8',
}))



// ─── Network Topology (Static positions matching Figma) ──────────────────────
// Node types: truck=green, qc=blue, rtg=purple, block=olive-green, ship=blue, charge=yellow, swap=cyan
const topologyNodes = [
  { id: 'rtg-a',   label: 'RTG01',     type: 'rtg',    x: 150, y: 300 },
  { id: 'rtg-b',   label: 'RTG02',     type: 'rtg',    x: 95,  y: 520 },
  { id: 't004',    label: 'T004',      type: 'truck',  x: 315, y: 145 },
  { id: 't003a',   label: 'T003',      type: 'truck',  x: 292, y: 335 },
  { id: 'block2',  label: 'Block 2',   type: 'block',  x: 240, y: 420 },
  { id: 't002',    label: 'T002',      type: 'truck',  x: 220, y: 500 },
  { id: 't003b',   label: 'T003',      type: 'truck',  x: 175, y: 680 },
  { id: 'qc-a',   label: 'QC301',     type: 'qc',     x: 385, y: 230 },
  { id: 'ship',    label: '船舶',      type: 'ship',   x: 505, y: 355 },
  { id: 'qc-b',   label: 'QC301',     type: 'qc',     x: 375, y: 430 },
  { id: 'block3a', label: 'Block 3',   type: 'block',  x: 410, y: 525 },
  { id: 't001a',   label: 'T001',      type: 'truck',  x: 295, y: 555 },
  { id: 't008',    label: 'T008',      type: 'truck',  x: 468, y: 488 },
  { id: 'block1',  label: 'Block 1',   type: 'block',  x: 485, y: 225 },
  { id: 'rtg-c',   label: 'RTG01',     type: 'rtg',    x: 562, y: 162 },
  { id: 'qc-c',   label: 'QC301',     type: 'qc',     x: 635, y: 395 },
  { id: 'qc-d',   label: 'QC301',     type: 'qc',     x: 680, y: 222 },
  { id: 't007',    label: 'T007',      type: 'truck',  x: 705, y: 480 },
  { id: 't001b',   label: 'T001',      type: 'truck',  x: 735, y: 148 },
  { id: 't005',    label: 'T005',      type: 'truck',  x: 790, y: 325 },
  { id: 't006',    label: 'T006',      type: 'truck',  x: 782, y: 435 },
  { id: 'block3b', label: 'Block 3',   type: 'block',  x: 765, y: 565 },
  { id: 'rtg-d',   label: 'RTG01',     type: 'rtg',    x: 880, y: 390 },
  { id: 'rtg-e',   label: 'RTG01',     type: 'rtg',    x: 835, y: 632 },
  { id: 't001c',   label: 'T001',      type: 'truck',  x: 925, y: 502 },
  { id: 't001d',   label: 'T001',      type: 'truck',  x: 965, y: 618 },
  { id: 'swap',    label: '换电站',    type: 'swap',   x: 1135, y: 215 },
  { id: 'charge',  label: '充电桩 01', type: 'charge', x: 1095, y: 685 },
  { id: 't-r1',    label: 'T001',      type: 'truck',  x: 1010, y: 200 },
  { id: 't-r2',    label: 'T001',      type: 'truck',  x: 1022, y: 312 },
  { id: 't-r3',    label: 'T001',      type: 'truck',  x: 1152, y: 372 },
  { id: 't-r4',    label: 'T001',      type: 'truck',  x: 1088, y: 585 },
]

const topologyEdges: [string, string, boolean][] = [
  ['rtg-a', 't004', false], ['rtg-a', 't003a', false], ['rtg-a', 'block2', false],
  ['rtg-b', 'block2', false], ['rtg-b', 't002', false], ['rtg-b', 't003b', false],
  ['t004', 'qc-a', false], ['t004', 'block1', false], ['t003a', 'qc-a', false],
  ['t002', 'qc-b', false], ['qc-a', 'ship', false], ['qc-b', 'ship', false],
  ['qc-b', 'block3a', false], ['t001a', 'block3a', false], ['block3a', 't008', false],
  ['t008', 'qc-c', false], ['block3a', 'rtg-e', true],
  ['block1', 'rtg-c', false], ['rtg-c', 't001b', false],
  ['ship', 'qc-c', false], ['ship', 'qc-d', false],
  ['qc-d', 't005', false], ['qc-d', 't006', false], ['qc-d', 't007', false],
  ['t007', 'block3b', false], ['block3b', 'rtg-d', false], ['block3b', 'rtg-e', false],
  ['rtg-e', 't001c', false], ['rtg-e', 't001d', false],
  ['t-r1', 'swap', true], ['t-r2', 'swap', true], ['t-r3', 'swap', false], ['t-r4', 'charge', false],
]

// Node detail popup data
const nodeDetails: Record<string, { title: string; tag: string; items: [string, string][] }> = {
  rtg: { title: 'RTG01', tag: '装箱', items: [['任务信息', 'Task05'], ['效率值', '26.8TEU/h'], ['瞬时功率', '132kw'], ['能耗值', '72kwh/'], ['碳排放', '0.72tCO₂']] },
  qc: { title: 'QC301', tag: '作业中', items: [['当前司机', '王建国'], ['额定效率', '35.0 TEU/h'], ['当前效率', '34.7 TEU/h'], ['累积能耗', '124.5 kWh'], ['任务序列', '装箱序列-B']] },
  ship: { title: '船舶', tag: '在港', items: [['船舶呼号', 'COSCO-102'], ['靠泊时间', '13:05'], ['预离时间', '22:30'], ['本港装卸量', '1,830 TEU'], ['作业进度', '74.2%']] },
  truck: { title: 'T001', tag: '重载行驶', items: [['当前电量', '82.0%'], ['行驶速度', '18.4 km/h'], ['目标流向', 'QC301→Block 3'], ['电机功率', '45 kW']] },
  block: { title: 'Block 3', tag: '堆存中', items: [['当前箱量', '425 箱'], ['最大容积', '800 TEU'], ['堆存率', '53.1%'], ['冷藏插位', '12/32']] },
  charge: { title: '充电桩 01', tag: '使用中', items: [['输出功率', '120 kW'], ['连接车辆', 'T001'], ['计费模式', '分时低价段'], ['电量输送', '45.2 kWh']] },
  swap: { title: '换电站', tag: '待机就绪', items: [['可用电池', '12 块'], ['空闲通道', 'A2, B1'], ['换电速度', '2.8 min/台'], ['排队车辆', '无']] },
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState<PageKey>(() => {
    const hash = window.location.hash.replace('#', '') as PageKey
    return tabs.some((t) => t.key === hash) ? hash : 'efficiency'
  })
  const [range, setRange] = useState('1天')
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as PageKey
      if (tabs.some((t) => t.key === hash)) {
        setPage(hash)
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const Page = { efficiency: EfficiencyPage, network: NetworkPage, dispatch: DispatchPage, energy: EnergyPage }[page]

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand"><img src={logoKpiUrl} alt="ReeWell World KPI" /></div>
          <nav className="tabs" aria-label="主导航">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button key={tab.key} className={clsx('tab', page === tab.key && 'active')}
                  onClick={() => { setPage(tab.key); window.location.hash = tab.key }}>
                  <Icon size={20} strokeWidth={2} />{tab.label}
                </button>
              )
            })}
          </nav>
          <div className="top-actions">
            <div className="alert-pill"><AlertTriangle size={16} fill="#ff6262" color="#ff6262" />QC301效率 25.4箱/h，低于阈值30箱/h</div>
            <button className="round" title="通知"><Bell size={18} /></button>
            <button className="round" title="港口"><Anchor size={18} /></button>
            <button className="round" title="时钟"><Clock3 size={18} /></button>
            <div className="avatar" title="个人账户" />
          </div>
        </div>
      </header>
      <main>
        <FilterBar range={range} setRange={setRange} onRefresh={() => setRefreshTick((v) => v + 1)} />
        <Page refreshTick={refreshTick} />
      </main>
    </div>
  )
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
function FilterBar({ range, setRange, onRefresh }: { range: string; setRange: (v: string) => void; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false)
  function query() { setLoading(true); onRefresh(); window.setTimeout(() => setLoading(false), 320) }
  return (
    <section className="filter-shell">
      <div className="filter-shell-inner">
        <div className="segment">
          {timeOptions.map((opt, i) => (
            <button key={opt} className={clsx(range === opt && 'selected')} onClick={() => setRange(opt)}>
              {opt}{i < timeOptions.length - 1 && <i />}
            </button>
          ))}
        </div>
        <div className="date-pill"><CalendarDays size={16} />开始时间<span>~</span>结束时间</div>
        <button className={clsx('query', loading && 'loading')} onClick={query}><Search size={16} />查询</button>
        <button className="reset" onClick={() => { setRange('1天'); onRefresh() }}><RotateCcw size={16} />重置</button>
      </div>
    </section>
  )
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>
}

function PanelTitle({ icon, title, badge, action }: { icon?: ReactNode; title: string; badge?: string; action?: ReactNode }) {
  return (
    <div className="panel-title">
      <div className="title-left">{icon}{title}{badge && <span className="soft-badge">{badge}</span>}</div>
      {action}
    </div>
  )
}

function Metric({ label, value, unit, big = false }: { label: string; value: string; unit: string; big?: boolean }) {
  return <div className="metric"><small>{label}</small><strong className={clsx(big && 'big')}>{value}</strong><span>{unit}</span></div>
}

function BoxSplit({ values }: { values: string[] }) {
  return (
    <div className="box-split">
      {['20尺箱', '40尺箱', '45尺箱'].map((label, i) => (
        <div key={label}><small>{label}</small><b>{values[i]}</b><span>箱</span></div>
      ))}
    </div>
  )
}

function StatStrip({ items, compact = false }: { items: Array<[string, string, string]>; compact?: boolean }) {
  return (
    <div className={clsx('stat-strip', compact && 'compact')}>
      {items.map(([label, value, unit], i) => {
        const hasLabel = !!label;
        return (
          <div className={clsx('stat-item', !hasLabel && 'no-label')} key={`${label}-${i}`}>
            {hasLabel && <small>{label}</small>}
            <strong>{value}</strong>
            <span>{unit}</span>
          </div>
        )
      })}
    </div>
  )
}

function DeviceSelect({ label }: { label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="select-wrap">
      <button className="select-pill" onClick={() => setOpen((v) => !v)}>{label}<ChevronDown size={15} /></button>
      {open && <span className="select-menu"><button>{label}</button><button>QC301</button><button>RTG01</button></span>}
    </span>
  )
}

function Legend({ gray, green }: { gray: string; green: string }) {
  return <div className="chart-legend"><span className="gray-dot">{gray}</span><span className="green-dot">{green}</span></div>
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  const after = payload.find((p) => p.dataKey === 'after')?.value
  const before = payload.find((p) => p.dataKey === 'before')?.value
  return (
    <div className="tooltip-card">
      <b>{label === '16' ? '16:00' : label}</b>
      <p><i className="dot gray" />调度前效率：{before ?? 38}TEU/h</p>
      <p><i className="dot green" />调度后效率：{after ?? 34.7}TEU/h</p>
      <hr />
      <p>20箱：200TEU</p><p>40箱：200TEU</p><p>危险品：10TEU</p><p>冷藏箱：10TEU</p>
    </div>
  )
}

// ─── Efficiency Page ──────────────────────────────────────────────────────────
function EfficiencyPage({ refreshTick }: { refreshTick: number }) {
  return (
    <div className="page efficiency-page" data-refresh={refreshTick}>
      <Panel className="work-panel">
        <div className="total-work">
          <PanelTitle icon={<BarChart3 size={16} />} title={workSummary.total.title} />
          <Metric label={workSummary.total.totalLabel} value={workSummary.total.teu} unit="TEU" big />
          <hr className="divider" />
          <div className="metric-row two">
            <Metric label="自然箱量" value={workSummary.total.natural} unit="箱" />
            <Metric label="车辆循环" value={workSummary.total.loop} unit="循环" />
          </div>
          <hr className="divider" />
          <BoxSplit values={workSummary.total.boxes} />
          <hr className="divider" />
          <div className="mini-job-grid">
            <span>装船 <b>4500</b> TEU</span><span>卸船 <b>4800</b> TEU</span>
            <span>转堆 <b>3200</b> TEU</span><span>未知 <b>330</b> TEU</span>
          </div>
        </div>
        <div className="job-grid">
          {workSummary.jobs.map((job) => (
            <div className="job-card" key={job.title}>
              <PanelTitle icon={<LandPlot size={15} />} title={job.title} />
              <div className="metric-row three">
                <Metric label={job.label} value={job.teu} unit="TEU" />
                <Metric label="自然箱量" value={job.natural} unit="箱" />
                <Metric label="车辆循环" value={job.loop} unit="循环" />
              </div>
              <hr className="divider" />
              <BoxSplit values={job.boxes} />
            </div>
          ))}
        </div>
      </Panel>

      <div className="main-left">
        <Panel className="strip-card">
          <PanelTitle icon={<Leaf size={16} />} title="能耗" />
          <StatStrip items={[
            ['总能源投入金额', '30,000', '元'], ['调度节能成本', '30,000', '元'], ['燃油总消耗', '2,000', 'L'],
            ['碳排', '7.44', 'tCO₂'], ['耗电总计', '2,000', 'kwh'], ['电力负荷峰值', '86', '%'], ['平均每箱耗电', '20', 'kwh/箱'],
          ]} />
        </Panel>
        <Panel className="strip-card">
          <PanelTitle icon={<BarChart3 size={16} />} title="效率" />
          <StatStrip items={[
            ['全场平均效率', '31.4', 'TEU/h'], ['岸桥平均效率', '34.7', 'TEU/h'], ['场桥平均效率', '27.6', 'TEU/h'],
            ['泊位效率', '5.8', 'TEU/h'], ['平均在泊时间', '16.2', 'h'],
          ]} />
        </Panel>
        <Panel className="equipment-card">
          <PanelTitle icon={<Blocks size={16} />} title="设备" />
          <h4>全部设备统计</h4>
          <StatStrip compact items={[
            ['岸桥总数', '8', '台'], ['参与作业船舶总数', '1', '艘'], ['参与作业时长', '2,000', '小时'],
            ['场桥总数', '8', '台'], ['车辆总数', '200', '辆'],
            ['参与作业车辆总数', '8', '台'], ['全部车辆作业时间', '186', '小时'], ['车辆故障圈数', '2', '圈'],
            ['总故障时间', '2', '小时'], ['MMBF(平均无故障运行里程)', '5,999', 'km'],
          ]} />
          <h4>单车作业统计</h4>
          <StatStrip compact items={[
            ['平均每车作业时间', '3.21', '小时'], ['平均每圈时长', '20.12', '分钟'],
            ['平均每圈停车等待时间', '20.12', '分钟'], ['每圈平均里程', '19.2', 'km'], ['空驶里程', '20', 'km'],
          ]} />
          <h4>单车平均效率</h4>
          <StatStrip compact items={[
            ['', '8', '循环/小时'], ['', '1', 'TEU/h'], ['', '2,000', '自然箱/小时'], ['', '8', '分(20尺箱)'], ['', '8', '分(40尺箱)'],
          ]} />
        </Panel>
        <div className="efficiency-charts">
          <ChartCard title="岸桥效率" unit="TEU" badge="平均效率 34.7 TEU/h" action="全部岸桥" />
          <ChartCard title="场桥效率" unit="TEU" badge="平均效率 34.7 TEU/h" action="全部场桥" />
        </div>
      </div>

      <div className="side-charts">
        <ChartCard title="车辆平均效率" unit="圈数/小时" badge="平均效率 34.7 圈数/小时" action="全部车辆" />
        <ChartCard title="车辆平均空驶率" unit="%" badge="平均空驶率 34.7 %" action="全部车辆" />
        <WaitBarChart />
      </div>
    </div>
  )
}

function ChartCard({ title, unit, badge, action }: { title: string; unit: string; badge: string; action: string }) {
  return (
    <Panel className="chart-panel">
      <PanelTitle icon={<LineChart size={16} />} title={title} badge={badge} action={<DeviceSelect label={action} />} />
      <Legend gray="调度前效率" green="调度后效率" />
      <div className="axis-label">{unit}</div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={curveData} margin={{ left: -22, right: 10, top: 12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="7 9" vertical={false} stroke="#d5d9de" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={{ stroke: '#d8dce2' }} tickLine={{ stroke: '#d8dce2' }} />
            <YAxis tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={false} tickLine={false} domain={[0, 60]} />
            <Tooltip content={<ChartTooltip />} />
            <Area isAnimationActive={false} type="monotone" dataKey="after" fill="#19d98f18" stroke="#19d98f" strokeWidth={2.1} dot={{ r: 3, fill: '#fff', strokeWidth: 1.6 }} />
            <Line isAnimationActive={false} type="monotone" dataKey="before" stroke="#858c8c" strokeWidth={2} dot={{ r: 3, fill: '#fff', strokeWidth: 1.4 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="chart-static-cursor" />
        <div className="chart-static-tip">
          <b>16:00</b>
          <p><i className="dot gray" />调度前效率：38TEU/h</p>
          <p><i className="dot green" />调度后效率：34.7TEU/h</p>
          {(title === '岸桥效率' || title === '场桥效率') && (
            <>
              <hr />
              <p>20箱：200TEU</p><p>40箱：200TEU</p><p>危险品：10TEU</p><p>冷藏箱：10TEU</p>
            </>
          )}
        </div>
      </div>
    </Panel>
  )
}

function WaitBarChart() {
  return (
    <Panel className="chart-panel">
      <PanelTitle icon={<Car size={16} />} title="车辆平均等待时间" badge="平均等待时间 46 秒/循环" action={<DeviceSelect label="全部车辆" />} />
      <Legend gray="调度前等待时间" green="调度后等待时间" />
      <div className="axis-label">秒/循环</div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={waitingTimeData} margin={{ left: -22, right: 10, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="7 9" vertical={false} stroke="#d5d9de" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={{ stroke: '#d8dce2' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
          <Tooltip content={<ChartTooltip />} />
          <Bar isAnimationActive={false} dataKey="waitBefore" fill="#858c8c" radius={[3, 3, 0, 0]} barSize={10} />
          <Bar isAnimationActive={false} dataKey="waitAfter" fill="#19d98f" radius={[3, 3, 0, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

// ─── Network Page ──────────────────────────────────────────────────────────────
function NetworkPage() {
  const [nodes, setNodes] = useState(() =>
    topologyNodes.map((n) => ({
      ...n,
      vx: 0,
      vy: 0,
      origX: n.x,
      origY: n.y,
    }))
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [legend, setLegend] = useState(false)
  const [taskMode, setTaskMode] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // Active set in task mode: highlight QC301, T005, RTG01, ship chain
  const taskHighlight = new Set(['ship', 'qc-d', 't005', 'rtg-d'])
  const activeNode = taskMode ? 'rtg-d' : selected

  // Force-directed physics simulation loop
  useEffect(() => {
    let animId: number
    const updatePhysics = () => {
      setNodes((prevNodes) => {
        const nextNodes = prevNodes.map((n) => ({ ...n }))
        const map = new Map(nextNodes.map((n) => [n.id, n]))

        // 1. Attraction force to original position (gentle spring to restore layout)
        const return_k = 0.04
        for (const n of nextNodes) {
          if (n.id === draggedId) continue
          const dx = n.origX - n.x
          const dy = n.origY - n.y
          n.vx += dx * return_k
          n.vy += dy * return_k
        }

        // 2. Repulsion force between node pairs
        const repulsion_dist = 140
        const repulsion_k = 0.08
        for (let i = 0; i < nextNodes.length; i++) {
          const u = nextNodes[i]
          for (let j = i + 1; j < nextNodes.length; j++) {
            const v = nextNodes[j]
            const dx = v.x - u.x
            const dy = v.y - u.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            if (dist < repulsion_dist) {
              const force = (repulsion_dist - dist) * repulsion_k
              const fx = (dx / dist) * force
              const fy = (dy / dist) * force
              if (u.id !== draggedId) {
                u.vx -= fx
                u.vy -= fy
              }
              if (v.id !== draggedId) {
                v.vx += fx
                v.vy += fy
              }
            }
          }
        }

        // 3. Spring attraction force along edges
        const spring_k = 0.05
        const rest_len = 110
        for (const [source, target] of topologyEdges) {
          const u = map.get(source)
          const v = map.get(target)
          if (!u || !v) continue
          const dx = v.x - u.x
          const dy = v.y - u.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = (dist - rest_len) * spring_k
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          if (u.id !== draggedId) {
            u.vx += fx
            u.vy += fy
          }
          if (v.id !== draggedId) {
            v.vx -= fx
            v.vy -= fy
          }
        }

        // 4. Center gravity force (gentle pull to center of 1220x760)
        const gravity = 0.0003
        for (const n of nextNodes) {
          if (n.id === draggedId) continue
          const dx = 610 - n.x
          const dy = 380 - n.y
          n.vx += dx * gravity
          n.vy += dy * gravity
        }

        // 5. Update positions with damping
        const damping = 0.72
        for (const n of nextNodes) {
          if (n.id === draggedId) {
            n.vx = 0
            n.vy = 0
            continue
          }
          n.vx *= damping
          n.vy *= damping
          n.x += n.vx
          n.y += n.vy

          // Viewport bounding box constraints
          n.x = Math.max(45, Math.min(1175, n.x))
          n.y = Math.max(45, Math.min(715, n.y))
        }

        return nextNodes
      })

      animId = requestAnimationFrame(updatePhysics)
    }

    animId = requestAnimationFrame(updatePhysics)
    return () => cancelAnimationFrame(animId)
  }, [draggedId])

  // Mouse drag handler
  useEffect(() => {
    if (!draggedId) return

    const getSvgCoords = (e: MouseEvent, svgEl: SVGSVGElement) => {
      const rect = svgEl.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 1220
      const y = ((e.clientY - rect.top) / rect.height) * 760
      return { x, y }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const { x, y } = getSvgCoords(e, svgRef.current)
      setNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === draggedId ? { ...n, x, y } : n))
      )
    }

    const handleMouseUp = () => {
      setDraggedId(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedId])

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return // Left click only
    e.stopPropagation()
    setDraggedId(nodeId)
  }

  const selectedNodeData = selected ? nodeMap.get(selected) : null
  const detail = selectedNodeData ? (nodeDetails[selectedNodeData.type] ?? nodeDetails.truck) : null

  return (
    <div className="page network-page">
      <Panel className={clsx('network-panel', taskMode && 'task-mode')}>
        <div className="network-filters">
          {taskMode ? (
            <>
              <button className="tag-filter">RTG <X size={13} /></button>
              <button className="tag-filter">Task05 <X size={13} /></button>
            </>
          ) : (
            <>
              <DeviceSelect label="全部设备" />
              <DeviceSelect label="全部任务" />
            </>
          )}
          <button className="ghost-filter" onClick={() => setTaskMode((v) => !v)}>
            {taskMode ? '退出任务态' : '任务态'}
          </button>
        </div>

        <svg
          ref={svgRef}
          className="network-svg"
          viewBox="0 0 1220 760"
          role="img"
          aria-label="关系网拓扑图"
          onClick={() => { if (!taskMode) setSelected(null) }}
          style={{ cursor: draggedId ? 'grabbing' : 'default' }}
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#dde5ef" />
            </pattern>
          </defs>
          <rect width="1220" height="760" fill="url(#dots)" />

          {/* Edges */}
          {topologyEdges.map(([source, target, dashed], i) => {
            const a = nodeMap.get(source)!
            const b = nodeMap.get(target)!
            if (!a || !b) return null
            const isActiveEdge = taskMode
              ? taskHighlight.has(source) && taskHighlight.has(target)
              : source === activeNode || target === activeNode
            return (
              <line
                key={`${source}-${target}-${i}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                className={clsx('edge', isActiveEdge && 'active', dashed && 'dashed')}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isFaded = taskMode && !taskHighlight.has(node.id)
            const isSelected = activeNode === node.id
            return (
              <TopologyNode
                key={node.id}
                node={node}
                selected={isSelected}
                faded={isFaded}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!taskMode) setSelected(node.id === selected ? null : node.id)
                }}
                onMouseDown={(e) => handleMouseDown(node.id, e)}
              />
            )
          })}
        </svg>

        {/* Node detail popup - matches Figma design */}
        {(selected || taskMode) && detail && (
          <div className="node-pop">
            <button className="pop-close" onClick={() => { setSelected(null); setTaskMode(false) }}><X size={16} /></button>
            <h3>{selectedNodeData?.label ?? 'RTG01'} <span>{detail.tag}</span></h3>
            <dl>
              {detail.items.map(([k, v]) => (
                <Fragment key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </Fragment>
              ))}
            </dl>
          </div>
        )}

        <button className="legend-button" onClick={() => setLegend((v) => !v)}>
          <Info size={15} />图例 <ChevronDown size={14} />
        </button>
        {legend && (
          <div className="legend-pop">
            <span><i className="dot-legend truck" />车辆</span>
            <span><i className="dot-legend qc" />岸桥/船舶</span>
            <span><i className="dot-legend rtg" />场桥</span>
            <span><i className="dot-legend block" />箱区</span>
            <span><i className="dot-legend charge" />充电桩</span>
            <span><i className="dot-legend swap" />换电站</span>
          </div>
        )}
      </Panel>
    </div>
  )
}

// Node type → fill color (matching Figma exactly)
const nodeColors: Record<string, string> = {
  truck: '#19d98f',
  qc: '#46bdf2',
  rtg: '#887bf3',
  block: '#82b640',
  ship: '#46bdf2',
  charge: '#f0a43a',
  swap: '#66cad8',
}

function TopologyNode({
  node, selected, faded, onClick, onMouseDown
}: {
  node: { id: string; label: string; type: string; x: number; y: number }
  selected: boolean; faded: boolean
  onClick: (e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
}) {
  const Icon = node.type === 'truck' ? Car
    : node.type === 'qc' ? Gauge
    : node.type === 'rtg' ? LandPlot
    : node.type === 'block' ? Blocks
    : node.type === 'ship' ? Ship
    : node.type === 'charge' ? Zap
    : BatteryCharging
  const fill = nodeColors[node.type] ?? '#46bdf2'

  return (
    <g
      className={clsx('topology-node', node.type, selected && 'selected', faded && 'faded')}
      transform={`translate(${node.x} ${node.y})`}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{ cursor: 'grab' }}
    >
      {/* Outer ring when selected */}
      {selected && <circle r="22" fill="none" stroke={fill} strokeWidth="2" opacity="0.4" />}
      {/* Main circle */}
      <circle r="16" fill={fill} opacity={faded ? 0.25 : 1} />
      {/* White icon */}
      <Icon x={-9} y={-9} size={18} strokeWidth={1.8} color="#fff" style={{ pointerEvents: 'none' }} />
      {/* Label */}
      <text
        y="32"
        textAnchor="middle"
        fontSize="11"
        fill={faded ? '#aab4c0' : '#374151'}
        fontWeight="500"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.label}
      </text>
    </g>
  )
}

// ─── Dispatch Page ─────────────────────────────────────────────────────────────
function DispatchPage() {
  return (
    <div className="page dispatch-page">
      {/* Panel 1: 算法效率提升对比 */}
      <Panel className="dispatch-card">
        <div className="dispatch-row-layout">
          <div className="dispatch-chart-container">
            <PanelTitle icon={<BarChart3 size={16} />} title="算法效率提升对比" />
            <Legend gray="未使用算法预测结果" green="Hymala 优化调度后" />
            <div className="axis-label">TEU/小时</div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={hourlyData} margin={{ left: -22, right: 0, top: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="8 9" vertical={false} stroke="#d8dce2" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#7c838c' }} tickLine={false} axisLine={{ stroke: '#d8dce2' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#7c838c' }} axisLine={false} tickLine={false} domain={[0, 60]} />
                <Tooltip content={<ChartTooltip />} />
                <Area isAnimationActive={false} type="monotone" dataKey="after" fill="#19d98f18" stroke="#19d98f" strokeWidth={2.1} dot={{ r: 2.8, fill: '#fff' }} />
                <Line isAnimationActive={false} type="monotone" dataKey="before" stroke="#858c8c" strokeWidth={2} dot={{ r: 2.8, fill: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="dispatch-2x2-grid">
            {[
              ['算法统计', '124', '次', '+8.2%'],
              ['Hymala', '124', '次', '+12.2%'],
              ['OR', '124', '次', '+8.2%'],
              ['混合', '124', '次', '-1%'],
            ].map(([title, value, unit, delta]) => (
              <div className="dispatch-info-card" key={title}>
                <h4>{title}</h4>
                <div className="card-metrics">
                  <div className="card-metric-item">
                    <span>调用次数</span>
                    <strong>{value}<em>{unit}</em></strong>
                  </div>
                  <div className="card-metric-item">
                    <span>效率提升</span>
                    <strong className={delta.startsWith('-') ? 'trend-down' : 'trend-up'}>{delta}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Panel 2: Hymala 世界模型稳定性波动曲线 */}
      <Panel className="dispatch-card">
        <div className="dispatch-row-layout">
          <div className="dispatch-chart-container">
            <PanelTitle icon={<LineChart size={16} />} title="Hymala 世界模型稳定性波动曲线" />
            <div className="axis-label">响应时间(ms)</div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={hourlyData} margin={{ left: -22, right: 0, top: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="8 9" vertical={false} stroke="#d8dce2" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#7c838c' }} tickLine={false} axisLine={{ stroke: '#d8dce2' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#7c838c' }} axisLine={false} tickLine={false} domain={[0, 600]} />
                <Tooltip content={<LatencyTooltip />} />
                <Area isAnimationActive={false} type="monotone" dataKey="latency" fill="#2f9bff18" stroke="#2f9bff" strokeWidth={2.1} dot={{ r: 2.8, fill: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="dispatch-2x2-grid">
            {[
              ['接口调用成功率', '99.92', '%', '↑ 0.18%'],
              ['服务响应时延', '426', 'ms', '↓ 23ms'],
              ['接口调用总次数', '2,000', '次', '↑ 0.8%'],
              ['服务超时率', '2', '%', '↓ 0.8%'],
            ].map(([title, value, unit, delta]) => {
              const isGreen = delta.includes('↑') && title !== '服务响应时延' && title !== '服务超时率'
                || delta.includes('↓') && (title === '服务响应时延' || title === '服务超时率');
              return (
                <div className="dispatch-info-card" key={title}>
                  <h4>{title}</h4>
                  <div className="card-metrics">
                    <div className="card-metric-item">
                      <span>{title.includes('次数') ? '调用总数' : '当前数值'}</span>
                      <strong>{value}<em>{unit}</em></strong>
                    </div>
                    <div className="card-metric-item">
                      <span>较昨日</span>
                      <strong className={isGreen ? 'trend-up' : 'trend-down'}>{delta}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      {/* Panel 3: 二次调度分析 */}
      <Panel className="timeline-panel">
        <PanelTitle icon={<Check size={16} />} title="二次调度分析" badge="每色块代表一次调度事件　今日触发 47 次" />
        <Timeline />
      </Panel>
    </div>
  )
}

function Timeline() {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const events: Array<[string, number, number, string, boolean, string]> = [
    ['卸船换桥', 10, 8, '#83e9d4', true, '重新指派就近空闲车辆或换电，计算二级流向避让最优时段。'],
    ['重进重出', 23, 9, '#87d9ee', true, '下发静止锁止指令，释放相邻道路路权，防止AGV死锁。'],
    ['路口拥堵', 34, 8, '#b8c4ff', true, '重新划分警示碰撞框，退出主干道以解除车辆拥堵。'],
    ['卸船岸桥任务调序', 47, 14, '#ffdcb2', true, '调度中心干预，指派倒车回退，重新进行会车路权排序。'],
    ['装船变更场桥', 63, 12, '#8ce8be', true, '优化场桥配载序列，减少重叠调度次数。'],
    ['堆场翻倒', 77, 9, '#ffc6b4', false, '触发人工核实翻箱操作，重规划作业路径。'],
    ['船舶配载变更', 91, 11, '#fff29c', true, '重新计算二级配载模型，自动纠正桥吊吊点。'],
  ]

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const containerRect = e.currentTarget.parentElement?.getBoundingClientRect()
    if (containerRect) {
      setTooltipPos({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 40
      })
    }
    setHoveredEvent(label)
  }

  return (
    <div className="timeline-container" style={{ position: 'relative' }}>
      <div className="timeline" onScroll={() => setHoveredEvent(null)}>
        <div className="time-axis">
          {['13:05','13:10','13:15','13:20','13:25','13:30','13:35','13:40','13:45','13:50','13:55','14:00','14:05','14:10','14:15','14:20','14:25','14:30','14:35'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="event-row">
          <b>工况</b>
          <i className="now">13:08</i>
          {events.map(([label, left, width, color, ok]) => (
            <button
              key={label}
              className="event-pill"
              style={{ left: `${left}%`, width: `${width}%`, background: color }}
              onMouseEnter={(e) => handleMouseEnter(e, label)}
              onMouseLeave={() => setHoveredEvent(null)}
              onClick={() => setSelectedEvent(label)}
            >
              {ok ? <Check size={15} /> : <CircleX size={15} />}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Tooltip */}
      {hoveredEvent && (
        <div
          className="event-tooltip"
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        >
          工况: {hoveredEvent}
        </div>
      )}

      {/* Dispatch Modal */}
      {selectedEvent && (
        <div
          className="dispatch-modal"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              width: '450px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              position: 'relative'
            }}
          >
            <button
              className="modal-close-x"
              onClick={() => setSelectedEvent(null)}
              style={{
                position: 'absolute',
                top: '16px', right: '16px',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>
              二次调度事件详情
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#334155' }}>
                <strong>工况类别：</strong>{selectedEvent}
              </p>
              <p style={{ fontSize: '13px', color: '#334155' }}>
                <strong>影响范围：</strong>主要影响港区 QC301 桥吊及周边作业路段。
              </p>
              <p style={{ fontSize: '13px', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <strong>调度决策方案 (Hymala)：</strong>
                <span style={{ display: 'block', marginTop: '6px', color: '#0f766e', fontWeight: 500 }}>
                  {events.find(([l]) => l === selectedEvent)?.[5]}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LatencyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="tooltip-card">
      <b>{label}</b>
      <p>响应时间：{payload[0].value}ms</p>
      <p>模型状态：稳定</p>
    </div>
  )
}

// ─── Energy Page ──────────────────────────────────────────────────────────────
function EnergyPage() {
  return (
    <div className="page energy-page">
      <Panel className="energy-structure">
        {energySegments.map((seg) => <EnergySegment key={seg.title} segment={seg} />)}
      </Panel>
      <Panel className="energy-chart">
        <PanelTitle icon={<Leaf size={16} />} title="能耗趋势" action={<DeviceSelect label="全部设备" />} />
        <EnergyLineChart />
      </Panel>
      <Panel className="energy-chart">
        <PanelTitle icon={<Gauge size={16} />} title="传统电力vs绿电" action={<span className="green-ratio">绿电占比 68%</span>} />
        <EnergyLineChart />
      </Panel>
      <Panel className="tariff-panel">
        <PanelTitle icon={<Zap size={16} />} title="分时电价" />
        <StatStrip items={[
          ['调度前总电费', '6,351', '元'], ['调度后总电费', '5,021', '元'],
          ['节省金额', '1,330', '元'], ['平均电价', '0.45', '元/kWh'], ['避峰率', '42', '%'],
        ]} />
        <TariffTable />
      </Panel>
      <Panel className="vehicle-panel">
        <PanelTitle icon={<Car size={16} />} title="单辆车百公里能耗" action={<DeviceSelect label="全部设备" />} />
        <VehicleTable />
      </Panel>
    </div>
  )
}

function EnergySegment({ segment }: { segment: typeof energySegments[number] }) {
  return (
    <div className="energy-segment">
      <PanelTitle
        icon={<Leaf size={16} />}
        title={segment.title}
        action={<div className="segment-total"><strong>{segment.value}</strong> {segment.unit}</div>}
      />
      <div className="stack-bar">
        {segment.values.map((value, i) => (
          <div key={i} style={{ width: `${segment.widths[i]}%`, background: segmentColors[i] }}>
            <b>{value}</b>
          </div>
        ))}
      </div>
      <div className="segment-labels">{segmentNames.map((name) => <span key={name}>{name}</span>)}</div>
      <div className="energy-mix">
        {['柴油', '火力', '绿电'].map((type, row) => (
          <div key={type}>
            <b>{type}</b>
            {segmentNames.map((name) => <span key={name}>{row === 2 ? '40%' : '30%'}</span>)}
          </div>
        ))}
      </div>
    </div>
  )
}

function EnergyLineChart() {
  return (
    <>
      <Legend gray="调度前能耗" green="调度后能耗" />
      <div className="axis-label">总能耗（kWh）</div>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={energyTrend} margin={{ left: -22, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="8 9" vertical={false} stroke="#d8dce2" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#7c838c' }} axisLine={{ stroke: '#d8dce2' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#7c838c' }} axisLine={false} tickLine={false} domain={[0, 70]} />
          <Tooltip content={<ChartTooltip />} />
          <Area isAnimationActive={false} type="monotone" dataKey="after" fill="#19d98f16" stroke="#19d98f" strokeWidth={2.1} dot={{ r: 3, fill: '#fff' }} />
          <Line isAnimationActive={false} type="monotone" dataKey="before" stroke="#858c8c" strokeWidth={2} dot={{ r: 3, fill: '#fff' }} />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}

function TariffTable() {
  return (
    <table className="tariff-table">
      <thead>
        <tr><th /><th />{tariffColumns.map((c) => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {tariffRows.map((row, i) => (
          <tr key={`${row.group}-${row.label}`}>
            <th>{i % 2 === 0 ? row.group.split('\n').map((line, idx) => <span key={idx}>{line}</span>) : ''}</th>
            <td>{row.label}</td>
            {row.values.map((v, idx) => (
              <td key={idx} className={clsx(v.includes('↑') && 'up', v.includes('↓') && 'down')}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function VehicleTable() {
  return (
    <table className="vehicle-table">
      <thead>
        <tr>
          <th rowSpan={2}>设备</th>
          <th colSpan={2}>能耗(kWh/100km)</th>
          <th colSpan={2}>成本(元/100km)</th>
          <th colSpan={2}>碳排(kgCO₂/100km)</th>
        </tr>
        <tr><th>调度前</th><th>调度后</th><th>调度前</th><th>调度后</th><th>调度前</th><th>调度后</th></tr>
      </thead>
      <tbody>
        {vehicleRows.map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.energy}</td><td>{row.energy}</td>
            <td>{row.cost}</td><td>{row.cost}</td>
            <td>{row.carbon}</td><td>{row.carbon}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default App
