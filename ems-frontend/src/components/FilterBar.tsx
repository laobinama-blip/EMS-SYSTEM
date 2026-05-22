import React, { useState } from 'react';

interface FilterBarProps {
  onQuery: (filters: {
    timeRange: string;
    startDate: string;
    endDate: string;
    deviceType: string;
    deviceCode: string;
  }) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onQuery, onReset }) => {
  const [timeRange, setTimeRange] = useState<string>('1天');
  const [startDate, setStartDate] = useState<string>('2026-05-22 00:00:00');
  const [endDate, setEndDate] = useState<string>('2026-05-22 23:59:59');
  const [deviceType, setDeviceType] = useState<string>('ALL');
  const [deviceCode, setDeviceCode] = useState<string>('ALL');

  const timeOptions = ['2h', '8h', '1天', '3天', '7天', '自定义'];

  const handleQuery = () => {
    onQuery({
      timeRange,
      startDate,
      endDate,
      deviceType,
      deviceCode,
    });
  };

  const handleReset = () => {
    setTimeRange('1天');
    setStartDate('2026-05-22 00:00:00');
    setEndDate('2026-05-22 23:59:59');
    setDeviceType('ALL');
    setDeviceCode('ALL');
    onReset();
  };

  return (
    <div className="filter-bar-container">
      <div className="filter-bar">
        <div className="filter-left">
          <div className="segmented-control">
            {timeOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`segment-btn ${timeRange === option ? 'active' : ''}`}
                onClick={() => {
                  setTimeRange(option);
                  if (option !== '自定义') {
                    // Update start/end date based on preset (mocking realistic interval)
                    const end = new Date('2026-05-22T23:59:59');
                    let start = new Date(end);
                    if (option === '2h') start.setHours(end.getHours() - 2);
                    else if (option === '8h') start.setHours(end.getHours() - 8);
                    else if (option === '1天') start.setDate(end.getDate() - 1);
                    else if (option === '3天') start.setDate(end.getDate() - 3);
                    else if (option === '7天') start.setDate(end.getDate() - 7);
                    
                    const pad = (n: number) => String(n).padStart(2, '0');
                    const fmt = (d: Date) => 
                      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
                    
                    setStartDate(fmt(start));
                    setEndDate(fmt(end));
                  }
                }}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="date-picker-wrap">
            <input
              type="text"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="开始时间"
              disabled={timeRange !== '自定义'}
            />
            <span>~</span>
            <input
              type="text"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="结束时间"
              disabled={timeRange !== '自定义'}
            />
          </div>
        </div>

        <div className="filter-right">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>设备类型</span>
            <select
              className="filter-select"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
            >
              <option value="ALL">全部类型</option>
              <option value="VEHICLE">集卡车辆 (T)</option>
              <option value="QC">岸桥设备 (QC)</option>
              <option value="YC">场桥设备 (RTG)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>设备编码</span>
            <select
              className="filter-select"
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value)}
            >
              <option value="ALL">全部设备</option>
              {deviceType === 'ALL' || deviceType === 'VEHICLE' ? (
                <>
                  <option value="T101">T101</option>
                  <option value="T102">T102</option>
                  <option value="T103">T103</option>
                  <option value="T104">T104</option>
                  <option value="T105">T105</option>
                  <option value="T106">T106</option>
                </>
              ) : null}
              {deviceType === 'ALL' || deviceType === 'QC' ? (
                <>
                  <option value="QC301">QC301</option>
                  <option value="QC302">QC302</option>
                </>
              ) : null}
              {deviceType === 'ALL' || deviceType === 'YC' ? (
                <>
                  <option value="RTG01">RTG01</option>
                  <option value="RTG02">RTG02</option>
                </>
              ) : null}
            </select>
          </div>

          <button type="button" className="btn-query" onClick={handleQuery}>
            查询
          </button>
          <button type="button" className="btn-reset" onClick={handleReset}>
            重置
          </button>
        </div>
      </div>
    </div>
  );
};
