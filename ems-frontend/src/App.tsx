import { useState, useEffect } from 'react';
import { getRequest } from './services/apiClient';
import { HEADER_STATUS } from './mocks/fixtures';
import type { HeaderStatus } from './mocks/fixtures';
import { FilterBar } from './components/FilterBar';
import { Efficiency } from './pages/Efficiency';
import { Network } from './pages/Network';
import { Dispatch } from './pages/Dispatch';
import { Energy } from './pages/Energy';

// Inline simple SVG icons for maximum compatibility without import path failures
const AlertCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

function App() {
  const [activeTab, setActiveTab] = useState<'efficiency' | 'network' | 'dispatch' | 'energy'>('efficiency');
  const [headerStatus, setHeaderStatus] = useState<HeaderStatus>(HEADER_STATUS);
  const [filters, setFilters] = useState({
    timeRange: '1天',
    startDate: '2026-05-22 00:00:00',
    endDate: '2026-05-22 23:59:59',
    deviceType: 'ALL',
    deviceCode: 'ALL',
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch Header Status
  useEffect(() => {
    const fetchHeader = async () => {
      try {
        const res = await getRequest<HeaderStatus>('/common/header-status');
        setHeaderStatus(res);
      } catch (err) {
        console.error('Error fetching header status:', err);
      }
    };
    fetchHeader();
  }, []);

  const handleQuery = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({
      timeRange: '1天',
      startDate: '2026-05-22 00:00:00',
      endDate: '2026-05-22 23:59:59',
      deviceType: 'ALL',
      deviceCode: 'ALL',
    });
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'efficiency':
        return <Efficiency filters={filters} loading={loading} setLoading={setLoading} />;
      case 'network':
        return <Network filters={filters} loading={loading} setLoading={setLoading} />;
      case 'dispatch':
        return <Dispatch filters={filters} loading={loading} setLoading={setLoading} />;
      case 'energy':
        return <Energy filters={filters} loading={loading} setLoading={setLoading} />;
      default:
        return <Efficiency filters={filters} loading={loading} setLoading={setLoading} />;
    }
  };

  return (
    <div className="app-container">
      {/* Top AppShell Header */}
      <header className="app-header">
        <div className="brand-section">
          {/* Logo Icon SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue-main)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="logo-text">
            Reewell World <span>|</span> EMS KPI
          </span>
        </div>

        {/* Tab Navigation */}
        <nav className="header-nav">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'efficiency' ? 'active' : ''}`}
            onClick={() => setActiveTab('efficiency')}
          >
            作业效率
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            关系网
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'dispatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispatch')}
          >
            调度分析
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'energy' ? 'active' : ''}`}
            onClick={() => setActiveTab('energy')}
          >
            能源与碳排
          </button>
        </nav>

        {/* Actions section */}
        <div className="header-actions">
          {/* Alert messages bubble */}
          {headerStatus.alertMessage && (
            <div className="alert-capsule">
              <AlertCircleIcon />
              <span>{headerStatus.alertMessage}</span>
            </div>
          )}

          {/* Notification Icon with Badge */}
          <button type="button" className="round-btn" title="通知消息">
            <BellIcon />
            {headerStatus.notificationCount > 0 && (
              <span className="badge">{headerStatus.notificationCount}</span>
            )}
          </button>

          {/* Settings button */}
          <button type="button" className="round-btn" title="配置中心">
            <SettingsIcon />
          </button>

          {/* User profile abbreviation */}
          <div className="user-profile" title={`${headerStatus.user.username} (${headerStatus.user.role})`}>
            {headerStatus.user.username.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Global Filter Bar */}
      <FilterBar onQuery={handleQuery} onReset={handleReset} />

      {/* View Panel Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderActivePage()}
      </main>
    </div>
  );
}

export default App;
