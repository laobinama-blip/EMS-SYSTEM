import { type ReactNode, useMemo, useState } from 'react'
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
  ChevronDown,
  Clock3,
  Factory,
  Gauge,
  GitBranch,
  Info,
  LandPlot,
  Leaf,
  Lightbulb,
  LineChart,
  Network,
  RotateCcw,
  Search,
  Ship,
  SlidersHorizontal,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

type PageKey = 'efficiency' | 'network' | 'dispatch' | 'energy'

const tabs: Array<{ key: PageKey; label: string; icon: typeof BarChart3 }> = [
  { key: 'efficiency', label: '作业效率', icon: BarChart3 },
  { key: 'network', label: '关系网', icon: Network },
  { key: 'dispatch', label: '调度分析', icon: Clock3 },
  { key: 'energy', label: '能源与碳排', icon: Lightbulb },
]

const timeOptions = ['2h', '8h', '1天', '3 天', '7 天', '自定义']

const curveData = [
  { time: '0', before: 36, after: 40, a: 38, b: 66 },
  { time: '4', before: 25, after: 32, a: 32, b: 58 },
  { time: '8', before: 23, after: 27, a: 29, b: 51 },
  { time: '12', before: 29, after: 32, a: 41, b: 73 },
  { time: '16', before: 40, after: 43, a: 32, b: 57 },
  { time: '4-26', before: 46, after: 49, a: 45, b: 78 },
  { time: '4-27', before: 38, after: 42, a: 36, b: 63 },
]

const hourlyData = Array.from({ length: 25 }, (_, index) => {
  const base = 22 + Math.sin(index / 1.7) * 7 + Math.sin(index / 0.9) * 5
  return {
    time: `${String(index).padStart(2, '0')}:00`,
    before: Math.max(10, Math.round(base + (index % 6) * 2)),
    after: Math.max(28, Math.round(33 + index * 0.45 + Math.sin(index / 1.3) * 3)),
    latency: Math.round(330 + Math.sin(index / 1.2) * 54 + Math.sin(index / 3.5) * 72),
  }
})

const energyTrend = [
  { time: '00:00', before: 54, after: 50 },
  { time: '02:00', before: 43, after: 46 },
  { time: '04:00', before: 38, after: 42 },
  { time: '06:00', before: 37, after: 41 },
  { time: '08:00', before: 37, after: 41 },
  { time: '10:00', before: 39, after: 42 },
  { time: '12:00', before: 45, after: 46 },
  { time: '14:00', before: 52, after: 49 },
  { time: '16:00', before: 59, after: 53 },
  { time: '18:00', before: 64, after: 56 },
  { time: '20:00', before: 66, after: 57 },
  { time: '22:00', before: 63, after: 55 },
  { time: '24:00', before: 56, after: 52 },
]

const workSummary = {
  total: {
    title: '全部作业统计',
    totalLabel: '总作业箱量',
    teu: '12,830',
    natural: '12,830',
    loop: '128',
    boxes: ['5132', '6415', '1283'],
  },
  jobs: [
    { title: '装船作业统计', label: '装箱箱量', teu: '4500', natural: '4500', loop: '45', boxes: ['1800', '2250', '450'] },
    { title: '卸船作业统计', label: '卸箱箱量', teu: '4800', natural: '4800', loop: '48', boxes: ['1920', '2400', '480'] },
    { title: '转堆作业统计', label: '转堆箱量', teu: '3200', natural: '3200', loop: '32', boxes: ['1280', '1600', '320'] },
    { title: '未知任务作业统计', label: '作业箱量', teu: '330', natural: '330', loop: '3', boxes: ['132', '165', '33'] },
  ],
}

const energySegments = [
  {
    title: '单箱能耗',
    value: '3.517',
    unit: 'kwh/TEU',
    values: ['0.542', '0.642', '0.812', '0.72'],
    widths: [18, 23, 36, 23],
  },
  {
    title: '单箱综合成本',
    value: '2.473',
    unit: '元/TEU',
    values: ['0.375', '0.532', '0.74', '0.63'],
    widths: [22, 24, 30, 24],
  },
  {
    title: '单箱综合碳排',
    value: '3.285',
    unit: 'tCO₂/TEu',
    values: ['0.542', '0.642', '0.612', '0.72'],
    widths: [24, 15, 27, 34],
  },
]

