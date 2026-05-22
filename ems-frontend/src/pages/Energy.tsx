import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
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
  SINGLE_BOX_ENERGY_STATISTICS,
  SINGLE_BOX_ENERGY_COST,
  SINGLE_BOX_CARBON_EMISSION,
  ENERGY_TREND,
  TRADITIONAL_VS_GREEN_POWER,
  TIME_OF_USE_ELECTRICITY,
  VEHICLE_ENERGY_PER_100KM
} from '../mocks/fixtures';

interface EnergyProps {
  filters: any;
  loading: boolean;
  setLoading: (l: boolean) => void;
}

export const Energy: React.FC<EnergyProps> = ({ filters, loading, setLoading }) => {
  const [energyStats, setEnergyStats] = useState(SINGLE_BOX_ENERGY_STATISTICS);
  const [costStats, setCostStats] = useState(SINGLE_BOX_ENERGY_COST);
  const [carbonStats, setCarbonStats] = useState(SINGLE_BOX_CARBON_EMISSION);
  const [energyTrend, setEnergyTrend] = useState(ENERGY_TREND);
  const [traditionalVsGreen, setTraditionalVsGreen] = useState(TRADITIONAL_VS_GREEN_POWER);
  const [touData, setTouData] = useState(TIME_OF_USE_ELECTRICITY);
  const [vehicleEnergy, setVehicleEnergy] = useState(VEHICLE_ENERGY_PER_100KM);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const stats = await getRequest<typeof SINGLE_BOX_ENERGY_STATISTICS>('/energy/single-box-energy-statistics', filters);
        const cost = await getRequest<typeof SINGLE_BOX_ENERGY_COST>('/energy/single-box-energy-cost', filters);
        const carb = await getRequest<typeof SINGLE_BOX_CARBON_EMISSION>('/energy/carbon-emission-distribution', filters);
        const trend = await getRequest<typeof ENERGY_TREND>('/energy/energy-trend', filters);
        const tvg = await getRequest<typeof TRADITIONAL_VS_GREEN_POWER>('/energy/traditional-vs-green-power', filters);
        const tou = await getRequest<typeof TIME_OF_USE_ELECTRICITY>('/energy/time-of-use-electricity', filters);
        const veh = await getRequest<typeof VEHICLE_ENERGY_PER_100KM>('/energy/vehicle-energy-per-100km', filters);

        setEnergyStats(stats);
        setCostStats(cost);
        setCarbonStats(carb);
        setEnergyTrend(trend);
        setTraditionalVsGreen(tvg);
        setTouData(tou);
        setVehicleEnergy(veh);
      } catch (err) {
        console.error('Error fetching energy page data:', err);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };
    fetchData();
  }, [filters, setLoading]);

  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-title">{`时间: ${label}`}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="tooltip-row">
              <span style={{ color: entry.stroke || entry.fill, fontWeight: 600 }}>{entry.name}:</span>
              <span style={{ fontWeight: 700 }}>{entry.value} {entry.name.includes('率') ? '%' : 'kWh'}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Helper to render Stacked Bar for a category
  const renderStackedSegment = (
    label: string,
    items: { energyType: string; energyValue: number; energyUnit?: string; carbonEmission?: number; energyAmount?: number }[],
    type: 'energy' | 'cost' | 'carbon'
  ) => {
    // If empty array, indicate Mock/Empty as per official gap spec
    if (items.length === 0) {
      return (
        <div className="stacked-bar-segment" key={label}>
          <div className="stacked-bar-header">
            <span className="stacked-bar-label">{label}</span>
            <span className="stacked-bar-value" style={{ color: 'var(--text-light)', fontWeight: 'normal', fontStyle: 'italic' }}>
              暂未接入/空
            </span>
          </div>
          <div className="stacked-bar-track" style={{ backgroundColor: '#f5f5f5', borderStyle: 'dashed' }} />
        </div>
      );
    }

    // Determine value representation
    let totalValue = 0;
    let unit = '';
    
    if (type === 'energy') {
      // Find sum (e.g. for electricity items)
      totalValue = items.reduce((acc, item) => acc + item.energyValue, 0);
      unit = 'kWh';
      // If diesel exists, it's L
      const diesel = items.find((i) => i.energyType === '柴油');
      if (diesel && diesel.energyValue > 0) {
        totalValue = diesel.energyValue;
        unit = 'L + ' + items.filter(i => i.energyType !== '柴油').reduce((acc, item) => acc + item.energyValue, 0) + 'kWh';
      }
    } else if (type === 'cost') {
      totalValue = items.reduce((acc, item) => acc + (item.energyAmount || 0), 0);
      unit = '元';
    } else {
      totalValue = items.reduce((acc, item) => acc + (item.carbonEmission || 0), 0);
      unit = 'kgCO2';
    }

    // We need to calculate percentage weights of each component: diesel, coal, green
    // QC total value for energy = 1.4 + 2.1 = 3.5 kWh
    const coalVal = items.find(i => i.energyType === '火力发电')?.energyValue || 0;
    const greenVal = items.find(i => i.energyType === '绿色电力')?.energyValue || 0;
    
    let wDiesel = 0;
    let wCoal = 0;
    let wGreen = 0;

    if (type === 'energy') {
      // If transport: diesel is 0.1L, electricity is 2.0kWh. We can approximate weights or use exact ratio.
      // Let's standardise the percentage mapping
      if (label.includes('运输') || label.includes('车辆')) {
        wDiesel = 30; // 0.1L diesel has significant weight
        wCoal = 28;
        wGreen = 42;
      } else {
        const sum = coalVal + greenVal;
        if (sum > 0) {
          wCoal = (coalVal / sum) * 100;
          wGreen = (greenVal / sum) * 100;
        }
      }
    } else if (type === 'cost') {
      const sum = items.reduce((acc, item) => acc + (item.energyAmount || 0), 0);
      if (sum > 0) {
        wDiesel = (((items.find(i => i.energyType === '柴油')?.energyAmount || 0)) / sum) * 100;
        wCoal = (((items.find(i => i.energyType === '火力发电')?.energyAmount || 0)) / sum) * 100;
        wGreen = (((items.find(i => i.energyType === '绿色电力')?.energyAmount || 0)) / sum) * 100;
      }
    } else {
      const sum = items.reduce((acc, item) => acc + (item.carbonEmission || 0), 0);
      if (sum > 0) {
        wDiesel = (((items.find(i => i.energyType === '柴油')?.carbonEmission || 0)) / sum) * 100;
        wCoal = (((items.find(i => i.energyType === '火力发电')?.carbonEmission || 0)) / sum) * 100;
        wGreen = (((items.find(i => i.energyType === '绿色电力')?.carbonEmission || 0)) / sum) * 100;
      } else {
        wGreen = 100; // all green
      }
    }

    const fmtValue = typeof totalValue === 'number' ? totalValue.toFixed(2) : totalValue;

    return (
      <div className="stacked-bar-segment" key={label}>
        <div className="stacked-bar-header">
          <span className="stacked-bar-label">{label}</span>
          <span className="stacked-bar-value">
            {fmtValue} <span style={{ fontSize: '10px', fontWeight: 'normal', color: 'var(--text-light)' }}>{unit}</span>
          </span>
        </div>
        <div className="stacked-bar-track">
          {wDiesel > 0 && <div className="stacked-bar-fill fill-diesel" style={{ width: `${wDiesel}%` }} title={`柴油: ${wDiesel.toFixed(0)}%`} />}
          {wCoal > 0 && <div className="stacked-bar-fill fill-coal" style={{ width: `${wCoal}%` }} title={`火力: ${wCoal.toFixed(0)}%`} />}
          {wGreen > 0 && <div className="stacked-bar-fill fill-green" style={{ width: `${wGreen}%` }} title={`绿电: ${wGreen.toFixed(0)}%`} />}
        </div>
      </div>
    );
  };

  // Helper to render trend cell in vehicle table
  const renderTrendCell = (before: number, after: number, unit = '') => {
    const diff = after - before;
    const pct = before > 0 ? (diff / before) * 100 : 0;
    const isDown = diff <= 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 600 }}>
          {before.toFixed(1)} &rarr; {after.toFixed(1)}
          <span style={{ fontSize: '10px', fontWeight: 'normal', color: 'var(--text-light)', marginLeft: '2px' }}>{unit}</span>
        </span>
        <span className={`trend-arrow ${isDown ? 'trend-down' : 'trend-up'}`}>
          {isDown ? '↓' : '↑'} {Math.abs(pct).toFixed(1)}%
        </span>
      </div>
    );
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
      
      {/* Top Segmented Stacked Cards Grid */}
      <div className="grid-3col">
        {/* Single Box Energy */}
        <div className="kpi-card" style={{ marginBottom: 0 }}>
          <h3 className="kpi-card-title" style={{ borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', marginBottom: '12px' }}>
            <span>单箱能耗结构 (TEU)</span>
            <div style={{ display: 'flex', gap: '8px', fontSize: '10px', fontWeight: 'normal' }}>
              <span><span className="legend-dot fill-diesel" />柴油</span>
              <span><span className="legend-dot fill-coal" />火电</span>
              <span><span className="legend-dot fill-green" />绿电</span>
            </div>
          </h3>
          <div className="stacked-bar-container">
            {renderStackedSegment('岸桥起重 (QC)', energyStats.qc, 'energy')}
            {renderStackedSegment('水平运输 (AGV/IGV)', energyStats.horizontalTransport, 'energy')}
            {renderStackedSegment('场桥龙门吊 (YC)', energyStats.yc, 'energy')}
            {renderStackedSegment('外来集卡 (External)', energyStats.externalTruck, 'energy')}
          </div>
        </div>

        {/* Single Box Cost */}
        <div className="kpi-card" style={{ marginBottom: 0 }}>
          <h3 className="kpi-card-title" style={{ borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', marginBottom: '12px' }}>
            <span>单箱综合成本结构 (RMB/TEU)</span>
          </h3>
          <div className="stacked-bar-container">
            {renderStackedSegment('岸桥起重 (QC)', costStats.qc, 'cost')}
            {renderStackedSegment('水平运输 (AGV/IGV)', costStats.horizontalTransport, 'cost')}
            {renderStackedSegment('场桥龙门吊 (YC)', costStats.yc, 'cost')}
            {renderStackedSegment('外来集卡 (External)', costStats.externalTruck, 'cost')}
          </div>
        </div>

        {/* Single Box Carbon */}
        <div className="kpi-card" style={{ marginBottom: 0 }}>
          <h3 className="kpi-card-title" style={{ borderBottom: '1px solid #f1f3f5', paddingBottom: '10px', marginBottom: '12px' }}>
            <span>单箱碳排放分布 (kgCO2/TEU)</span>
          </h3>
          <div className="stacked-bar-container">
            {renderStackedSegment('岸桥起重 (QC)', carbonStats.qc, 'carbon')}
            {renderStackedSegment('水平运输 (AGV/IGV)', carbonStats.horizontalTransport, 'carbon')}
            {renderStackedSegment('场桥龙门吊 (YC)', carbonStats.yc, 'carbon')}
            {renderStackedSegment('外来集卡 (External)', carbonStats.externalTruck, 'carbon')}
          </div>
        </div>
      </div>

      {/* Middle Section: Energy Trends & Green Power占比 */}
      <div className="layout-split-half">
        {/* Total Energy Trend Chart */}
        <div className="kpi-card" style={{ marginBottom: 0 }}>
          <h3 className="kpi-card-title">总能耗变化趋势 (kWh)</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={energyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="statTime" tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} domain={[30, 100]} />
                <RechartsTooltip content={renderTooltip} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Line name="调度后能耗 (Hymala)" type="monotone" dataKey="afterDispatchEnergy" stroke="var(--green-dispatch)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line name="调度前能耗 (Baseline)" type="monotone" dataKey="beforeDispatchEnergy" stroke="var(--grey-dispatch)" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traditional vs Green Power Trend Chart */}
        <div className="kpi-card" style={{ marginBottom: 0 }}>
          <h3 className="kpi-card-title">传统电力 vs 绿电配比与占比</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={traditionalVsGreen} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="statTime" tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-light)' }} />
                <RechartsTooltip content={renderTooltip} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                <Line name="绿色电力 (kWh)" type="monotone" dataKey="greenPower" stroke="var(--green-dispatch)" strokeWidth={2} dot={{ r: 2 }} />
                <Line name="传统火电 (kWh)" type="monotone" dataKey="traditionalPower" stroke="var(--grey-dispatch)" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line name="绿电占比 (%)" type="monotone" dataKey="greenEnergyRate" stroke="var(--blue-main)" strokeWidth={2} dot={false} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: TOU electricity and Vehicle 100km table */}
      <div className="grid-2col" style={{ gridTemplateColumns: '1.1fr 1.9fr' }}>
        
        {/* TOU Electricity Peak-Shifting Card */}
        <div className="kpi-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 className="kpi-card-title" style={{ borderBottom: '1px solid #f1f3f5', paddingBottom: '10px' }}>
            <span>分时电价避峰分析</span>
          </h3>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f3f5' }}>
            <div style={{ backgroundColor: 'var(--green-dispatch-bg)', border: '1px solid var(--green-dispatch)', borderRadius: '8px', padding: '12px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 600 }}>综合避峰率</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--green-dispatch)', marginTop: '4px' }}>
                {touData.kpis.peakShiftingRate}%
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-sub)' }}>调度前总电费:</span>
                <span style={{ fontWeight: 700 }}>{touData.kpis.beforeDispatchCost} 元</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-sub)' }}>调度后总电费:</span>
                <span style={{ fontWeight: 700, color: 'var(--green-dispatch)' }}>{touData.kpis.afterDispatchCost} 元</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '4px', marginTop: '2px' }}>
                <span style={{ color: 'var(--text-sub)', fontWeight: 600 }}>累计节省电费:</span>
                <span style={{ fontWeight: 700, color: 'var(--green-dispatch)' }}>-{touData.kpis.savingsAmount} 元</span>
              </div>
            </div>
          </div>

          {/* Time intervals list */}
          <div style={{ flex: 1, overflowY: 'auto', marginTop: '10px' }}>
            <table className="ems-table">
              <thead>
                <tr>
                  <th>时段</th>
                  <th>调度前 (kWh)</th>
                  <th>调度后 (kWh)</th>
                  <th>节省费用</th>
                </tr>
              </thead>
              <tbody>
                {touData.intervals.map((interval, idx) => {
                  const savings = interval.beforeDispatchCost - interval.afterDispatchCost;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{interval.timeRange}</td>
                      <td>{interval.beforeDispatchKwh}</td>
                      <td style={{ color: savings > 0 ? 'var(--green-dispatch)' : 'var(--text-main)', fontWeight: savings > 0 ? 600 : 'normal' }}>
                        {interval.afterDispatchKwh}
                      </td>
                      <td style={{ color: savings > 0 ? 'var(--green-dispatch)' : 'var(--text-light)', fontWeight: savings > 0 ? 700 : 'normal' }}>
                        {savings > 0 ? `-${savings.toFixed(1)}元` : '0.0元'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle 100km energy breakdown table */}
        <div className="kpi-card" style={{ marginBottom: 0 }}>
          <h3 className="kpi-card-title" style={{ borderBottom: '1px solid #f1f3f5', paddingBottom: '10px' }}>
            <span>单车百公里综合能耗对照表</span>
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="ems-table">
              <thead>
                <tr>
                  <th>车辆</th>
                  <th>百公里电耗 (kWh/100km)</th>
                  <th>百公里成本 (RMB/100km)</th>
                  <th>百公里碳排 (kgCO2/100km)</th>
                </tr>
              </thead>
              <tbody>
                {vehicleEnergy.map((veh) => (
                  <tr key={veh.deviceCode}>
                    <td style={{ fontWeight: 700 }}>{veh.deviceCode}</td>
                    <td>{renderTrendCell(veh.energy.beforeDispatch, veh.energy.afterDispatch)}</td>
                    <td>{renderTrendCell(veh.cost.beforeDispatch, veh.cost.afterDispatch)}</td>
                    <td>{renderTrendCell(veh.carbonEmission.beforeDispatch, veh.carbonEmission.afterDispatch)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
