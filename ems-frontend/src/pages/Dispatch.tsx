import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { getRequest } from '../services/apiClient';
import {
  ALGORITHM_EFFICIENCY,
  HYMALA_STABILITY,
  SECONDARY_EVENTS
} from '../mocks/fixtures';
import type { SecondaryEvent } from '../mocks/fixtures';

interface DispatchProps {
  filters: any;
  loading: boolean;
  setLoading: (l: boolean) => void;
}

export const Dispatch: React.FC<DispatchProps> = ({ filters, loading, setLoading }) => {
  const [efficiencyData, setEfficiencyData] = useState(ALGORITHM_EFFICIENCY);
  const [stabilityData, setStabilityData] = useState(HYMALA_STABILITY);
  const [events, setEvents] = useState(SECONDARY_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<SecondaryEvent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const eff = await getRequest<typeof ALGORITHM_EFFICIENCY>('/dispatch/algorithm-efficiency', filters);
        const stab = await getRequest<typeof HYMALA_STABILITY>('/dispatch/hymala-stability', filters);
        const evts = await getRequest<typeof SECONDARY_EVENTS>('/dispatch/secondary-events', filters);
        setEfficiencyData(eff);
        setStabilityData(stab);
        setEvents(evts);
      } catch (err) {
        console.error('Error fetching dispatch data:', err);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };
    fetchData();
  }, [filters, setLoading]);

  // Gantt chart base settings
  const startBase = 1779416697; // May 22 2026 base
  const totalWindowSeconds = 6000; // 100 minutes window

  // Formatter for timestamp to HH:mm:ss
  const formatEpochTime = (epoch: number) => {
    const date = new Date(epoch * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const getGanttColorClass = (eventName: string) => {
    if (eventName.includes('耳轴')) return 'gantt-ear';
    if (eventName.includes('等待')) return 'gantt-reset';
    if (eventName.includes('重选')) return 'gantt-exit';
    return 'gantt-block';
  };

  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-title">{`时间: ${label}`}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="tooltip-row">
              <span style={{ color: entry.stroke || entry.fill, fontWeight: 600 }}>{entry.name}:</span>
              <span style={{ fontWeight: 700 }}>{entry.value}{entry.unit || ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Group events by device code
  const devices = ['T101', 'T102', 'T103', 'T104', 'T105', 'QC301'];

  // Gantt time ticks (11 ticks from 0 to 100 minutes)
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const seconds = i * 600;
    const timeString = formatEpochTime(startBase + seconds).substring(0, 5);
    return {
      percent: (seconds / totalWindowSeconds) * 100,
      label: timeString
    };
  });

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="main-content" style={{ gap: '20px', height: 'calc(100vh - 160px)', minHeight: '680px', overflowY: 'auto' }}>
      
      {/* Top Split Section: Charts & KPIs */}
      <div className="layout-split" style={{ gridTemplateColumns: '3fr 1fr' }}>
        
        {/* Left Double Charts Card */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Algorithm Efficiency Chart */}
          <div className="kpi-card" style={{ marginBottom: 0 }}>
            <h3 className="kpi-card-title">
              <span>算法作业效率提升 (%)</span>
            </h3>
            <div style={{ width: '100%', height: '230px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={efficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOptimal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--green-dispatch)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--green-dispatch)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="statTime" tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} domain={[0, 30]} />
                  <RechartsTooltip content={renderTooltip} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Area name="优化调度效率" type="monotone" dataKey="optimalRate" stroke="var(--green-dispatch)" strokeWidth={2} fillOpacity={1} fill="url(#colorOptimal)" />
                  <Line name="标准作业效率" type="monotone" dataKey="standardRate" stroke="var(--grey-dispatch)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hymala Model Stability Chart */}
          <div className="kpi-card" style={{ marginBottom: 0 }}>
            <h3 className="kpi-card-title">
              <span>Hymala 模型稳定性与延迟 (ms)</span>
            </h3>
            <div style={{ width: '100%', height: '230px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stabilityData.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="statTime" tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} domain={[20, 60]} />
                  <RechartsTooltip content={renderTooltip} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Line name="决策延迟 (ms)" type="monotone" dataKey="latencyMs" stroke="var(--blue-main)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line name="模型运算成功率 (%)" type="monotone" dataKey="successRate" stroke="var(--green-dispatch)" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right KPI Summary Cards */}
        <div className="kpi-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
          <h3 className="kpi-card-title">算法决策健康度</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid #f1f3f5' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>算法调用成功率</div>
              <div className="metric-value-large" style={{ color: 'var(--green-dispatch)', marginTop: '4px' }}>
                {stabilityData.kpis.successRate} <span className="metric-unit">%</span>
              </div>
            </div>

            <div style={{ paddingBottom: '12px', borderBottom: '1px solid #f1f3f5' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>超时重算次数</div>
              <div className="metric-value-large" style={{ color: 'var(--red-text)', marginTop: '4px' }}>
                {stabilityData.kpis.timeoutCount} <span className="metric-unit">次</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>决策计算总调用</div>
              <div className="metric-value-large" style={{ color: 'var(--text-main)', marginTop: '4px' }}>
                {stabilityData.kpis.totalCalls.toLocaleString()} <span className="metric-unit">次</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Secondary Dispatch Gantt Timeline */}
      <div className="kpi-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 0, minHeight: '340px' }}>
        <h3 className="kpi-card-title">
          <span>二次调度事件时间轴</span>
          <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-sub)' }}>
            点击色块查看路径冲突详情与优化方案
          </span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px', flex: 1 }}>
          
          {/* Gantt Timeline View */}
          <div style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto', borderRight: '1px solid var(--card-border)', paddingRight: '20px' }}>
            
            {/* Horizontal Timeline Axis */}
            <div className="gantt-axis" style={{ height: '30px' }}>
              <div style={{ width: '80px', flexShrink: 0 }} /> {/* spacer */}
              <div style={{ flex: 1, position: 'relative' }}>
                {ticks.map((tick, idx) => (
                  <span
                    key={idx}
                    className="gantt-tick"
                    style={{ left: `${tick.percent}%` }}
                  >
                    {tick.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Gantt Rows per Device */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
              {devices.map((deviceCode) => {
                const deviceEvents = events.filter((e) => e.deviceCode === deviceCode);

                return (
                  <div key={deviceCode} className="gantt-row">
                    {/* Device Label Column */}
                    <div className="gantt-row-header" style={{ width: '80px' }}>
                      {deviceCode}
                    </div>

                    {/* Track Container */}
                    <div className="gantt-events-track">
                      {/* background row guide line */}
                      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', borderTop: '1px dashed #e2e8f0', zIndex: 0 }} />
                      
                      {/* Render Events */}
                      {deviceEvents.map((evt) => {
                        const relativeStart = evt.startEpoch - startBase;
                        const leftPercent = (relativeStart / totalWindowSeconds) * 100;
                        const widthPercent = (evt.durationSeconds / totalWindowSeconds) * 100;
                        const colorClass = getGanttColorClass(evt.eventName);
                        const isSelected = selectedEvent?.eventId === evt.eventId;

                        return (
                          <div
                            key={evt.eventId}
                            className={`gantt-event-capsule ${colorClass}`}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${Math.max(widthPercent, 6)}%`, // min width of 6% to keep readable
                              zIndex: isSelected ? 5 : 2,
                              border: isSelected ? '2px solid #000000' : 'none'
                            }}
                            onClick={() => setSelectedEvent(evt)}
                            title={`${evt.eventName} (${evt.durationSeconds}s)`}
                          >
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '10px' }}>
                              {evt.eventName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conflict detail panel */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            {selectedEvent ? (
              <div
                style={{
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#fafbfc',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'var(--red-bg)', color: 'var(--red-text)', padding: '2px 8px', borderRadius: '4px' }}>
                    {selectedEvent.eventId}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green-dispatch)' }}>
                    {selectedEvent.status === 'RESOLVED' ? '已自动重算调度' : '待处理'}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedEvent.eventName} - 设备 {selectedEvent.deviceCode}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                    发生时间: {formatEpochTime(selectedEvent.startEpoch)} ~ {formatEpochTime(selectedEvent.startEpoch + selectedEvent.durationSeconds)} (持续 {selectedEvent.durationSeconds}秒)
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f3f5', paddingTop: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>路径冲突成因</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.4 }}>
                    {selectedEvent.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f3f5', paddingTop: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>二次调度决策方案 (Hymala)</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.4, fontWeight: 500 }}>
                    {selectedEvent.eventName === '耳轴换介' && '重新指派就近空闲车辆或换电，计算二级流向避让最优时段。'}
                    {selectedEvent.eventName === '等待复位' && '下发静止锁止指令，释放相邻道路路权，防止AGV死锁。'}
                    {selectedEvent.eventName === '重选退出' && '重新划分警示碰撞框，退出主干道以解除车辆拥堵。'}
                    {selectedEvent.eventName === '避让锁死' && '调度中心干预，指派倒车回退，重新进行会车路权排序。'}
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '1px dashed var(--card-border)',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'var(--text-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>未选中事件</div>
                <p style={{ fontSize: '11px', marginTop: '4px', maxWidth: '240px' }}>
                  在左侧甘特图中点击任意彩色工况胶囊块，查看具体的路径冲突和二次调度解决方案。
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