const segmentNames = ['QC', '水平运输', 'YC', '外集卡']
const segmentColors = ['#bfeeff', '#b8f3db', '#d9c2ff', '#fff0ad']

const tariffColumns = ['00:00-02:00', '02:00-08:00', '08:00-12:00', '12:00-18:00', '18:00-22:00', '22:00-24:00']
const tariffRows = [
  { group: '用电量\n(kwh)', label: '调度前', values: ['1,112', '3,688', '3,256', '4,512', '3,256', '1,196'] },
  { group: '用电量\n(kwh)', label: '调度后', values: ['946↓', '3,120↓', '3,120↓', '3,744↓', '4,400↑', '908↓'] },
  { group: '总电量\n(元)', label: '调度前', values: ['311.14', '1,025.66', '1,524.12', '1,951.18', '1,394.74', '285.37'] },
  { group: '总电量\n(元)', label: '调度后', values: ['120.2↓', '899.2↓', '12,200.2↓', '1,289.2↓', '1,076.20↓', '216.21↓'] },
]

const vehicleRows = ['T001', 'T010', 'T009', 'T002', 'T003'].map((id, index) => ({
  id,
  energy: (32.4 - index * 0.4).toFixed(1),
  cost: (25.8 - index * 0.55).toFixed(1),
  carbon: '14.8',
}))

const topologyNodes = [
  { id: 'rtg-a', label: 'RTG01', type: 'rtg', x: 210, y: 285 },
  { id: 'rtg-b', label: 'RTG02', type: 'rtg', x: 150, y: 520 },
  { id: 't004', label: 'T004', type: 'truck', x: 360, y: 130 },
  { id: 't003a', label: 'T003', type: 'truck', x: 345, y: 325 },
  { id: 'block2', label: 'Block 2', type: 'block', x: 300, y: 410 },
  { id: 't002', label: 'T002', type: 'truck', x: 285, y: 500 },
  { id: 't003b', label: 'T003', type: 'truck', x: 245, y: 690 },
  { id: 'qc-a', label: 'QC301', type: 'qc', x: 425, y: 230 },
  { id: 'ship', label: '船舶', type: 'ship', x: 520, y: 350 },
  { id: 'qc-b', label: 'QC301', type: 'qc', x: 415, y: 435 },
  { id: 'block3a', label: 'Block 3', type: 'block', x: 440, y: 525 },
  { id: 't001a', label: 'T001', type: 'truck', x: 345, y: 555 },
  { id: 't008', label: 'T008', type: 'truck', x: 495, y: 490 },
  { id: 'block1', label: 'Block 1', type: 'block', x: 505, y: 225 },
  { id: 'rtg-c', label: 'RTG01', type: 'rtg', x: 565, y: 165 },
  { id: 'qc-c', label: 'QC301', type: 'qc', x: 640, y: 395 },
  { id: 'qc-d', label: 'QC301', type: 'qc', x: 670, y: 225 },
  { id: 't007', label: 'T007', type: 'truck', x: 690, y: 480 },
  { id: 't001b', label: 'T001', type: 'truck', x: 760, y: 150 },
  { id: 't005', label: 'T005', type: 'truck', x: 775, y: 325 },
  { id: 't006', label: 'T006', type: 'truck', x: 770, y: 435 },
  { id: 'block3b', label: 'Block 3', type: 'block', x: 755, y: 570 },
  { id: 'rtg-d', label: 'RTG01', type: 'rtg', x: 860, y: 390 },
  { id: 'rtg-e', label: 'RTG01', type: 'rtg', x: 830, y: 635 },
  { id: 't001c', label: 'T001', type: 'truck', x: 925, y: 500 },
  { id: 't001d', label: 'T001', type: 'truck', x: 965, y: 620 },
  { id: 'swap', label: '换电站', type: 'swap', x: 1115, y: 220 },
  { id: 'charge', label: '充电桩 01', type: 'charge', x: 1080, y: 690 },
  { id: 't-r1', label: 'T001', type: 'truck', x: 1005, y: 205 },
  { id: 't-r2', label: 'T001', type: 'truck', x: 1020, y: 315 },
  { id: 't-r3', label: 'T001', type: 'truck', x: 1135, y: 375 },
  { id: 't-r4', label: 'T001', type: 'truck', x: 1080, y: 590 },
]

