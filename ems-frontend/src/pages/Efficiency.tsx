import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { getRequest } from '../services/apiClient';
import { WORK_SUMMARY, EFFICIENCY_CHARTS } from '../mocks/fixtures';

interface EfficiencyProps {
  filters: any;
  loading: boolean;
  setLoading: (l: boolean) => void;
}

export const Efficiency: React.FC<EfficiencyProps> = ({ filters, loading, setLoading }) => {
  const [summary, setSummary] = useState(WORK_SUMMARY);
  const [charts, setCharts] = useState(EFFICIENCY_CHARTS);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch real APIs with fallback to mock adaptors
        const summaryData = await getRequest<typeof WORK_SUMMARY>('/efficiency/work-summary', filters);
        const chartsData = await getRequest<typeof EFFICIENCY_CHARTS>('/efficiency/charts', filters);
        setSummary(summaryData);
        setCharts(chartsData);
      } catch (err) {
        console.error('Error fetching efficiency data:', err);
      } finally {
        setTimeout(() => setLoading(false), 400); // minor buffer to demonstrate dynamic loading
      }
    };
    fetchData();
  }, [filters, setLoading]);

  // Box ratio progress bar helper
  const BoxRatioBar: React.FC<{ ratio: typeof WORK_SUMMARY.total.boxRatio }> = ({ ratio }) => {
    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px' }}>
          <span>20尺: {ratio.twentyFeet}%</span>
          <span>40尺: {ratio.fortyFeet}%</span>
          <span>45尺: {ratio.fortyFiveFeet}%</span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', display: 'flex', overflow: 'hidden', backgroundColor: '#f1f3f5' }}>
          <div style={{ width: `${ratio.twentyFeet}%`, backgroundColor: '#35b9f6' }} title="20尺" />
          <div style={{ width: `${ratio.fortyFeet}%`, backgroundColor: '#19d98f' }} title="40尺" />
          <div style={{ width: `${ratio.fortyFiveFeet}%`, backgroundColor: '#722ed1' }} title="45尺" />
        </div>
      </div>
    );
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
              <span style={{ fontWeight: 700 }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="main-content" style={{ gap: '20px' }}>
      {/* Top Section Layout Split (2.5fr vs 1fr) */}
      <div className="layout-split">
        {/* Left main columns with statistics grids */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Work Summary Card */}
          <div className="kpi-card">
            <h3 className="kpi-card-title">作业统计摘要</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.8fr', gap: '24px' }}>
              {/* Total Summary Left Block */}
              <div style={{ borderRight: '1px solid var(--card-border)', paddingRight: '24px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 600 }}>全场总作业箱量</div>
                <div className="metric-value-large" style={{ color: 'var(--blue-main)', margin: '8px 0' }}>
                  {summary.total.teu} <span className="metric-unit">TEU</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>自然箱数:</span>
                    <span style={{ fontWeight: 700 }}>{summary.total.naturalBox} 箱</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-sub)' }}>集卡循环:</span>
                    <span style={{ fontWeight: 700 }}>{summary.total.vehicleLoops} 次</span>
                  </div>
                </div>
                <BoxRatioBar ratio={summary.total.boxRatio} />
              </div>

              {/* 3 Categories Breakdown Right Block */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {/* Loading (装船) */}
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#19d98f' }} />
                    装船作业统计
                  </div>
                  <div className="metric-value-large" style={{ fontSize: '20px', margin: '8px 0' }}>
                    {summary.loading.teu} <span className="metric-unit">TEU</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-sub)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>自然箱:</span>
                      <span style={{ fontWeight: 600 }}>{summary.loading.naturalBox}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>集卡循环:</span>
                      <span style={{ fontWeight: 600 }}>{summary.loading.vehicleLoops}</span>
                    </div>
                  </div>
                  <BoxRatioBar ratio={summary.loading.boxRatio} />
                </div>

                {/* Unloading (卸船) */}
                <div style={{ borderLeft: '1px solid #f1f3f5', borderRight: '1px solid #f1f3f5', padding: '0 16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#35b9f6' }} />
                    卸船作业统计
                  </div>
                  <div className="metric-value-large" style={{ fontSize: '20px', margin: '8px 0' }}>
                    {summary.unloading.teu} <span className="metric-unit">TEU</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-sub)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>自然箱:</span>
                      <span style={{ fontWeight: 600 }}>{summary.unloading.naturalBox}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>集卡循环:</span>
                      <span style={{ fontWeight: 600 }}>{summary.unloading.vehicleLoops}</span>
                    </div>
                  </div>
                  <BoxRatioBar ratio={summary.unloading.boxRatio} />
                </div>

                {/* Transfer (转堆) */}
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#722ed1' }} />
                    转堆作业统计
                  </div>
                  <div className="metric-value-large" style={{ fontSize: '20px', margin: '8px 0' }}>
                    {summary.transfer.teu} <span className="metric-unit">TEU</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-sub)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>自然箱:</span>
                      <span style={{ fontWeight: 600 }}>{summary.transfer.naturalBox}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>集卡循环:</span>
                      <span style={{ fontWeight: 600 }}>{summary.transfer.vehicleLoops}</span>
                    </div>
                  </div>
                  <BoxRatioBar ratio={summary.transfer.boxRatio} />
                </div>
              </div>
            </div>
          </div>

          {/* Energy Status Card Row */}
          <div className="kpi-card">
            <h3 className="kpi-card-title">能耗综合指标</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>总能源投入金额</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>12,852 <span style={{ fontSize: '10px', fontWeight: 400 }}>元</span></div>
              </div>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px', paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>调度节省成本</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green-dispatch)', marginTop: '4px' }}>-1,330 <span style={{ fontSize: '10px', fontWeight: 400 }}>元</span></div>
              </div>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px', paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>燃油总消耗</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>350 <span style={{ fontSize: '10px', fontWeight: 400 }}>L</span></div>
              </div>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px', paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>二氧化碳排放</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>2.47 <span style={{ fontSize: '10px', fontWeight: 400 }}>t</span></div>
              </div>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px', paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>电力总消耗</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>12,500 <span style={{ fontSize: '10px', fontWeight: 400 }}>kWh</span></div>
              </div>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px', paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>电力负荷峰值</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>120 <span style={{ fontSize: '10px', fontWeight: 400 }}>kW</span></div>
              </div>
              <div style={{ paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>平均单箱电耗</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>2.57 <span style={{ fontSize: '10px', fontWeight: 400 }}>kWh/T</span></div>
              </div>
            </div>
          </div>

          {/* Efficiency Status Card Row */}
          <div className="kpi-card">
            <h3 className="kpi-card-title">作业效率指标</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>全场平均效率</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px', color: 'var(--green-dispatch)' }}>28.5 <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-light)' }}>箱/h</span></div>
              </div>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px', paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>岸桥平均效率</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>29.2 <span style={{ fontSize: '10px', fontWeight: 400 }}>箱/h</span></div>
              </div>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px', paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>场桥平均效率</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>24.6 <span style={{ fontSize: '10px', fontWeight: 400 }}>箱/h</span></div>
              </div>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '8px', paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>泊位利用率</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>68.4 <span style={{ fontSize: '10px', fontWeight: 400 }}>%</span></div>
              </div>
              <div style={{ paddingLeft: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>船舶平均在泊时间</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>14.2 <span style={{ fontSize: '10px', fontWeight: 400 }}>h</span></div>
              </div>
            </div>
          </div>

          {/* Equipment Status Card Row */}
          <div className="kpi-card">
            <h3 className="kpi-card-title">设备作业与效率</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>在线设备总计</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px' }}>
                  <span>集卡车辆 (AGV/IGV)</span>
                  <span style={{ fontWeight: 700 }}>24 台</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                  <span>岸桥起重机 (QC)</span>
                  <span style={{ fontWeight: 700 }}>8 台</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                  <span>场桥龙门吊 (RTG/RMG)</span>
                  <span style={{ fontWeight: 700 }}>13 台</span>
                </div>
              </div>
              <div style={{ borderRight: '1px solid #f1f3f5', paddingRight: '20px', paddingLeft: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>单车平均作业量</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px' }}>
                  <span>日均重载箱量:</span>
                  <span style={{ fontWeight: 700 }}>84 TEU/台</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                  <span>日均循环重载率:</span>
                  <span style={{ fontWeight: 700 }}>82 %</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                  <span>单周故障率:</span>
                  <span style={{ fontWeight: 700, color: 'var(--green-dispatch)' }}>0.2 %</span>
                </div>
              </div>
              <div style={{ paddingLeft: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>单车效率对比</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px' }}>
                  <span>调度前平均速度:</span>
                  <span style={{ fontWeight: 700, color: 'var(--grey-dispatch)' }}>18 km/h</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                  <span>调度后平均速度:</span>
                  <span style={{ fontWeight: 700, color: 'var(--green-dispatch)' }}>24 km/h</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                  <span>平均空行驶时长:</span>
                  <span style={{ fontWeight: 700 }}>14.2 min/h</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns (Charts: Vehicle Efficiency and Empty running rate) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="kpi-card" style={{ height: 'calc(50% - 10px)', marginBottom: 0 }}>
            <h3 className="kpi-card-title">车辆平均作业效率 (箱/h)</h3>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.vehicleEfficiency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="statTime" tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} domain={[0, 40]} />
                  <RechartsTooltip content={renderTooltip} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Line name="调度后 (Hymala)" type="monotone" dataKey="afterDispatch" stroke="var(--green-dispatch)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line name="调度前 (Baseline)" type="monotone" dataKey="beforeDispatch" stroke="var(--grey-dispatch)" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kpi-card" style={{ height: 'calc(50% - 10px)', marginBottom: 0 }}>
            <h3 className="kpi-card-title">车辆平均空驶率 (%)</h3>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.emptyRunningRate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="statTime" tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} domain={[0, 100]} />
                  <RechartsTooltip content={renderTooltip} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Line name="调度后 (Hymala)" type="monotone" dataKey="afterDispatch" stroke="var(--green-dispatch)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line name="调度前 (Baseline)" type="monotone" dataKey="beforeDispatch" stroke="var(--grey-dispatch)" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section Layout Grid: 3 columns */}
      <div className="grid-3col">
        {/* QC Efficiency Chart */}
        <div className="kpi-card" style={{ marginBottom: 0 }}>
          <h3 className="kpi-card-title">
            <span>岸桥平均作业效率 (箱/h)</span>
            <select className="filter-select" style={{ padding: '2px 8px', fontSize: '10px' }}>
              <option>全部岸桥</option>
              <option>QC301</option>
              <option>QC302</option>
            </select>
          </h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.qcEfficiency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="statTime" tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} domain={[0, 45]} />
                <RechartsTooltip content={renderTooltip} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Line name="调度后 (Hymala)" type="monotone" dataKey="afterDispatch" stroke="var(--green-dispatch)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line name="调度前 (Baseline)" type="monotone" dataKey="beforeDispatch" stroke="var(--grey-dispatch)" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* YC Efficiency Chart */}
        <div className="kpi-card" style={{ marginBottom: 0 }}>
          <h3 className="kpi-card-title">
            <span>场桥平均作业效率 (箱/h)</span>
            <select className="filter-select" style={{ padding: '2px 8px', fontSize: '10px' }}>
              <option>全部场桥</option>
              <option>RTG01</option>
              <option>RTG02</option>
            </select>
          </h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.ycEfficiency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="statTime" tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} domain={[0, 40]} />
                <RechartsTooltip content={renderTooltip} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Line name="调度后 (Hymala)" type="monotone" dataKey="afterDispatch" stroke="var(--green-dispatch)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line name="调度前 (Baseline)" type="monotone" dataKey="beforeDispatch" stroke="var(--grey-dispatch)" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Waiting Time Bar Chart */}
        <div className="kpi-card" style={{ marginBottom: 0 }}>
          <h3 className="kpi-card-title">岸下集卡平均等待时间 (min)</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.vehicleWaitingTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="statTime" tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} domain={[0, 30]} />
                <RechartsTooltip content={renderTooltip} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Bar name="调度后 (Hymala)" dataKey="afterDispatch" fill="var(--green-dispatch)" radius={[4, 4, 0, 0]} maxBarSize={15} />
                <Bar name="调度前 (Baseline)" dataKey="beforeDispatch" fill="var(--grey-dispatch)" radius={[4, 4, 0, 0]} maxBarSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
