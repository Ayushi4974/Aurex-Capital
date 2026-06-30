import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, GitFork, Network, Users, Activity, Info } from 'lucide-react';
import { api } from '../utils/api';

export default function Hierarchy({ user, isLiveMode, onPresetRegister }) {
  const [searchId, setSearchId] = useState('');
  const [rootNodeId, setRootNodeId] = useState(user.userId);
  const [treeData, setTreeData] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [historyStack, setHistoryStack] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTree = async () => {
      setError('');
      try {
        const tree = await api.getBinaryTree(rootNodeId, isLiveMode);
        if (tree) {
          setTreeData(tree);
        } else {
          setError(`Account ${rootNodeId} not found in structural layouts.`);
        }
      } catch (err) {
        setError('Failed to fetch structural layout.');
        console.error(err);
      }
    };
    fetchTree();
  }, [rootNodeId, isLiveMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      setHistoryStack([...historyStack, rootNodeId]);
      setRootNodeId(searchId.toUpperCase().trim());
      setSearchId('');
    }
  };

  const navigateUp = () => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack(historyStack.slice(0, -1));
      setRootNodeId(prev);
    } else {
      const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
      const current = users.find(u => u.userId === rootNodeId);
      if (current && current.parentId) {
        setRootNodeId(current.parentId);
      }
    }
  };

  const handleNodeClick = (nodeId) => {
    setHistoryStack([...historyStack, rootNodeId]);
    setRootNodeId(nodeId);
  };

  const triggerAddUser = (parentId, placement) => {
    onPresetRegister({
      sponsorId: rootNodeId,
      parentId: parentId,
      placement: placement
    });
  };

  const renderTreeLines = (node, level = 1, x = 500, y = 60, widthOffset = 250) => {
    if (!node) return null;
    const lines = [];
    const nextY = y + 100;

    if (level < 4) {
      if (node.left) {
        lines.push(
          <line key={`l-line-${node.userId}`} x1={x} y1={y} x2={x - widthOffset} y2={nextY}
            stroke="var(--gold-primary)" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.4} />
        );
        lines.push(...renderTreeLines(node.left, level + 1, x - widthOffset, nextY, widthOffset / 2));
      } else {
        lines.push(
          <line key={`l-line-empty-${node.userId}`} x1={x} y1={y} x2={x - widthOffset} y2={nextY}
            stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="2 2" opacity={0.3} />
        );
      }
      if (node.right) {
        lines.push(
          <line key={`r-line-${node.userId}`} x1={x} y1={y} x2={x + widthOffset} y2={nextY}
            stroke="var(--gold-primary)" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.4} />
        );
        lines.push(...renderTreeLines(node.right, level + 1, x + widthOffset, nextY, widthOffset / 2));
      } else {
        lines.push(
          <line key={`r-line-empty-${node.userId}`} x1={x} y1={y} x2={x + widthOffset} y2={nextY}
            stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="2 2" opacity={0.3} />
        );
      }
    }
    return lines;
  };

  const renderTreeNodes = (node, level = 1, x = 500, y = 60, widthOffset = 250) => {
    if (!node) return null;
    const nodesList = [];
    const nextY = y + 100;

    nodesList.push(
      <g key={`node-g-${node.userId}`} style={{ cursor: 'pointer' }}>
        {node.isActive && (
          <circle cx={x} cy={y} r={24} fill="none" stroke="var(--gold-primary)" strokeWidth={2}
            className="shine-animate" style={{ filter: 'blur(3px)', opacity: 0.7 }} />
        )}
        <circle cx={x} cy={y} r={20} fill="var(--bg-card)"
          stroke={node.isActive ? 'var(--gold-primary)' : 'var(--text-muted)'} strokeWidth={2}
          onClick={() => handleNodeClick(node.userId)}
          onMouseEnter={() => setHoveredNode({ ...node, x, y })}
          onMouseLeave={() => setHoveredNode(null)} />
        <g pointerEvents="none" transform={`translate(${x - 9}, ${y - 10})`}>
          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 100-6 3 3 0 000 6z"
            fill={node.isActive ? 'var(--gold-primary)' : 'var(--text-muted)'} />
        </g>
        <text x={x} y={y + 36} textAnchor="middle" fill="var(--text-white)" fontSize={10} fontWeight={600}
          onClick={() => handleNodeClick(node.userId)}>{node.userId}</text>
        <text x={x} y={y + 47} textAnchor="middle" fill="var(--text-grey)" fontSize={8}
          onClick={() => handleNodeClick(node.userId)}>{(node.name || '').split(' ')[0]}</text>
      </g>
    );

    if (level < 4) {
      if (node.left) {
        nodesList.push(...renderTreeNodes(node.left, level + 1, x - widthOffset, nextY, widthOffset / 2));
      } else {
        nodesList.push(
          <g key={`empty-left-${node.userId}`}>
            <circle cx={x - widthOffset} cy={nextY} r={16} fill="var(--input-bg)" stroke="var(--border-grey)" strokeWidth={1.5} />
            <circle cx={x - widthOffset} cy={nextY} r={16} fill="transparent" style={{ cursor: 'pointer' }}
              onClick={() => triggerAddUser(node.userId, 'Left')} />
            <g transform={`translate(${x - widthOffset - 7}, ${nextY - 7})`} pointerEvents="none">
              <path d="M7 1v12M1 7h12" stroke="var(--text-muted)" strokeWidth={2} />
            </g>
          </g>
        );
      }
      if (node.right) {
        nodesList.push(...renderTreeNodes(node.right, level + 1, x + widthOffset, nextY, widthOffset / 2));
      } else {
        nodesList.push(
          <g key={`empty-right-${node.userId}`}>
            <circle cx={x + widthOffset} cy={nextY} r={16} fill="var(--input-bg)" stroke="var(--border-grey)" strokeWidth={1.5} />
            <circle cx={x + widthOffset} cy={nextY} r={16} fill="transparent" style={{ cursor: 'pointer' }}
              onClick={() => triggerAddUser(node.userId, 'Right')} />
            <g transform={`translate(${x + widthOffset - 7}, ${nextY - 7})`} pointerEvents="none">
              <path d="M7 1v12M1 7h12" stroke="var(--text-muted)" strokeWidth={2} />
            </g>
          </g>
        );
      }
    }
    return nodesList;
  };

  const iconBox = (Icon, color, bg) => (
    <div style={{
      width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, border: `1px solid ${color}33`, boxShadow: `0 0 10px ${color}22`, flexShrink: 0
    }}>
      <Icon size={18} style={{ color }} />
    </div>
  );

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(212,175,55,0.15)'
          }}>
            <Network size={26} style={{ color: 'var(--gold-primary)' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
              Binary <span className="gold-text-gradient">MLM Hierarchy</span>
            </h1>
            <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
              Interact with downline network members and place direct sponsors onto structural branches
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {(historyStack.length > 0 || rootNodeId !== user.userId) && (
            <button onClick={navigateUp} className="btn btn-secondary" style={{ padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <ChevronUp size={16} />
              Up One Level
            </button>
          )}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search Account ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="form-input"
              style={{ height: '40px', width: '180px', fontSize: '13px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', borderRadius: '8px', height: '40px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Search size={14} />
              Inspect
            </button>
          </form>
        </div>
      </div>

      {/* Mini stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'VIEWING ACCOUNT', value: rootNodeId, icon: GitFork, color: 'var(--gold-primary)', bg: 'rgba(212,175,55,0.08)' },
          { label: 'LEFT LEG VOLUME', value: `$${(treeData?.leftBusiness || 0).toLocaleString()}`, icon: Activity, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
          { label: 'RIGHT LEG VOLUME', value: `$${(treeData?.rightBusiness || 0).toLocaleString()}`, icon: Activity, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
          { label: 'TEAM MEMBERS', value: treeData?.totalTeam ?? '—', icon: Users, color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="glass-card shifting-card"
            style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            {iconBox(s.icon, s.color, s.bg)}
            <div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-white)', marginTop: '2px' }}>{s.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '14px', borderRadius: '8px', color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} />
          {error}
        </div>
      )}

      <motion.div
        whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
        className="glass-card shifting-card"
        style={{ padding: '24px', position: 'relative', background: 'var(--glass-bg)', minHeight: '520px' }}
      >
        <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)', fontWeight: 700 }}>
          <Network size={16} style={{ color: 'var(--gold-primary)' }} />
          Network Visualization — Click an account to drill down
        </h3>

        {treeData ? (
          <div className="mobile-scrollable-table" style={{ position: 'relative', minHeight: '480px', width: '100%' }}>
            <svg width="1000" height="480" style={{ margin: '0 auto', display: 'block' }}>
              {renderTreeLines(treeData)}
              {renderTreeNodes(treeData)}
            </svg>

            {/* Tooltip detail card */}
            <AnimatePresence>
              {hoveredNode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    top: `${hoveredNode.y - 120}px`,
                    left: `${hoveredNode.x > 700 ? hoveredNode.x - 220 : hoveredNode.x + 30}px`,
                    width: '240px',
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border-gold)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 0 10px var(--gold-glow)',
                    borderRadius: '12px',
                    padding: '16px',
                    zIndex: 100
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--gold-primary)' }}>{hoveredNode.userId}</span>
                    <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', fontWeight: 600, background: hoveredNode.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: hoveredNode.isActive ? '#34d399' : '#f87171' }}>
                      {hoveredNode.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{hoveredNode.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-grey)', marginBottom: '10px' }}>Rank: <strong>{hoveredNode.rank}</strong></p>
                  <div className="responsive-grid-2" style={{ borderTop: '1px solid var(--border-grey)', paddingTop: '8px', gap: '8px', fontSize: '11px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Left Vol:</span>
                      <p style={{ fontWeight: 600 }}>${hoveredNode.leftBusiness.toLocaleString()}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Right Vol:</span>
                      <p style={{ fontWeight: 600 }}>${hoveredNode.rightBusiness.toLocaleString()}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Self:</span>
                      <p style={{ fontWeight: 600 }}>${hoveredNode.selfBusiness.toLocaleString()}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Team:</span>
                      <p style={{ fontWeight: 600 }}>{hoveredNode.totalTeam} accounts</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '420px', color: 'var(--text-muted)', flexDirection: 'column', gap: '12px' }}>
            <Network size={40} style={{ opacity: 0.3 }} />
            Loading network hierarchy...
          </div>
        )}
      </motion.div>
    </div>
  );
}
