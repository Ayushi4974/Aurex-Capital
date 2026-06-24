import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, User, ZoomIn, ZoomOut, UserPlus, Info } from 'lucide-react';
import { api } from '../utils/api';

export default function BinaryTree({ user, isLiveMode, onNavigate, onPresetRegister }) {
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
          setError(`Account ${rootNodeId} not found in the binary structure.`);
        }
      } catch (err) {
        setError('Failed to fetch tree structure.');
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
      // Find parent of current root node
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
    // Presets sponsorId = parentId (or root node) and parentId, placement
    onPresetRegister({
      sponsorId: rootNodeId,
      parentId: parentId,
      placement: placement
    });
  };

  // Node position coordinates for a clean binary tree visualization in a responsive container
  // Level 1: (500, 60)
  // Level 2: Left (250, 160), Right (750, 160)
  // Level 3: LL (120, 260), LR (380, 260), RL (620, 260), RR (880, 260)
  // Level 4: LLL (50, 360), LLR (190, 360), LRL (310, 360), LRR (450, 360), etc.

  const renderTreeLines = (node, level = 1, x = 500, y = 60, widthOffset = 250) => {
    if (!node) return null;
    
    const lines = [];
    const nextY = y + 100;

    if (level < 4) {
      if (node.left) {
        lines.push(
          <line
            key={`l-line-${node.userId}`}
            x1={x}
            y1={y}
            x2={x - widthOffset}
            y2={nextY}
            stroke="var(--gold-primary)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            opacity={0.4}
          />
        );
        lines.push(...renderTreeLines(node.left, level + 1, x - widthOffset, nextY, widthOffset / 2));
      } else {
        // Line to empty spot
        lines.push(
          <line
            key={`l-line-empty-${node.userId}`}
            x1={x}
            y1={y}
            x2={x - widthOffset}
            y2={nextY}
            stroke="var(--text-muted)"
            strokeWidth={1}
            strokeDasharray="2 2"
            opacity={0.3}
          />
        );
      }

      if (node.right) {
        lines.push(
          <line
            key={`r-line-${node.userId}`}
            x1={x}
            y1={y}
            x2={x + widthOffset}
            y2={nextY}
            stroke="var(--gold-primary)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            opacity={0.4}
          />
        );
        lines.push(...renderTreeLines(node.right, level + 1, x + widthOffset, nextY, widthOffset / 2));
      } else {
        // Line to empty spot
        lines.push(
          <line
            key={`r-line-empty-${node.userId}`}
            x1={x}
            y1={y}
            x2={x + widthOffset}
            y2={nextY}
            stroke="var(--text-muted)"
            strokeWidth={1}
            strokeDasharray="2 2"
            opacity={0.3}
          />
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
        {/* Glowing aura if active */}
        {node.isActive && (
          <circle
            cx={x}
            cy={y}
            r={24}
            fill="none"
            stroke="var(--gold-primary)"
            strokeWidth={2}
            className="shine-animate"
            style={{
              filter: 'blur(3px)',
              opacity: 0.7
            }}
          />
        )}

        {/* Outer container circle */}
        <circle
          cx={x}
          cy={y}
          r={20}
          fill="var(--bg-card)"
          stroke={node.isActive ? 'var(--gold-primary)' : 'var(--text-muted)'}
          strokeWidth={2}
          onClick={() => handleNodeClick(node.userId)}
          onMouseEnter={(e) => setHoveredNode({ ...node, x, y })}
          onMouseLeave={() => setHoveredNode(null)}
        />

        {/* Small icon representation */}
        <g pointerEvents="none" transform={`translate(${x - 9}, ${y - 10})`}>
          <path
            d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 100-6 3 3 0 000 6z"
            fill={node.isActive ? 'var(--gold-primary)' : 'var(--text-muted)'}
          />
        </g>

        {/* Under label */}
        <text
          x={x}
          y={y + 36}
          textAnchor="middle"
          fill="var(--text-white)"
          fontSize={10}
          fontWeight={600}
          onClick={() => handleNodeClick(node.userId)}
        >
          {node.userId}
        </text>
        <text
          x={x}
          y={y + 47}
          textAnchor="middle"
          fill="var(--text-grey)"
          fontSize={8}
          onClick={() => handleNodeClick(node.userId)}
        >
          {node.name.split(' ')[0]}
        </text>
      </g>
    );

    // Render Empty slots if children are missing
    if (level < 4) {
      if (node.left) {
        nodesList.push(...renderTreeNodes(node.left, level + 1, x - widthOffset, nextY, widthOffset / 2));
      } else {
        nodesList.push(
          <g key={`empty-left-${node.userId}`}>
            <circle
              cx={x - widthOffset}
              cy={nextY}
              r={16}
              fill="var(--input-bg)"
              stroke="var(--border-grey)"
              strokeWidth={1.5}
            />
            {/* Clickable plus */}
            <circle
              cx={x - widthOffset}
              cy={nextY}
              r={16}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => triggerAddUser(node.userId, 'Left')}
            />
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
            <circle
              cx={x + widthOffset}
              cy={nextY}
              r={16}
              fill="var(--input-bg)"
              stroke="var(--border-grey)"
              strokeWidth={1.5}
            />
            {/* Clickable plus */}
            <circle
              cx={x + widthOffset}
              cy={nextY}
              r={16}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => triggerAddUser(node.userId, 'Right')}
            />
            <g transform={`translate(${x + widthOffset - 7}, ${nextY - 7})`} pointerEvents="none">
              <path d="M7 1v12M1 7h12" stroke="var(--text-muted)" strokeWidth={2} />
            </g>
          </g>
        );
      }
    }

    return nodesList;
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Upper bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
            Binary Tree <span className="gold-text-gradient">Visualizer</span>
          </h1>
          <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
            Drill down tree legs, inspect account metrics, and sponsor placements directly on the canvas
          </p>
        </div>

        {/* Search & Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Back up */}
          {(historyStack.length > 0 || rootNodeId !== user.userId) && (
            <button
              onClick={navigateUp}
              className="btn btn-secondary"
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              <ChevronUp size={16} />
              Up One Level
            </button>
          )}

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search Account ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px', height: '40px', width: '180px', fontSize: '13px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', borderRadius: '8px', height: '40px', fontSize: '13px' }}>
              Inspect
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '14px',
          borderRadius: '8px',
          color: '#f87171',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Main Canvas wrapper */}
      <div className="glass-card" style={{
        padding: '24px',
        position: 'relative',
        background: 'var(--glass-bg)',
        overflow: 'hidden',
        minHeight: '520px',
        border: '1px solid var(--border-grey)'
      }}>
        {/* Navigation Info */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: '12px',
          zIndex: 10
        }}>
          <span>✦ Clicking accounts sets them as Root</span>
          <span>✦ Click "+" to add new downline register</span>
        </div>

        {/* Tree Container */}
        {treeData ? (
          <div className="mobile-scrollable-table" style={{
            position: 'relative',
            width: '100%',
            minHeight: '480px'
          }}>
            <svg
              width="1000"
              height="480"
              style={{
                margin: '0 auto',
                display: 'block'
              }}
            >
              {/* Draw Lines */}
              {renderTreeLines(treeData)}

              {/* Draw Nodes */}
              {renderTreeNodes(treeData)}
            </svg>

            {/* Custom Node Tooltip */}
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
                    zIndex: 100,
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--gold-primary)' }}>{hoveredNode.userId}</span>
                    <span style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      background: hoveredNode.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: hoveredNode.isActive ? '#34d399' : '#f87171'
                    }}>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '420px',
            color: 'var(--text-muted)'
          }}>
            Loading binary structure...
          </div>
        )}
      </div>
    </div>
  );
}
