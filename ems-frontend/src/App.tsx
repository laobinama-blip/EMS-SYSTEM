import { type ReactNode, useEffect, useMemo, useState } from 'react'
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
  Factory,
  Gauge,
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
  X,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
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
  { key: 'energy', label: '能源与碳排', icon: Lightbulb },
]

const timeOptions = ['2h', '8h', '1天', '3 天', '7 天', '自定义']

const curveData = [
  { time: '0', before: 36, after: 40, waitBefore: 38, waitAfter: 67 },
  { time: '4', before: 25, after: 32, waitBefore: 32, waitAfter: 58 },
  { time: '8', before: 23, after: 27, waitBefore: 29, waitAfter: 51 },
  { time: '12', before: 29, after: 32, waitBefore: 41, waitAfter: 73 },
  { time: '16', before: 40, after: 43, waitBefore: 18, waitAfter: 32 },
  { time: '4-26', before: 46, after: 49, waitBefore: 44, waitAfter: 57 },
  { time: '4-27', before: 38, after: 42, waitBefore: 36, waitAfter: 63 },
]

const hourlyData = Array.from({ length: 25 }, (_, index) => {
  const before = 24 + Math.sin(index / 0.85) * 6 + Math.sin(index / 2.15) * 5
  return {
    time: `${String(index).padStart(2, '0')}:00`,
    before: Math.max(10, Math.round(before)),
    after: Math.max(29, Math.round(33 + index * 0.45 + Math.sin(index / 1.3) * 3)),
    latency: Math.round(330 + Math.sin(index / 1.2) * 54 + Math.sin(index / 3.5) * 72),
  }
})

const simpleDailyData = [
  { time: '00:00', value: 3.2 },
  { time: '04:00', value: 2.2 },
  { time: '08:00', value: 2.0 },
  { time: '12:00', value: 2.2 },
  { time: '16:00', value: 3.2 },
  { time: '20:00', value: 4.0 },
  { time: '24:00', value: 3.7 },
]

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
    unit: 'tCO₂/TEU',
    values: ['0.542', '0.642', '0.612', '0.72'],
    widths: [24, 15, 27, 34],
  },
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

const vehicleRows = ['T001', 'T010', 'T009', 'T002', 'T003'].map((id, index) => ({
  id,
  energy: (32.4 - index * 0.4).toFixed(1),
  cost: (25.8 - index * 0.55).toFixed(1),
  carbon: '14.8',
}))

const topologyNodes = [
  { id: 'rtg-a', label: 'RTG01', type: 'rtg', x: 150, y: 300 },
  { id: 'rtg-b', label: 'RTG02', type: 'rtg', x: 95, y: 520 },
  { id: 't004', label: 'T004', type: 'truck', x: 315, y: 145 },
  { id: 't003a', label: 'T003', type: 'truck', x: 292, y: 335 },
  { id: 'block2', label: 'Block 2', type: 'block', x: 240, y: 420 },
  { id: 't002', label: 'T002', type: 'truck', x: 220, y: 500 },
  { id: 't003b', label: 'T003', type: 'truck', x: 175, y: 690 },
  { id: 'qc-a', label: 'QC301', type: 'qc', x: 385, y: 230 },
  { id: 'ship', label: '船舶', type: 'ship', x: 505, y: 350 },
  { id: 'qc-b', label: 'QC301', type: 'qc', x: 375, y: 430 },
  { id: 'block3a', label: 'Block 3', type: 'block', x: 410, y: 525 },
  { id: 't001a', label: 'T001', type: 'truck', x: 295, y: 555 },
  { id: 't008', label: 'T008', type: 'truck', x: 470, y: 490 },
  { id: 'block1', label: 'Block 1', type: 'block', x: 485, y: 225 },
  { id: 'rtg-c', label: 'RTG01', type: 'rtg', x: 565, y: 165 },
  { id: 'qc-c', label: 'QC301', type: 'qc', x: 635, y: 395 },
  { id: 'qc-d', label: 'QC301', type: 'qc', x: 675, y: 225 },
  { id: 't007', label: 'T007', type: 'truck', x: 705, y: 480 },
  { id: 't001b', label: 'T001', type: 'truck', x: 735, y: 150 },
  { id: 't005', label: 'T005', type: 'truck', x: 790, y: 325 },
  { id: 't006', label: 'T006', type: 'truck', x: 785, y: 435 },
  { id: 'block3b', label: 'Block 3', type: 'block', x: 765, y: 570 },
  { id: 'rtg-d', label: 'RTG01', type: 'rtg', x: 880, y: 390 },
  { id: 'rtg-e', label: 'RTG01', type: 'rtg', x: 835, y: 635 },
  { id: 't001c', label: 'T001', type: 'truck', x: 925, y: 505 },
  { id: 't001d', label: 'T001', type: 'truck', x: 965, y: 620 },
  { id: 'swap', label: '换电站', type: 'swap', x: 1135, y: 220 },
  { id: 'charge', label: '充电桩 01', type: 'charge', x: 1090, y: 690 },
  { id: 't-r1', label: 'T001', type: 'truck', x: 1010, y: 205 },
  { id: 't-r2', label: 'T001', type: 'truck', x: 1025, y: 315 },
  { id: 't-r3', label: 'T001', type: 'truck', x: 1155, y: 375 },
  { id: 't-r4', label: 'T001', type: 'truck', x: 1090, y: 590 },
]