const topologyEdges = [
  ['rtg-a', 't004'], ['rtg-a', 't003a'], ['rtg-a', 'block2'], ['rtg-b', 'block2'], ['rtg-b', 't002'], ['rtg-b', 't003b'],
  ['t004', 'qc-a'], ['t004', 'block1'], ['t003a', 'qc-a'], ['t002', 'qc-b'], ['qc-a', 'ship'], ['qc-b', 'ship'],
  ['qc-b', 'block3a'], ['t001a', 'block3a'], ['block3a', 't008'], ['t008', 'qc-c'], ['block3a', 'rtg-e'],
  ['block1', 'rtg-c'], ['rtg-c', 't001b'], ['ship', 'qc-c'], ['ship', 'qc-d'], ['qc-d', 't005'], ['qc-d', 't006'],
  ['qc-d', 't007'], ['t007', 'block3b'], ['block3b', 'rtg-d'], ['block3b', 'rtg-e'], ['rtg-e', 't001c'], ['rtg-e', 't001d'],
  ['t-r1', 'swap'], ['t-r2', 'swap'], ['t-r3', 'swap'], ['t-r4', 'charge'],
]

function App() {
  const [page, setPage] = useState<PageKey>('efficiency')
  const [range, setRange] = useState('1天')
  const [refreshTick, setRefreshTick] = useState(0)

  const Page = {
    efficiency: EfficiencyPage,
    network: NetworkPage,
    dispatch: DispatchPage,
    energy: EnergyPage,
  }[page]

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">ReeWell World <span /> <em>KPI</em></div>
        <nav className="tabs" aria-label="主导航">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button key={tab.key} className={clsx('tab', page === tab.key && 'active')} onClick={() => setPage(tab.key)}>
                <Icon size={20} strokeWidth={2} />
                {tab.label}
              </button>
            )
          })}
        </nav>
        <div className="top-actions">
          <div className="alert-pill"><AlertTriangle size={16} fill="#ff6262" color="#ff6262" />QC301效率 25.4箱/h，低于阈值30箱/h</div>
          <button className="round"><Bell size={18} /></button>
          <button className="round"><Anchor size={18} /></button>
          <button className="round"><Clock3 size={18} /></button>
          <div className="avatar" />
        </div>
      </header>
      <main>
        <FilterBar range={range} setRange={setRange} onRefresh={() => setRefreshTick((item) => item + 1)} />
        <Page refreshTick={refreshTick} />
      </main>
    </div>
  )
}

