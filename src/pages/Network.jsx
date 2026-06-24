import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { getNexusPackageName } from '../utils/simDb';
import { 
  Users, 
  Award, 
  Copy, 
  Check, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Lock, 
  Unlock, 
  Info, 
  TrendingUp, 
  Activity, 
  DollarSign
} from 'lucide-react';

// TreeNode Component for collapsible genealogy tree
function TreeNode({ 
  node, 
  expandedNodes, 
  toggleExpand, 
  onSelectNode, 
  searchHighlightId, 
  sponsorMap 
}) {
  const isExpanded = !!expandedNodes[node.userId];
  const hasChildren = node.children && node.children.length > 0;
  const isHighlighted = node.userId === searchHighlightId;
  const isActive = node.isActive;
  
  // Calculate total business of this node's subtree (including self)
  const calculateSubtreeBusiness = (n) => {
    let sum = n.business?.self || 0;
    if (n.children) {
      n.children.forEach(c => {
        sum += calculateSubtreeBusiness(c);
      });
    }
    return sum;
  };
  
  const subtreeBusiness = calculateSubtreeBusiness(node);

  return (
    <div id={`node-${node.userId}`} style={{ marginLeft: node.level > 0 ? '24px' : '0', position: 'relative' }}>
      {/* Node Row Card */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          margin: '6px 0',
          borderRadius: '10px',
          background: isHighlighted 
            ? 'rgba(212, 175, 55, 0.2)' 
            : 'rgba(255, 255, 255, 0.02)',
          border: isHighlighted 
            ? '1.5px solid var(--border-gold)' 
            : '1px solid rgba(255, 255, 255, 0.06)',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          maxWidth: '550px',
          boxShadow: isHighlighted ? '0 0 15px rgba(212, 175, 55, 0.15)' : 'none'
        }}
        onClick={() => onSelectNode(node)}
      >
        {/* Status indicator dot */}
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: isActive ? '#10b981' : '#ef4444',
          boxShadow: isActive ? '0 0 8px #10b981' : '0 0 8px #ef4444',
          flexShrink: 0
        }} />

        {/* User Info Details */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-white)' }}>
              {node.name}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {node.userId}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-grey)', marginTop: '4px' }}>
            <span>Package: <strong style={{ color: 'var(--text-white)' }}>{getNexusPackageName(node.business?.self || 0)}</strong> (${(node.business?.self || 0).toLocaleString()})</span>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>Biz: ${subtreeBusiness.toLocaleString()}</span>
          </div>
        </div>

        {/* Expand / Collapse Button Indicator */}
        {hasChildren && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.userId);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-white)',
              borderRadius: '6px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
              padding: 0
            }}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {/* Recursive downlines branches */}
      {hasChildren && isExpanded && (
        <div style={{
          borderLeft: '1px dashed rgba(212, 175, 55, 0.2)',
          marginLeft: '18px',
          paddingLeft: '6px',
          position: 'relative'
        }}>
          {node.children.map(child => (
            <TreeNode 
              key={child.userId} 
              node={child} 
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
              onSelectNode={onSelectNode}
              searchHighlightId={searchHighlightId}
              sponsorMap={sponsorMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Network({ user, isLiveMode, refreshTrigger }) {
  const [usersList, setUsersList] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('genealogy');
  
  // Search and Genealogy State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHighlightId, setSearchHighlightId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Accordion state for Level View tab
  const [expandedLevels, setExpandedLevels] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const allUsers = await api.adminGetUsers(isLiveMode);
        setUsersList(allUsers);
        
        // Expand the root user by default
        setExpandedNodes({ [user.userId]: true });
      } catch (err) {
        console.error('Failed to load user network list:', err);
      }
    };
    fetchAllData();
  }, [user.userId, isLiveMode, refreshTrigger]);

  // Construct sponsor-child mapping dictionary
  const sponsorMap = {};
  usersList.forEach(u => {
    if (u.sponsorId) {
      if (!sponsorMap[u.sponsorId]) {
        sponsorMap[u.sponsorId] = [];
      }
      sponsorMap[u.sponsorId].push(u);
    }
  });

  // Dynamic 30-Generation Unilevel Downline Traversal
  const levelData = {};
  let currentParentIds = [user.userId];
  const allDownline = [];

  for (let l = 1; l <= 30; l++) {
    const levelMembers = [];
    currentParentIds.forEach(pId => {
      const children = sponsorMap[pId] || [];
      levelMembers.push(...children);
    });

    if (levelMembers.length === 0) break; // Terminate early if no further generations exist

    levelData[l] = levelMembers;
    allDownline.push(...levelMembers);
    currentParentIds = levelMembers.map(m => m.userId);
  }

  // Calculate maximum level depth that actually contains members
  const maxActiveLevel = Object.keys(levelData).reduce((max, lvl) => Math.max(max, parseInt(lvl)), 0);

  // Overview Statistics
  const totalDirects = (levelData[1] || []).length;
  const activeDirects = (levelData[1] || []).filter(u => u.isActive).length;
  const inactiveDirects = totalDirects - activeDirects;
  
  const totalTeamMembers = allDownline.length;
  const activeTeamMembers = allDownline.filter(u => u.isActive).length;
  const inactiveTeamMembers = totalTeamMembers - activeTeamMembers;

  const totalTeamBusiness = allDownline.reduce((sum, u) => sum + (u.business?.self || 0), 0);

  // Level Unlock Logic Function
  const getUnlockedLevelsCount = (directs) => {
    if (directs >= 10) return 30;
    if (directs >= 8) return 20;
    if (directs >= 6) return 15;
    if (directs >= 4) return 10;
    if (directs >= 2) return 5;
    return 0; // Less than 2 directs unlocks 0 levels
  };

  const unlockedLevelsCount = getUnlockedLevelsCount(totalDirects);

  // Referral Invite Link
  const sponsorLink = `${window.location.origin}/register?sponsor=${user.userId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sponsorLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build recursive unilevel tree for the Genealogy Tree rendering
  const buildUnilevelTree = (userId, currentLvl = 1, visited = new Set()) => {
    if (visited.has(userId)) return null;
    visited.add(userId);

    const userObj = usersList.find(u => u.userId === userId);
    if (!userObj) return null;

    const children = sponsorMap[userId] || [];
    return {
      ...userObj,
      level: currentLvl - 1,
      children: currentLvl <= 30 
        ? children.map(c => buildUnilevelTree(c.userId, currentLvl + 1, visited)).filter(Boolean) 
        : []
    };
  };

  const rootNode = usersList.find(u => u.userId === user.userId) 
    ? buildUnilevelTree(user.userId) 
    : null;

  // Search function for the Genealogy Tree
  const handleSearchNode = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchHighlightId(null);
      return;
    }
    const term = searchQuery.toLowerCase().trim();
    const match = allDownline.find(u => 
      u.userId.toLowerCase() === term || 
      u.name.toLowerCase().includes(term)
    );

    if (match) {
      // Auto-expand all ancestor nodes up to parent sponsor
      const newExpanded = { ...expandedNodes };
      let curr = match;
      while (curr && curr.sponsorId) {
        newExpanded[curr.sponsorId] = true;
        curr = usersList.find(u => u.userId === curr.sponsorId);
      }
      setExpandedNodes(newExpanded);
      setSearchHighlightId(match.userId);
      setSelectedMember(match);
      
      // Auto-scroll logic if element is in view
      setTimeout(() => {
        const el = document.getElementById(`node-${match.userId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } else {
      alert(`No active downline found matching "${searchQuery}"`);
    }
  };

  // Helper to fetch total downline counts/business details of a selected member
  const getSubtreeStats = (userId) => {
    let teamCount = 0;
    let teamBusiness = 0;
    const traverse = (id) => {
      const children = sponsorMap[id] || [];
      children.forEach(c => {
        teamCount++;
        teamBusiness += c.business?.self || 0;
        traverse(c.userId);
      });
    };
    traverse(userId);
    return { teamCount, teamBusiness };
  };

  // Level requirements descriptions mapping helper
  const getRequiredDirectsForLevel = (l) => {
    if (l <= 5) return 2;
    if (l <= 10) return 4;
    if (l <= 15) return 6;
    if (l <= 20) return 8;
    return 10;
  };

  // Commission distribution percentages mapping helper
  const getLevelPercentage = (lvl) => {
    if (lvl === 1) return 0.10;
    if (lvl === 2) return 0.05;
    if (lvl === 3) return 0.03;
    if (lvl === 4) return 0.02;
    if (lvl === 5) return 0.02;
    if (lvl >= 6 && lvl <= 10) return 0.01;
    if (lvl >= 11 && lvl <= 20) return 0.005;
    if (lvl >= 21 && lvl <= 30) return 0.0025;
    return 0;
  };

  // Rank Milestones target mapping list
  const rankMilestones = [
    { name: 'Member', target: 0, reward: 'Account Activated' },
    { name: 'Explorer', target: 5000, reward: '$250 Cash Reward' },
    { name: 'Navigator', target: 10000, reward: '$500 Gold Voucher' },
    { name: 'Pioneer', target: 15000, reward: '$750 Travel Voucher' },
    { name: 'Visionary', target: 50000, reward: '$2,500 Cash Reward' },
    { name: 'Titan', target: 100000, reward: '$5,000 Rolex Watch' },
    { name: 'Galaxy', target: 500000, reward: '$25,000 Luxury Sports Car' },
    { name: 'Nexus Crown', target: 1000000, reward: '$50,000 Luxury Cruise & Asset' }
  ];

  const currentRank = user.rank || 'Member';
  
  // Find current and next rank target mapping progress details
  const nextMilestone = rankMilestones.find(r => totalTeamBusiness < r.target) || { name: 'Nexus Crown', target: 1000000, reward: 'Max Rank Achieved' };
  const prevMilestone = [...rankMilestones].reverse().find(r => totalTeamBusiness >= r.target) || rankMilestones[0];

  const progressPercent = nextMilestone.target > prevMilestone.target
    ? Math.min(100, Math.max(0, ((totalTeamBusiness - prevMilestone.target) / (nextMilestone.target - prevMilestone.target)) * 100))
    : 100;

  // Toggle level visibility accordion rows
  const toggleLevelAccordion = (lvl) => {
    setExpandedLevels(prev => ({
      ...prev,
      [lvl]: !prev[lvl]
    }));
  };

  // Toggle tree node expanded state
  const toggleNodeExpand = (userId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <div className="page-container">
      
      {/* Title Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Team & <span className="gold-text-gradient">Referrals Hub</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Real-time MLM downline tracking, genealogy unilevel mapping, and generation income overrides across 30 levels.
        </p>
      </div>

      {/* Grid: Overview dashboard + Sponsor Links */}
      <div className="responsive-grid-12-1" style={{ gap: '24px', alignItems: 'stretch' }}>
        
        {/* Team Overview Dashboard */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> Team Overview Dashboard
          </h3>
          
          <div className="responsive-grid-3" style={{ gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>DIRECTS REFERRALS</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{totalDirects}</h3>
              <span style={{ fontSize: '9px', color: '#34d399' }}>{activeDirects} Act</span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', margin: '0 4px' }}>|</span>
              <span style={{ fontSize: '9px', color: '#f87171' }}>{inactiveDirects} Inact</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL TEAM</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{totalTeamMembers}</h3>
              <span style={{ fontSize: '9px', color: '#34d399' }}>{activeTeamMembers} Act</span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', margin: '0 4px' }}>|</span>
              <span style={{ fontSize: '9px', color: '#f87171' }}>{inactiveTeamMembers} Inact</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>TEAM BUSINESS</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '6px', color: 'var(--gold-primary)' }}>
                ${totalTeamBusiness.toLocaleString()}
              </h3>
              <span style={{ fontSize: '9px', color: 'var(--text-grey)' }}>Unilevel Volume</span>
            </div>
          </div>

          <div className="responsive-grid-12-1" style={{ gap: '12px' }}>
            <div style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid var(--border-gold)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Unlock size={18} style={{ color: 'var(--gold-primary)' }} />
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-grey)', display: 'block' }}>ELIGIBLE UNLOCKED LEVELS</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-white)' }}>{unlockedLevelsCount} Generations</strong>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={18} style={{ color: 'var(--gold-primary)' }} />
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-grey)', display: 'block' }}>CURRENT RANK STATUS</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-white)' }}>{currentRank}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Copy Invite Link & QR Portal */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', color: 'var(--gold-primary)' }}>Referral Link & QR</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-grey)', marginTop: '2px' }}>
              Recruit members under your direct sponsorship matrix.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--input-bg)',
            border: '1px solid var(--border-grey)',
            borderRadius: '8px',
            padding: '10px 14px',
            gap: '10px'
          }}>
            <input 
              type="text" 
              readOnly 
              value={sponsorLink} 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-white)',
                fontSize: '11.5px',
                flex: 1,
                outline: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            />
            <button 
              onClick={handleCopy} 
              style={{
                background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                border: 'none',
                color: copied ? '#34d399' : 'var(--gold-primary)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '6px',
              background: '#ffffff',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=56x56&data=${encodeURIComponent(sponsorLink)}&color=050505&bgcolor=ffffff`}
                alt="Sponsor QR"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-grey)', lineHeight: '1.4' }}>
              Let new members scan this QR code to quickly prefill Sponsor ID <strong style={{ color: 'var(--gold-primary)' }}>{user.userId}</strong> in register fields.
            </p>
          </div>
        </div>

      </div>

      {/* Tabs navigation row */}
      <div className="scrollable-tabs-container">
        {[
          { id: 'genealogy', label: 'Genealogy Tree', icon: Users },
          { id: 'level-view', label: 'Level View', icon: Layers },
          { id: 'business', label: 'Team Business', icon: TrendingUp },
          { id: 'income', label: 'Level Income', icon: DollarSign },
          { id: 'rank', label: 'Rank Progress', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--gold-primary)' : '2px solid transparent',
                color: isActive ? 'var(--gold-primary)' : 'var(--text-grey)',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
                flexShrink: 0
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main tab content workspace */}
      <div className="glass-card" style={{ padding: '28px', minHeight: '400px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* TAB 1: GENEALOGY TREE */}
            {activeTab === 'genealogy' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)' }}>MLM Generation Tree</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '2px' }}>
                      Expand members to view downlines. Click a member to view its direct team metrics and contact info.
                    </p>
                  </div>
                  
                  {/* Search user node */}
                  <form onSubmit={handleSearchNode} style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-grey)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      gap: '8px'
                    }}>
                      <Search size={14} style={{ color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        placeholder="Search User ID or Name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-white)',
                          fontSize: '12px',
                          outline: 'none',
                          width: '180px'
                        }}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    >
                      Find
                    </button>
                  </form>
                </div>

                {/* Tree and Sidebar Layout */}
                <div className={selectedMember ? "responsive-grid-15-1" : "responsive-grid-1-col"} style={{ gap: '28px', alignItems: 'start' }}>
                  
                  {/* Left Column: Recursive tree container */}
                  <div style={{ 
                    background: 'var(--input-bg)', 
                    border: '1px solid var(--border-grey)', 
                    borderRadius: '12px', 
                    padding: '20px', 
                    maxHeight: '550px', 
                    overflowY: 'auto' 
                  }}>
                    {rootNode ? (
                      <div id={`node-${rootNode.userId}`}>
                        {/* Render "You" node */}
                        <div 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: rootNode.userId === searchHighlightId ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.05)',
                            border: '1.5px solid var(--border-gold)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            maxWidth: '550px'
                          }}
                          onClick={() => setSelectedMember(rootNode)}
                        >
                          <span style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            boxShadow: '0 0 8px #10b981',
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--text-white)' }}>You ({rootNode.name})</strong>
                              <span style={{ fontSize: '11px', color: 'var(--gold-primary)', fontWeight: 700 }}>Root</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-grey)', marginTop: '2px' }}>
                              <span>Pkg: {getNexusPackageName(rootNode.business?.self || 0)} (${(rootNode.business?.self || 0).toLocaleString()})</span>
                              <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>Biz: ${totalTeamBusiness.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Render children recursively */}
                        {rootNode.children && rootNode.children.length > 0 && (
                          <div style={{
                            borderLeft: '1px dashed rgba(212, 175, 55, 0.2)',
                            marginLeft: '18px',
                            paddingLeft: '6px',
                            marginTop: '4px'
                          }}>
                            {rootNode.children.map(child => (
                              <TreeNode 
                                key={child.userId} 
                                node={child} 
                                expandedNodes={expandedNodes}
                                toggleExpand={toggleNodeExpand}
                                onSelectNode={setSelectedMember}
                                searchHighlightId={searchHighlightId}
                                sponsorMap={sponsorMap}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        No genealogy tree members found.
                      </p>
                    )}
                  </div>

                  {/* Right Column: Member Profile detail card */}
                  {selectedMember && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card" 
                      style={{ 
                        padding: '24px', 
                        border: '1.5px solid var(--border-gold)',
                        background: 'rgba(10, 10, 10, 0.95)',
                        position: 'sticky',
                        top: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '15px', fontFamily: 'var(--font-display)', color: 'var(--gold-primary)' }}>Member Profile</h4>
                        <button 
                          onClick={() => setSelectedMember(null)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Close [X]
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <img 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedMember.name)}`}
                          alt="Avatar"
                          style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--border-gold)' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '15px', color: 'var(--text-white)', fontWeight: 700 }}>{selectedMember.name}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-grey)' }}>ID: {selectedMember.userId}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-grey)' }}>Status</span>
                          <span style={{ color: selectedMember.isActive ? '#34d399' : '#f87171', fontWeight: 700 }}>
                            {selectedMember.isActive ? 'Active Account' : 'Inactive Account'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-grey)' }}>Sponsor ID</span>
                          <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>{selectedMember.sponsorId || 'None'}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-grey)' }}>Self Package</span>
                          <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>
                            {getNexusPackageName(selectedMember.business?.self || 0)} (${(selectedMember.business?.self || 0).toLocaleString()})
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-grey)' }}>Joined Date</span>
                          <span style={{ color: 'var(--text-white)' }}>{new Date(selectedMember.doj).toLocaleDateString()}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-grey)' }}>Rank Achievement</span>
                          <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>{selectedMember.rank || 'Member'}</span>
                        </div>

                        {/* Subtree metrics calculators */}
                        {(() => {
                          const stats = getSubtreeStats(selectedMember.userId);
                          return (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-grey)' }}>Downline Team</span>
                                <span style={{ color: 'var(--text-white)', fontWeight: 700 }}>{stats.teamCount} Members</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                                <span style={{ color: 'var(--text-grey)' }}>Downline Business</span>
                                <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>${stats.teamBusiness.toLocaleString()}</span>
                              </div>
                            </>
                          );
                        })()}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                          <span style={{ color: 'var(--text-grey)', fontSize: '10px' }}>CONTACT SUMMARY</span>
                          <span style={{ color: 'var(--text-white)' }}>Email: {selectedMember.email}</span>
                          <span style={{ color: 'var(--text-white)' }}>Mobile: {selectedMember.mobile}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>
              </div>
            )}

            {/* TAB 2: LEVEL VIEW */}
            {activeTab === 'level-view' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)' }}>Unilevel Generations List</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '2px' }}>
                    Track members separated by generations. Levels beyond your eligibility are locked until you register more direct referrals.
                  </p>
                </div>

                {/* Level list view */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const lvl = idx + 1;
                    const membersCount = (levelData[lvl] || []).length;
                    const isLocked = lvl > unlockedLevelsCount;
                    const isOpen = !!expandedLevels[lvl];
                    const reqDirects = getRequiredDirectsForLevel(lvl);

                    return (
                      <div 
                        key={lvl} 
                        style={{ 
                          background: isLocked ? 'var(--input-bg)' : 'transparent',
                          border: isLocked ? '1px dashed var(--border-grey)' : '1px solid var(--border-grey)',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          opacity: isLocked ? 0.6 : 1
                        }}
                      >
                        {/* Accordion header */}
                        <div 
                          onClick={() => {
                            if (isLocked) {
                              alert(`Level ${lvl} is Locked.\nRequires at least ${reqDirects} Direct Referrals.\nYou currently have ${totalDirects} Direct Referrals.`);
                              return;
                            }
                            toggleLevelAccordion(lvl);
                          }}
                          style={{
                            padding: '16px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            background: isOpen ? 'rgba(212,175,55,0.04)' : 'transparent'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isLocked ? (
                              <Lock size={16} style={{ color: '#ef4444' }} />
                            ) : (
                              <Unlock size={16} style={{ color: '#10b981' }} />
                            )}
                            <strong style={{ fontSize: '14px', color: isLocked ? 'var(--text-muted)' : 'var(--text-white)' }}>
                              Generation Level {lvl}
                            </strong>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'var(--text-grey)',
                              fontWeight: 600
                            }}>
                              {membersCount} Members
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            {isLocked && (
                              <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 600 }}>
                                Requires {reqDirects} Directs (You have {totalDirects})
                              </span>
                            )}
                            {!isLocked && (
                              isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                            )}
                          </div>
                        </div>

                        {/* Accordion Content table list */}
                        {!isLocked && isOpen && (
                          <div style={{ padding: '20px', background: 'var(--input-bg)', borderTop: '1px solid var(--border-grey)', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                  <th style={{ padding: '10px' }}>User ID</th>
                                  <th style={{ padding: '10px' }}>Name</th>
                                  <th style={{ padding: '10px' }}>Package</th>
                                  <th style={{ padding: '10px' }}>Self Investment</th>
                                  <th style={{ padding: '10px' }}>Joining Date</th>
                                  <th style={{ padding: '10px', textAlign: 'right' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {membersCount === 0 ? (
                                  <tr>
                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                      No team members registered at Level {lvl} yet.
                                    </td>
                                  </tr>
                                ) : (
                                  levelData[lvl].map(member => (
                                    <tr key={member.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', hover: { background: 'rgba(255,255,255,0.01)' } }}>
                                      <td style={{ padding: '10px', fontWeight: 700 }}>{member.userId}</td>
                                      <td style={{ padding: '10px', fontWeight: 600 }}>{member.name}</td>
                                      <td style={{ padding: '10px', color: 'var(--gold-primary)', fontWeight: 600 }}>
                                        {getNexusPackageName(member.business?.self || 0)}
                                      </td>
                                      <td style={{ padding: '10px', fontWeight: 700 }}>
                                        ${(member.business?.self || 0).toLocaleString()}
                                      </td>
                                      <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                                        {new Date(member.doj).toLocaleDateString()}
                                      </td>
                                      <td style={{ padding: '10px', textAlign: 'right' }}>
                                        <span style={{
                                          color: member.isActive ? '#34d399' : '#f87171',
                                          fontWeight: 700,
                                          fontSize: '11px'
                                        }}>
                                          {member.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: TEAM BUSINESS */}
            {activeTab === 'business' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)' }}>Team Business Report</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '2px' }}>
                    Summary of downline member counts and business volume contributions generated at each generation level.
                  </p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px' }}>Level</th>
                        <th style={{ padding: '12px' }}>Active Members</th>
                        <th style={{ padding: '12px' }}>Total Business Volume</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 30 }).map((_, idx) => {
                        const lvl = idx + 1;
                        const levelMembers = levelData[lvl] || [];
                        const membersCount = levelMembers.length;
                        const businessVol = levelMembers.reduce((sum, m) => sum + (m.business?.self || 0), 0);
                        const isLocked = lvl > unlockedLevelsCount;

                        return (
                          <tr 
                            key={lvl} 
                            style={{ 
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                              opacity: isLocked ? 0.5 : 1,
                              background: isLocked ? 'rgba(0,0,0,0.05)' : 'transparent'
                            }}
                          >
                            <td style={{ padding: '12px', fontWeight: 700 }}>L{lvl}</td>
                            <td style={{ padding: '12px' }}>{membersCount} Accounts</td>
                            <td style={{ padding: '12px', fontWeight: 700, color: isLocked ? 'var(--text-muted)' : 'var(--gold-primary)' }}>
                              ${businessVol.toLocaleString()}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              {isLocked ? (
                                <span style={{ color: '#f87171', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                  <Lock size={12} /> Locked
                                </span>
                              ) : (
                                <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                  <Unlock size={12} /> Unlocked
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: LEVEL INCOME */}
            {activeTab === 'income' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)' }}>Level Override Income</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '2px' }}>
                    Generate generational income payouts from your downlines based on MLM percentage yields.
                  </p>
                </div>

                {/* Summary boxes */}
                {(() => {
                  let earnedTotal = 0;
                  let potentialLockedTotal = 0;

                  Array.from({ length: 30 }).forEach((_, idx) => {
                    const lvl = idx + 1;
                    const levelMembers = levelData[lvl] || [];
                    const businessVol = levelMembers.reduce((sum, m) => sum + (m.business?.self || 0), 0);
                    const pct = getLevelPercentage(lvl);
                    const isLocked = lvl > unlockedLevelsCount;

                    if (isLocked) {
                      potentialLockedTotal += businessVol * pct;
                    } else {
                      earnedTotal += businessVol * pct;
                    }
                  });

                  return (
                    <div className="responsive-grid-2" style={{ gap: '20px' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-grey)', display: 'block' }}>TOTAL GENERATION INCOME EARNED</span>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                          ${earnedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                      </div>
                      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-grey)', display: 'block' }}>TOTAL POTENTIAL INCOME LOCKED</span>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
                          ${potentialLockedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                      </div>
                    </div>
                  );
                })()}

                {/* Detail table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Level</th>
                        <th style={{ padding: '10px' }}>MLM Percentage</th>
                        <th style={{ padding: '10px' }}>Business Volume</th>
                        <th style={{ padding: '10px' }}>Commission Payout</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 30 }).map((_, idx) => {
                        const lvl = idx + 1;
                        const levelMembers = levelData[lvl] || [];
                        const businessVol = levelMembers.reduce((sum, m) => sum + (m.business?.self || 0), 0);
                        const pct = getLevelPercentage(lvl);
                        const payout = businessVol * pct;
                        const isLocked = lvl > unlockedLevelsCount;

                        return (
                          <tr 
                            key={lvl} 
                            style={{ 
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                              opacity: isLocked ? 0.5 : 1,
                              background: isLocked ? 'rgba(0,0,0,0.04)' : 'transparent'
                            }}
                          >
                            <td style={{ padding: '10px', fontWeight: 700 }}>Level {lvl}</td>
                            <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-white)' }}>
                              {(pct * 100).toFixed(2)}%
                            </td>
                            <td style={{ padding: '10px' }}>${businessVol.toLocaleString()}</td>
                            <td style={{ padding: '10px', fontWeight: 700, color: isLocked ? '#f87171' : '#34d399' }}>
                              ${payout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                              {isLocked ? (
                                <span style={{ color: '#f87171', fontWeight: 600, fontSize: '11px' }}>Potential (Locked)</span>
                              ) : (
                                <span style={{ color: '#34d399', fontWeight: 600, fontSize: '11px' }}>Paid / Active</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: RANK PROGRESS & ANALYTICS */}
            {activeTab === 'rank' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* Progress bar to next rank */}
                <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border-gold)', background: 'rgba(212,175,55,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>CURRENT ACHIEVEMENT RANK</span>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-white)' }}>{currentRank}</h3>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>NEXT TARGET RANK</span>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold-primary)' }}>{nextMilestone.name}</h3>
                    </div>
                  </div>

                  {nextMilestone.name !== 'Nexus Crown' || totalTeamBusiness < nextMilestone.target ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-grey)', marginBottom: '8px' }}>
                        <span>Next Milestone Requirement: <strong>${nextMilestone.target.toLocaleString()} Team Business</strong></span>
                        <span>{progressPercent.toFixed(1)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-primary))', borderRadius: '5px', transition: 'width 0.4s' }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Achieved: <strong>${totalTeamBusiness.toLocaleString()}</strong></span>
                        <span style={{ color: 'var(--text-muted)' }}>Remaining: <strong>${Math.max(0, nextMilestone.target - totalTeamBusiness).toLocaleString()}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '10px' }}>
                      <strong style={{ color: 'var(--gold-primary)' }}>🎉 MAX LEADERSHIP RANK ACHIEVED! 🎉</strong>
                    </div>
                  )}
                </div>

                {/* Team Growth Analytics Section */}
                <div>
                  <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} style={{ color: 'var(--gold-primary)' }} /> Downline Growth Analytics
                  </h3>

                  <div className="responsive-grid-2" style={{ gap: '24px' }}>
                    
                    {/* Active vs Inactive ratio */}
                    <div className="glass-card" style={{ padding: '20px' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--text-white)', marginBottom: '14px' }}>Account Activity Ratios</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                          <span style={{ color: '#34d399', fontWeight: 600 }}>Active Accounts ({activeTeamMembers})</span>
                          <span style={{ color: '#f87171', fontWeight: 600 }}>Inactive Accounts ({inactiveTeamMembers})</span>
                        </div>

                        {/* Split progress bar */}
                        {totalTeamMembers > 0 ? (
                          <div style={{ width: '100%', height: '14px', borderRadius: '7px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${(activeTeamMembers / totalTeamMembers) * 100}%`, background: '#10b981', height: '100%' }} title="Active" />
                            <div style={{ width: `${(inactiveTeamMembers / totalTeamMembers) * 100}%`, background: '#ef4444', height: '100%' }} title="Inactive" />
                          </div>
                        ) : (
                          <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '7px' }} />
                        )}

                        <p style={{ fontSize: '11px', color: 'var(--text-grey)', marginTop: '4px', lineHeight: '1.4' }}>
                          Active accounts have placed at least one stake inside Aurex capital tiers, contributing directly to unilevel overrides.
                        </p>
                      </div>
                    </div>

                    {/* Member Level distribution chart */}
                    <div className="glass-card" style={{ padding: '20px' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--text-white)', marginBottom: '14px' }}>Level Distributions Density</h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                        {Array.from({ length: 30 }).map((_, idx) => {
                          const lvl = idx + 1;
                          const count = (levelData[lvl] || []).length;
                          const maxCount = Object.values(levelData).reduce((max, arr) => Math.max(max, arr.length), 1);
                          const densityPct = (count / maxCount) * 100;

                          return (
                            <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
                              <span style={{ width: '24px', fontWeight: 700 }}>L{lvl}</span>
                              <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${densityPct}%`, height: '100%', background: 'var(--gold-primary)' }} />
                              </div>
                              <span style={{ width: '60px', textAlign: 'right', color: 'var(--text-grey)' }}>{count} Members</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