const topologyEdges = [
  ['rtg-a', 't004'], ['rtg-a', 't003a'], ['rtg-a', 'block2'], ['rtg-b', 'block2'], ['rtg-b', 't002'], ['rtg-b', 't003b'],
  ['t004', 'qc-a'], ['t004', 'block1'], ['t003a', 'qc-a'], ['t002', 'qc-b'], ['qc-a', 'ship'], ['qc-b', 'ship'],
  ['qc-b', 'block3a'], ['t001a', 'block3a'], ['block3a', 't008'], ['t008', 'qc-c'], ['block3a', 'rtg-e'],
  ['block1', 'rtg-c'], ['rtg-c', 't001b'], ['ship', 'qc-c'], ['ship', 'qc-d'], ['qc-d', 't005'], ['qc-d', 't006'],
  ['qc-d', 't007'], ['t007', 'block3b'], ['block3b', 'rtg-d'], ['block3b', 'rtg-e'], ['rtg-e', 't001c'], ['rtg-e', 't001d'],
  ['t-r1', 'swap'], ['t-r2', 'swap'], ['t-r3', 'swap'], ['t-r4', 'charge'],
]

const pieData = [
  { name: '卸船换桥', value: 35, color: '#46bdf2' },
  { name: '重进重出', value: 25, color: '#887bf3' },
  { name: '路口拥堵', value: 18, color: '#cf6cf0' },
  { name: '卸船岸桥任务调序', value: 12, color: '#82b640' },
  { name: '装船变更场桥', value: 6, color: '#66cad8' },
  { name: '堆场翻倒', value: 3, color: '#f0a43a' },
  { name: '船舶配载变更', value: 1, color: '#2f99f2' },
]

function App() {
  const [page, setPage] = useState<PageKey>(() => {
    const hash = window.location.hash.replace('#', '') as PageKey
    return tabs.some((tab) => tab.key === hash) ? hash : 'efficiency'
  })
  const [range, setRange] = useState('1天')
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageKey
      if (tabs.some((tab) => tab.key === hash)) setPage(hash)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const Page = {
    efficiency: EfficiencyPage,
    network: NetworkPage,
    dispatch: DispatchPage,
    energy: EnergyPage,
  }[page]

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><img src={logoKpiUrl} alt="ReeWell World KPI" /></div>
        <nav className="tabs" aria-label="主导航">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button key={tab.key} className={clsx('tab', page === tab.key && 'active')} onClick={() => { setPage(tab.key); window.location.hash = tab.key }}>
                <Icon size={20} strokeWidth={2} />
                {tab.label}
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
      <div className="date-pill"><CalendarDays size={16} />开始时间<span>~</span>结束时间</div>
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
            ['', '8', '循环/小时'], ['', '1', 'TEU/h'], ['', '2,000', '自然箱/小时'], ['', '8', '分(20尺箱)'], ['', '8', '分(40尺箱)'],
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
  const [open, setOpen] = useState(false)
  return (
    <span className="select-wrap">
      <button className="select-pill" onClick={() => setOpen((value) => !value)}>{label}<ChevronDown size={15} /></button>
      {open && <span className="select-menu"><button>{label}</button><button>QC301</button><button>RTG01</button></span>}
    </span>
  )
}

function ChartCard({ title, unit, badge, action }: { title: string; unit: string; badge: string; action: string }) {
  return (
    <Panel className="chart-panel">
      <PanelTitle icon={<LineChart size={16} />} title={title} badge={badge} action={<DeviceSelect label={action} />} />
      <Legend gray="调度前效率" green="调度后效率" />
      <div className="axis-label">{unit}</div>
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
    </Panel>
  )
}