function FilterBar({ range, setRange, onRefresh }: { range: string; setRange: (value: string) => void; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false)

  function query() {
    setLoading(true)
    onRefresh()
    window.setTimeout(() => setLoading(false), 320)
  }

  return (
    <section className="filter-shell">
      <div className="segment">
        {timeOptions.map((option, index) => (
          <button key={option} className={clsx(range === option && 'selected')} onClick={() => setRange(option)}>
            {option}
            {index < timeOptions.length - 1 && <i />}
          </button>
        ))}
      </div>
      <div className="date-pill"><CalendarDays size={16} />开始时间 <span>~</span> 结束时间</div>
      <button className={clsx('query', loading && 'loading')} onClick={query}><Search size={16} />查询</button>
      <button className="reset" onClick={() => { setRange('1天'); onRefresh() }}><RotateCcw size={16} />重置</button>
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

function EfficiencyPage({ refreshTick }: { refreshTick: number }) {
  return (
    <div className="page efficiency-page" data-refresh={refreshTick}>
      <Panel className="work-panel">
        <div className="total-work">
          <PanelTitle icon={<BarChart3 size={16} />} title={workSummary.total.title} />
          <Metric label={workSummary.total.totalLabel} value={workSummary.total.teu} unit="TEU" big />
          <div className="metric-row two">
            <Metric label="自然箱量" value={workSummary.total.natural} unit="箱" />
            <Metric label="车辆循环" value={workSummary.total.loop} unit="循环" />
          </div>
          <BoxSplit values={workSummary.total.boxes} />
          <div className="mini-job-grid">
            <span>装船 <b>4500</b> TEU</span><span>卸船 <b>4800</b> TEU</span>
            <span>转堆 <b>3200</b> TEU</span><span>未知 <b>12,830</b> TEU</span>
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
            ['岸桥总数', '8', '台'], ['参与作业船舶总数', '1', '艘'], ['参与作业时长', '2,000', '小时'], ['场桥总数', '8', '台'], ['车辆总数', '200', '辆'],
            ['参与作业车辆总数', '8', '台'], ['全部车辆作业时间', '186', '小时'], ['车辆故障圈数', '2', '圈'], ['总故障时间', '2', '小时'], ['MMBF(平均无故障运行里程)', '5,999', 'km'],
          ]} />
          <h4>单车作业统计</h4>
          <StatStrip compact items={[
            ['平均每车作业时间', '3.21', '小时'], ['平均每圈时长', '20.12', '分钟'], ['平均每圈停车等待时间', '20.12', '分钟'], ['每圈平均里程', '19.2', 'km'], ['空驶里程', '20', 'km'],
          ]} />
          <h4>单车平均效率</h4>
          <StatStrip compact items={[
            ['', '8', '循环/小时'], ['', '1', 'TEU/h'], ['', '2,000', '自然盟/小时'], ['', '8', '分(20尺箱)'], ['', '8', '分(40尺箱)'],
          ]} />
        </Panel>
      </div>

      <div className="side-charts">
        <ChartCard title="车辆平均效率" unit="圈数/小时" badge="平均效率 34.7 圈数/小时" action="全部车辆" />
        <ChartCard title="车辆平均空驶率" unit="%" badge="平均空驶率 34.7 %" action="全部车辆" />
      </div>

      <div className="bottom-charts">
        <ChartCard title="岸桥效率" unit="TEU" badge="平均效率 34.7 TEU/h" action="全部岸桥" />
        <ChartCard title="场桥效率" unit="TEU" badge="平均效率 34.7 TEU/h" action="全部场桥" />
        <WaitBarChart />
      </div>
    </div>
  )
}

function Metric({ label, value, unit, big = false }: { label: string; value: string; unit: string; big?: boolean }) {
  return <div className="metric"><small>{label}</small><strong className={clsx(big && 'big')}>{value}</strong><span>{unit}</span></div>
}

function BoxSplit({ values }: { values: string[] }) {
  return (
    <div className="box-split">
      {['20尺箱', '40尺箱', '45尺箱'].map((label, index) => (
        <div key={label}><small>{label}</small><b>{values[index]}</b><span>箱</span></div>
      ))}
    </div>
  )
}

function StatStrip({ items, compact = false }: { items: Array<[string, string, string]>; compact?: boolean }) {
  return <div className={clsx('stat-strip', compact && 'compact')}>{items.map(([label, value, unit], index) => (
    <div className="stat-item" key={`${label}-${index}`}><small>{label || '\u00A0'}</small><strong>{value}</strong><span>{unit}</span></div>
  ))}</div>
}

function DeviceSelect({ label }: { label: string }) {
  return <button className="select-pill">{label}<ChevronDown size={15} /></button>
}

