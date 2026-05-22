import React, { useState, useEffect } from 'react';
import { getRequest } from '../services/apiClient';
import { TOPOLOGY_DATA } from '../mocks/fixtures';

interface NetworkProps {
  filters: any;
  loading: boolean;
  setLoading: (l: boolean) => void;
}

export const Network: React.FC<NetworkProps> = ({ filters, loading, setLoading }) => {
  const [data, setData] = useState(TOPOLOGY_DATA);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getRequest<typeof TOPOLOGY_DATA>('/network/topology', filters);
        setData(res);
      } catch (err) {
        console.error('Error fetching topology:', err);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };
    fetchData();
  }, [filters, setLoading]);

  // Find selected node details
  const selectedNode = data.nodes.find((n) => n.id === selectedNodeId);

  // Helper: check if edge is connected to hovered node
  const isEdgeHighlighted = (edge: typeof TOPOLOGY_DATA.edges[0]) => {
    if (!hoveredNodeId && !selectedNodeId) return false;
    const focusId = hoveredNodeId || selectedNodeId;
    return edge.source === focusId || edge.target === focusId;
  };

  // Helper: get node color
  const getNodeColor = (type: string, status: string) => {
    if (status === 'alert') return 'var(--red-border)';
    switch (type) {
      case 'SHIP': return '#1890ff';
      case 'QC': return '#096dd9';
      case 'VEHICLE': return '#19d98f';
      case 'YC': return '#722ed1';
      case 'BLOCK': return '#52c41a';
      case 'CHARGING': return '#fa8c16';
      case 'SWAPPING': return '#13c2c2';
      default: return '#8c8c8c';
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="main-content" style={{ padding: 0, height: 'calc(100vh - 160px)', minHeight: '680px', position: 'relative' }}>
      
      {/* Topology Canvas Viewport */}
      <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--bg-color)' }}>
        <svg
          width="100%"
          height="100%"
          style={{ cursor: 'grab' }}
          className="dot-grid"
        >
          {/* SVG Definitions for grid dots background and arrow marker */}
          <defs>
            <pattern id="grid-dots" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="#d3daf0" opacity="0.75" />
            </pattern>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#c1c7d0" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--green-dispatch)" />
            </marker>
          </defs>

          {/* Dotted background rect */}
          <rect width="100%" height="100%" fill="url(#grid-dots)" />

          {/* SVG Links / Edges */}
          <g>
            {data.edges.map((edge, idx) => {
              const sourceNode = data.nodes.find((n) => n.id === edge.source);
              const targetNode = data.nodes.find((n) => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isHighlighted = isEdgeHighlighted(edge);
              const isActive = edge.type === 'active';
              
              let strokeColor = '#b8c2cc';
              if (isActive) strokeColor = 'var(--green-dispatch)';
              if (isHighlighted) strokeColor = 'var(--blue-main)';

              return (
                <line
                  key={`${edge.source}-${edge.target}-${idx}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 3 : isActive ? 2 : 1.2}
                  strokeDasharray={edge.type === 'dashed' ? '5,5' : undefined}
                  markerEnd={`url(#${isActive || isHighlighted ? 'arrow-active' : 'arrow'})`}
                  className={`edge-line ${isHighlighted ? 'highlighted' : ''}`}
                />
              );
            })}
          </g>

          {/* SVG Nodes */}
          <g>
            {data.nodes.map((node) => {
              const nodeColor = getNodeColor(node.type, node.status);
              const isHovered = hoveredNodeId === node.id;
              const isSelected = selectedNodeId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="node-group"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(isSelected ? null : node.id);
                  }}
                >
                  {/* Outer circle for hover feedback */}
                  <circle
                    r={isHovered || isSelected ? 24 : 18}
                    fill="none"
                    stroke={isHovered || isSelected ? 'var(--blue-main)' : 'none'}
                    strokeWidth={2}
                    opacity={0.6}
                    style={{ transition: 'all 0.2s ease' }}
                  />

                  {/* Core Node Circle */}
                  <circle
                    r={18}
                    fill={nodeColor}
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    className="node-circle"
                    style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  />

                  {/* Mini status indicator for Alerts */}
                  {node.status === 'alert' && (
                    <circle
                      cx="12"
                      cy="-12"
                      r="5"
                      fill="var(--red-text)"
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  )}

                  {/* Node Label Text */}
                  <text
                    y={32}
                    className="node-text"
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      fill: isSelected ? 'var(--blue-active)' : 'var(--text-main)',
                      background: '#ffffff',
                      paintOrder: 'stroke',
                      stroke: '#ffffff',
                      strokeWidth: 4,
                      strokeLinejoin: 'round'
                    }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Node Details Card Drawer */}
        {selectedNode && (
          <div
            className="kpi-card"
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              width: '320px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--card-border)',
              zIndex: 10,
              margin: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: getNodeColor(selectedNode.type, selectedNode.status),
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                {selectedNode.type}
              </span>
              <button
                type="button"
                style={{ border: 'none', background: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '16px' }}
                onClick={() => setSelectedNodeId(null)}
              >
                &times;
              </button>
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>{selectedNode.label}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f5', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-sub)' }}>运行状态:</span>
                <span style={{ fontWeight: 700, color: selectedNode.status === 'alert' ? 'var(--red-text)' : 'var(--text-main)' }}>
                  {selectedNode.status === 'active' ? '正常作业中' : selectedNode.status === 'idle' ? '待机就绪' : selectedNode.status === 'alert' ? '效率偏低告警' : selectedNode.status === 'charging' ? '正在充电' : '换电中'}
                </span>
              </div>
              {selectedNode.details && Object.entries(selectedNode.details).map(([key, val]) => {
                const labelMap: Record<string, string> = {
                  currentTask: '当前任务',
                  efficiency: '作业效率',
                  power: '电池电量',
                  task: '当前流向',
                  capacity: '堆存率',
                  boxCount: '重箱箱量',
                  berthingTime: '靠泊时间',
                  estDeparture: '预离时间',
                  powerOutput: '输出功率',
                  connectedVehicles: '连接车辆',
                  batteryCount: '可用电池数',
                  currentQueue: '当前排队'
                };
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f5', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-sub)' }}>{labelMap[key] || key}:</span>
                    <span style={{ fontWeight: 700 }}>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsible Floating Legend Panel (Bottom Right) */}
        <div
          className="kpi-card"
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            width: '200px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--card-border)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            zIndex: 10,
            margin: 0,
            padding: '12px 16px'
          }}
        >
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setIsLegendOpen(!isLegendOpen)}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>拓扑图例</span>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{isLegendOpen ? '▼' : '▲'}</span>
          </div>

          {isLegendOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="legend-dot" style={{ backgroundColor: '#1890ff' }} />
                <span>船舶 (Ship)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="legend-dot" style={{ backgroundColor: '#096dd9' }} />
                <span>岸桥起重机 (QC)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="legend-dot" style={{ backgroundColor: '#19d98f' }} />
                <span>集卡车辆 (Vehicle)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="legend-dot" style={{ backgroundColor: '#722ed1' }} />
                <span>场桥龙门吊 (YC)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="legend-dot" style={{ backgroundColor: '#52c41a' }} />
                <span>堆存箱区 (Block)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="legend-dot" style={{ backgroundColor: '#fa8c16' }} />
                <span>充电桩 (Charging)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="legend-dot" style={{ backgroundColor: '#13c2c2' }} />
                <span>换电站 (Swapping)</span>
              </div>
              <div style={{ borderTop: '1px solid #f1f3f5', marginTop: '4px', paddingTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--red-text)', fontWeight: 600 }}>
                  <span className="legend-dot" style={{ backgroundColor: 'var(--red-border)' }} />
                  <span>效率偏低告警态</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