function Legend({ gray, green }: { gray: string; green: string }) {
  return <div className="chart-legend"><span className="gray-dot">{gray}</span><span className="green-dot">{green}</span></div>
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
      <Legend gray="调度前等待时间" green="调度后等待时间" />
      <div className="axis-label">秒/循环</div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={curveData} margin={{ left: -22, right: 10, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="7 9" vertical={false} stroke="#d5d9de" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={{ stroke: '#d8dce2' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#8b929a' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar isAnimationActive={false} dataKey="waitBefore" fill="#858c8c" radius={[3, 3, 0, 0]} barSize={10} />
          <Bar isAnimationActive={false} dataKey="waitAfter" fill="#19d98f" radius={[3, 3, 0, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

function NetworkPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [legend, setLegend] = useState(false)
  const [taskMode, setTaskMode] = useState(false)
  const nodeMap = useMemo(() => new Map(topologyNodes.map((node) => [node.id, node])), [])
  const activeNode = taskMode ? 'rtg-d' : selected

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
          <button className="ghost-filter" onClick={() => setTaskMode((value) => !value)}>{taskMode ? '退出任务态' : '任务态'}</button>
        </div>
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
            const active = source === activeNode || target === activeNode || (taskMode && ['ship', 'qc-d', 't005', 'rtg-d'].includes(source) && ['ship', 'qc-d', 't005', 'rtg-d'].includes(target))
            return <line key={`${source}-${target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={clsx('edge', active && 'active', index % 7 === 0 && 'dashed')} />
          })}
          {topologyNodes.map((node) => <TopologyNode key={node.id} node={node} faded={taskMode && !['ship', 'qc-d', 't005', 'rtg-d'].includes(node.id)} selected={activeNode === node.id} onClick={() => setSelected(node.id)} />)}
        </svg>
        {(selected || taskMode) && (
          <div className="node-pop">
            <button className="pop-close" onClick={() => { setSelected(null); setTaskMode(false) }}><X size={16} /></button>
            <h3>RTG01 <span>装箱</span></h3>
            <dl>
              <dt>任务信息</dt><dd>Task05</dd>
              <dt>效率值</dt><dd>26.8TEU/h</dd>
              <dt>瞬时功率</dt><dd>132kw</dd>
              <dt>能耗值</dt><dd>72kwh/</dd>
              <dt>碳排放</dt><dd>0.72tCO₂</dd>
            </dl>
          </div>
        )}
        <button className="legend-button" onClick={() => setLegend((value) => !value)}><Info size={15} />图例 <ChevronDown size={14} /></button>
        {legend && <div className="legend-pop">
          <span><i className="truck" />车辆</span><span><i className="qc" />岸桥/船舶</span><span><i className="rtg" />场桥</span><span><i className="block" />箱区</span>
        </div>}
      </Panel>
    </div>
  )
}

function TopologyNode({ node, selected, faded, onClick }: { node: { id: string; label: string; type: string; x: number; y: number }; selected: boolean; faded: boolean; onClick: () => void }) {
  const Icon = node.type === 'truck' ? Car : node.type === 'qc' ? Factory : node.type === 'rtg' ? LandPlot : node.type === 'block' ? Blocks : node.type === 'ship' ? Ship : node.type === 'charge' ? Zap : BatteryCharging
  return (
    <g className={clsx('topology-node', node.type, selected && 'selected', faded && 'faded')} transform={`translate(${node.x} ${node.y})`} onClick={onClick}>
      <circle r="15" />
      <Icon x={-8} y={-8} size={16} strokeWidth={2} color="#fff" />
      <text y="34">{node.label}</text>
    </g>
  )
}

function DispatchPage() {
  return (
    <div className="page dispatch-page">
      <Panel className="timeline-panel first">
        <PanelTitle title="二次调度分析" badge="每色块代表一次调度事件　今日触发 47 次" />
        <Timeline />
      </Panel>

      <div className="dispatch-grid">
        <Panel className="pie-panel">
          <PanelTitle title="工况类别占比" />
          <div className="pie-layout">
            <ResponsiveContainer width="43%" height={250}>
              <PieChart>
                <Pie isAnimationActive={false} dataKey="value" data={pieData} outerRadius={90} labelLine={false}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-side">
              <div className="dispatch-summary"><Metric label="调度次数" value="200" unit="次" /><Metric label="工况类型" value="7" unit="种" /><Metric label="TOP1工况" value="卸船换桥" unit="" /></div>
              <div className="pie-legend">
                {pieData.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.value === 35 ? '70次' : item.value === 25 ? '50次' : `${Math.max(2, item.value * 2)}次`}</b><em>{item.value}%</em></span>)}
              </div>
            </div>
          </div>
        </Panel>
        <Panel className="small-line-panel">
          <PanelTitle title="每小时调度频率" />
          <SimpleBlueChart unit="次" />
        </Panel>
      </div>

      <div className="dispatch-grid bottom">
        <Panel className="dispatch-card compact">
          <div className="wide-chart">
            <PanelTitle icon={<SlidersHorizontal size={16} />} title="算法效率提升对比" />
            <Legend gray="常规调度" green="动态调度" />
            <div className="axis-label">TEU/小时</div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={hourlyData.filter((_, index) => index % 4 === 0)} margin={{ left: -22, right: 0, top: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="8 9" vertical={false} stroke="#d8dce2" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#7c838c' }} tickLine={false} axisLine={{ stroke: '#d8dce2' }} />
                <YAxis tick={{ fontSize: 10, fill: '#7c838c' }} axisLine={false} tickLine={false} domain={[0, 60]} />
                <Tooltip content={<ChartTooltip />} />
                <Area isAnimationActive={false} type="monotone" dataKey="after" fill="#19d98f18" stroke="#19d98f" strokeWidth={2.1} dot={{ r: 2.8, fill: '#fff' }} />
                <Line isAnimationActive={false} type="monotone" dataKey="before" stroke="#2f9bff" strokeWidth={2} dot={{ r: 2.8, fill: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mini-cards">
            {[
              ['算法统计', '124', '次', '+8.2%'], ['MARL', '124', '次', '+12.2%'], ['OR', '124', '次', '+8.2%'], ['混合', '124', '次', '+15.4%'],
            ].map(([title, value, unit, delta]) => <div className="analysis-card" key={title}><b>{title}</b><span>调用次数</span><strong>{value} <em>{unit}</em></strong><i>{delta}</i><small>效率提升</small></div>)}
          </div>
        </Panel>
        <Panel className="manual-panel">
          <PanelTitle title="人工干预调度率" />
          <div className="manual-summary"><Metric label="当前班次人工干预率" value="12.7" unit="%" /><Metric label="系统推荐调度" value="175" unit="次" /><Metric label="人工覆盖/修改/取消" value="23" unit="次" /></div>
          <SimpleBlueChart unit="%" />
        </Panel>
      </div>
    </div>
  )
}

function Timeline() {
  const events: Array<[string, number, number, string, boolean]> = [
    ['卸船换桥', 10, 8, '#83e9d4', true],
    ['重进重出', 23, 9, '#87d9ee', true],
    ['路口拥堵', 34, 8, '#b8c4ff', true],
    ['卸船岸桥任务调序', 47, 14, '#ffdcb2', true],
    ['装船变更场桥', 63, 12, '#8ce8be', true],
    ['堆场翻倒', 77, 9, '#ffc6b4', false],
    ['船舶配载变更', 91, 11, '#fff29c', true],
  ]

  return (
    <div className="timeline">
      <div className="time-axis">{['13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40', '13:45', '13:50', '13:55', '14:00', '14:05', '14:10', '14:15', '14:20', '14:25', '14:30', '14:35'].map((item) => <span key={item}>{item}</span>)}</div>
      <div className="event-row"><b>工况</b><i className="now">13:08</i>{events.map(([label, left, width, color, ok]) => <button key={label} className="event-pill" style={{ left: `${left}%`, width: `${width}%`, background: color }}>{ok ? <Check size={15} /> : <CircleX size={15} />}{label}</button>)}</div>
    </div>
  )
}

function SimpleBlueChart({ unit }: { unit: string }) {
  return (
    <>
      <div className="chart-legend blue"><span>调度频次</span></div>
      <div className="axis-label">{unit}</div>
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={simpleDailyData} margin={{ left: -22, right: 4, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="8 9" vertical={false} stroke="#d8dce2" />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#7c838c' }} tickLine={false} axisLine={{ stroke: '#d8dce2' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7c838c' }} axisLine={false} tickLine={false} domain={[0, unit === '%' ? 30 : 5]} />
          <Tooltip />
          <Area isAnimationActive={false} type="monotone" dataKey="value" fill="#2f9bff18" stroke="#2f9bff" strokeWidth={2.2} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
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
  return <table className="tariff-table"><thead><tr><th /><th />{tariffColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{tariffRows.map((row, index) => <tr key={`${row.group}-${row.label}`}><th>{index % 2 === 0 ? row.group.split('\n').map((line) => <span key={line}>{line}</span>) : ''}</th><td>{row.label}</td>{row.values.map((value) => <td key={value} className={clsx(value.includes('↑') && 'up', value.includes('↓') && 'down')}>{value}</td>)}</tr>)}</tbody></table>
}

function VehicleTable() {
  return <table className="vehicle-table"><thead><tr><th rowSpan={2}>设备</th><th colSpan={2}>能耗(kWh/100km)</th><th colSpan={2}>成本(元/100km)</th><th colSpan={2}>碳排(kgCO₂/100km)</th></tr><tr><th>调度前</th><th>调度后</th><th>调度前</th><th>调度后</th><th>调度前</th><th>调度后</th></tr></thead><tbody>{vehicleRows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.energy}</td><td>{row.energy}</td><td>{row.cost}</td><td>{row.cost}</td><td>{row.carbon}</td><td>{row.carbon}</td></tr>)}</tbody></table>
}

export default App