function ChartCard({ title, unit, badge, action }: { title: string; unit: string; badge: string; action: string }) {
  return (
    <Panel className="chart-panel">
      <PanelTitle icon={<LineChart size={16} />} title={title} badge={badge} action={<DeviceSelect label={action} />} />
      <div className="chart-legend"><span className="gray-dot">调度前效率</span><span className="green-dot">调度后效率</span></div>
      <div className="axis-label">{unit}</div>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={curveData} margin={{ left: -22, right: 10, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="7 9" vertical={false} stroke="#d5d9de" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={{ stroke: '#d8dce2' }} tickLine={{ stroke: '#d8dce2' }} />
          <YAxis tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={false} tickLine={false} domain={[0, 60]} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="after" fill="#19d98f18" stroke="#19d98f" strokeWidth={2.1} dot={{ r: 3, fill: '#fff', strokeWidth: 1.6 }} />
          <Line type="monotone" dataKey="before" stroke="#858c8c" strokeWidth={2} dot={{ r: 3, fill: '#fff', strokeWidth: 1.4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  const after = payload.find((item) => item.dataKey === 'after')?.value
  const before = payload.find((item) => item.dataKey === 'before')?.value
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

function WaitBarChart() {
  return (
    <Panel className="chart-panel">
      <PanelTitle icon={<Car size={16} />} title="车辆平均等待时间" badge="平均等待时间 46 秒/循环" action={<DeviceSelect label="全部车辆" />} />
      <div className="chart-legend"><span className="gray-dot">调度前等待时间</span><span className="green-dot">调度后等待时间</span></div>
      <div className="axis-label">秒/循环</div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={curveData} margin={{ left: -22, right: 10, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="7 9" vertical={false} stroke="#d5d9de" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={{ stroke: '#d8dce2' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="a" fill="#858c8c" radius={[3, 3, 0, 0]} barSize={10} />
          <Bar dataKey="b" fill="#19d98f" radius={[3, 3, 0, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

function NetworkPage() {
  const [selected, setSelected] = useState<string | null>('ship')
  const [legend, setLegend] = useState(false)
  const nodeMap = useMemo(() => new Map(topologyNodes.map((node) => [node.id, node])), [])

  return (
    <div className="page network-page">
      <Panel className="network-panel">
        <svg className="network-svg" viewBox="0 0 1220 760" role="img" aria-label="关系网拓扑图">
          <defs>
            <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#dde5ef" />
            </pattern>
          </defs>
          <rect width="1220" height="760" fill="url(#dots)" />
          {topologyEdges.map(([source, target], index) => {
            const a = nodeMap.get(source)!
            const b = nodeMap.get(target)!
            const active = source === selected || target === selected
            return <line key={`${source}-${target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={clsx('edge', active && 'active', index % 7 === 0 && 'dashed')} />
          })}
          {topologyNodes.map((node) => <TopologyNode key={node.id} node={node} selected={selected === node.id} onClick={() => setSelected(node.id)} />)}
        </svg>
        {selected && <div className="node-pop"><b>{nodeMap.get(selected)?.label}</b><span>任务链路正常</span><small>当前效率 34.7 TEU/h</small></div>}
        <button className="legend-button" onClick={() => setLegend((value) => !value)}><Info size={15} />图例 <ChevronDown size={14} /></button>
        {legend && <div className="legend-pop">
          <span><i className="truck" />车辆</span><span><i className="qc" />岸桥</span><span><i className="rtg" />场桥</span><span><i className="block" />箱区</span>
        </div>}
      </Panel>
    </div>
  )
}

function TopologyNode({ node, selected, onClick }: { node: { id: string; label: string; type: string; x: number; y: number }; selected: boolean; onClick: () => void }) {
  const Icon = node.type === 'truck' ? Car : node.type === 'qc' ? Factory : node.type === 'rtg' ? LandPlot : node.type === 'block' ? Blocks : node.type === 'ship' ? Ship : node.type === 'charge' ? Zap : BatteryCharging
  return (
    <g className={clsx('topology-node', node.type, selected && 'selected')} transform={`translate(${node.x} ${node.y})`} onClick={onClick}>
      <circle r="15" />
      <Icon x={-8} y={-8} size={16} strokeWidth={2} color="#fff" />
      <text y="34">{node.label}</text>
    </g>
  )
}

function DispatchPage() {
  return (
    <div className="page dispatch-page">
      <Panel className="dispatch-card">
        <div className="wide-chart">
          <PanelTitle icon={<SlidersHorizontal size={16} />} title="算法效率提升对比" />
          <div className="chart-legend"><span className="gray-dot">未使用算法预测结果</span><span className="green-dot">Hymala 优化调度后</span></div>
          <div className="axis-label">TEU/小时</div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={hourlyData} margin={{ left: -22, right: 0, top: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="8 9" vertical={false} stroke="#d8dce2" />
              <XAxis dataKey="time" interval={1} tick={{ fontSize: 10, fill: '#7c838c' }} tickLine={false} axisLine={{ stroke: '#d8dce2' }} />
              <YAxis tick={{ fontSize: 10, fill: '#7c838c' }} axisLine={false} tickLine={false} domain={[0, 60]} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="after" fill="#19d98f18" stroke="#19d98f" strokeWidth={2.1} dot={{ r: 2.8, fill: '#fff' }} />
              <Line type="monotone" dataKey="before" stroke="#858c8c" strokeWidth={2} dot={{ r: 2.8, fill: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mini-cards">
          {[
            ['算法统计', '124', '次', '+8.2%'], ['Hymala', '124', '次', '+12.2%'], ['OR', '124', '次', '+8.2%'], ['混合', '124', '次', '-1%'],
          ].map(([title, value, unit, delta]) => <div className="analysis-card" key={title}><b>{title}</b><span>调用次数</span><strong>{value} <em>{unit}</em></strong><i className={delta.startsWith('-') ? 'bad' : ''}>{delta}</i><small>效率提升</small></div>)}
        </div>
      </Panel>
      <Panel className="dispatch-card">
        <div className="wide-chart">
          <PanelTitle icon={<SlidersHorizontal size={16} />} title="Hymala 世界模型稳定性波动曲线" />
          <div className="axis-label">响应时间(ms)</div>
          <ResponsiveContainer width="100%" height={230}>
            <ReLineChart data={hourlyData} margin={{ left: -22, right: 0, top: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="8 9" vertical={false} stroke="#d8dce2" />
              <XAxis dataKey="time" interval={1} tick={{ fontSize: 10, fill: '#7c838c' }} tickLine={false} axisLine={{ stroke: '#d8dce2' }} />
              <YAxis tick={{ fontSize: 10, fill: '#7c838c' }} axisLine={false} tickLine={false} domain={[0, 600]} />
              <Tooltip content={<LatencyTooltip />} />
              <Line type="monotone" dataKey="latency" stroke="#858c8c" strokeWidth={2} dot={{ r: 3, fill: '#fff' }} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
        <div className="mini-cards">
          {[
            ['接口调用成功率', '99.92', '%', '↑ 0.18%'], ['服务响应时延', '426', 'ms', '↓ 23ms'], ['接口调用总次数', '2,000', '次', '↑ 0.8%'], ['服务超时率', '2', '%', '↓ 0.8%'],
          ].map(([title, value, unit, delta]) => <div className="service-card" key={title}><span>{title}</span><strong>{value} <em>{unit}</em></strong><small>较昨日 <i className={delta.includes('↓') ? 'down' : ''}>{delta}</i></small></div>)}
        </div>
      </Panel>
      <Panel className="timeline-panel">
        <PanelTitle icon={<GitBranch size={16} />} title="二次调度分析" badge="每色块代表一次调度事件　今日触发 47 次" />
        <div className="timeline">
          <div className="time-axis">{['13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55', '14:00', '14:05', '14:10', '14:15', '14:20', '14:25', '14:30', '14:35'].map((item) => <span key={item}>{item}</span>)}</div>
          <div className="event-row"><b>工况</b><i className="now">13:08</i>{[
            ['卸船换桥', 10, 8, '#83e9d4'], ['重进重出', 23, 9, '#87d9ee'], ['路口拥堵', 34, 8, '#b8c4ff'], ['卸船岸桥任务调序', 47, 14, '#ffdcb2'], ['装船变更场桥', 63, 12, '#8ce8be'], ['堆场翻倒', 77, 9, '#ffc6b4'], ['船舶配载变更', 91, 11, '#fff29c'],
          ].map(([label, left, width, color]) => <button key={label} className="event-pill" style={{ left: `${left}%`, width: `${width}%`, background: color }}><span>✓</span>{label}</button>)}</div>
        </div>
      </Panel>
    </div>
  )
}

function LatencyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="tooltip-card"><b>{label}</b><p>响应时间：{payload[0].value}ms</p><p>模型状态：稳定</p></div>
}

function EnergyPage() {
  return (
    <div className="page energy-page">
      <Panel className="energy-structure">
        {energySegments.map((segment) => <EnergySegment key={segment.title} segment={segment} />)}
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
        <StatStrip items={[['调度前总电费', '6,351', '元'], ['调度后总电费', '5,021', '元'], ['节省金额', '1,330', '元'], ['平均电价', '0.45', '元/km'], ['避峰率', '42', '%']]} />
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
      <PanelTitle icon={<Leaf size={16} />} title={segment.title} action={<div className="segment-total"><strong>{segment.value}</strong> {segment.unit}</div>} />
      <div className="stack-bar">
        {segment.values.map((value, index) => <div key={value} style={{ width: `${segment.widths[index]}%`, background: segmentColors[index] }}><b>{value}</b></div>)}
      </div>
      <div className="segment-labels">{segmentNames.map((name) => <span key={name}>{name}</span>)}</div>
      <div className="energy-mix">{['柴油', '火力', '绿电'].map((type, row) => <div key={type}><b>{type}</b>{segmentNames.map((name) => <span key={name}>{row === 2 ? '40%' : '30%'}</span>)}</div>)}</div>
    </div>
  )
}

function EnergyLineChart() {
  return (
    <>
      <div className="chart-legend"><span className="gray-dot">调度前能耗</span><span className="green-dot">调度后能耗</span></div>
      <div className="axis-label">总能耗（kWh）</div>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={energyTrend} margin={{ left: -22, right: 8, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="8 9" vertical={false} stroke="#d8dce2" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#7c838c' }} axisLine={{ stroke: '#d8dce2' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#7c838c' }} axisLine={false} tickLine={false} domain={[0, 70]} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="after" fill="#19d98f16" stroke="#19d98f" strokeWidth={2.1} dot={{ r: 3, fill: '#fff' }} />
          <Line type="monotone" dataKey="before" stroke="#858c8c" strokeWidth={2} dot={{ r: 3, fill: '#fff' }} />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}

function TariffTable() {
  return <table className="tariff-table"><thead><tr><th /><th />{tariffColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{tariffRows.map((row, index) => <tr key={`${row.group}-${row.label}`}><th>{index % 2 === 0 ? row.group.split('\n').map((line) => <span key={line}>{line}</span>) : ''}</th><td>{row.label}</td>{row.values.map((value) => <td key={value} className={clsx(value.includes('↑') && 'up', value.includes('↓') && 'down')}>{value}</td>)}</tr>)}</tbody></table>
}

function VehicleTable() {
  return <table className="vehicle-table"><thead><tr><th rowSpan={2}>设备</th><th colSpan={2}>能耗(kWh/100km)</th><th colSpan={2}>成本(元/100km)</th><th colSpan={2}>碳排(kgCO₂/100km)</th></tr><tr><th>调度前</th><th>调度后</th><th>调度前</th><th>调度后</th><th>调度前</th><th>调度后</th></tr></thead><tbody>{vehicleRows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.energy}</td><td>{row.energy}</td><td>{row.cost}</td><td>{row.cost}</td><td>{row.carbon}</td><td>{row.carbon}</td></tr>)}</tbody></table>
}

export default App
