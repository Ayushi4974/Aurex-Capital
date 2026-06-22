import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ShieldCheck, Search, Filter, AlertTriangle, Play, Pause, Trash2, Plus, ArrowRight, Award } from 'lucide-react';

export default function InvestmentManagement({ isLiveMode, refreshTrigger }) {
  const [stakes, setStakes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Manual stake entry form state
  const [manualForm, setManualForm] = useState({
    userId: '',
    planType: 'FTP',
    amount: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchStakes = async () => {
    try {
      setLoading(true);
      const list = await api.adminGetStakes(isLiveMode);
      setStakes(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakes();
  }, [isLiveMode, refreshTrigger]);

  const handleCancelStake = async (stakeId) => {
    if (!window.confirm(`Are you sure you want to terminate stake ${stakeId}? This will refund staker capital to their CapTok Main.`)) {
      return;
    }

    try {
      await api.unstake(stakeId, isLiveMode);
      alert('Stake terminated and capital refunded successfully!');
      fetchStakes();
    } catch (err) {
      alert(err.message || 'Termination failed.');
    }
  };

  const handleManualStakeSubmit = (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const targetUserId = manualForm.userId.toUpperCase().trim();
    const amt = parseFloat(manualForm.amount);

    if (!targetUserId || isNaN(amt) || amt <= 0) {
      setError('Please specify a valid User ID and investment amount.');
      return;
    }

    // Verify user exists in mock DB
    const allUsers = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const user = allUsers.find(u => u.userId === targetUserId);
    if (!user) {
      setError('User not found.');
      return;
    }

    try {
      // Force manual staking in mock DB (bypassing CapTok checks by directly pushing to stakes array)
      const allStakes = JSON.parse(localStorage.getItem('aurex_stakes') || '[]');
      
      // Maturation details
      const roiPercentage = manualForm.planType === 'FTP' ? 
        (amt >= 10000 ? 2.00 : amt >= 5000 ? 1.00 : amt >= 1000 ? 0.75 : amt >= 500 ? 0.50 : 0.25) : 0;
      
      const roiStartDate = new Date(localStorage.getItem('aurex_virtual_date') || new Date());
      if (manualForm.planType === 'FTP') {
        roiStartDate.setDate(roiStartDate.getDate() + 7);
      }

      // Package Name
      let packageName = 'Nexus Elite';
      if (amt >= 10000) packageName = 'Nexus Infinity';
      else if (amt >= 5000) packageName = 'Nexus Titan';
      else if (amt >= 1000) packageName = 'Nexus Elite';
      else if (amt >= 500) packageName = 'Nexus Pro';
      else if (amt >= 100) packageName = 'Nexus Start';

      const newStake = {
        id: `STK_${allStakes.length + 101}`,
        userId: targetUserId,
        planType: manualForm.planType,
        amount: amt,
        packageName,
        roiPercentage,
        maxEarningCap: amt * 2.50,
        roiStartDate: roiStartDate.toISOString(),
        createdAt: new Date(localStorage.getItem('aurex_virtual_date') || new Date()).toISOString(),
        status: 'Active',
        totalProfit: 0
      };

      allStakes.push(newStake);
      localStorage.setItem('aurex_stakes', JSON.stringify(allStakes));

      // Deduct or bypass, let's keep user self business updated
      user.business.self += amt;
      user.wallet.captok.used += amt;
      localStorage.setItem('aurex_users', JSON.stringify(allUsers));

      // Log transaction
      const allTransactions = JSON.parse(localStorage.getItem('aurex_transactions') || '[]');
      allTransactions.push({
        id: `TX_${allTransactions.length + 201}`,
        userId: targetUserId,
        amount: amt,
        type: 'Staking',
        status: 'Completed',
        createdAt: new Date(localStorage.getItem('aurex_virtual_date') || new Date()).toISOString(),
        description: `Manual admin activation of $${amt} in ${manualForm.planType}`
      });
      localStorage.setItem('aurex_transactions', JSON.stringify(allTransactions));

      setSuccess(`Manual stake created for user ${targetUserId}!`);
      setManualForm({ userId: '', planType: 'FTP', amount: '' });
      fetchStakes();
    } catch (err) {
      setError(err.message || 'Manual creation failed.');
    }
  };

  const filteredStakes = stakes.filter(s => 
    s.userId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Investment & <span className="gold-text-gradient">Stakes Management</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Monitor platform active investments, trigger direct manual packages staking, or terminate node positions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Active Stakes List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--gold-primary)' }} />
              Active Staking Positions ({filteredStakes.length})
            </h3>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Filter by ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ width: '180px', padding: '6px 12px 6px 30px', fontSize: '12px' }}
              />
              <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 4px' }}>STAKE ID</th>
                  <th style={{ padding: '10px 4px' }}>USER ID</th>
                  <th style={{ padding: '10px 4px' }}>PLAN / PACKAGE</th>
                  <th style={{ padding: '10px 4px' }}>AMOUNT</th>
                  <th style={{ padding: '10px 4px' }}>EARNINGS</th>
                  <th style={{ padding: '10px 4px' }}>STATUS</th>
                  <th style={{ padding: '10px 4px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading positions...
                    </td>
                  </tr>
                ) : filteredStakes.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No active stakings match criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStakes.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '10px 4px', fontWeight: 600 }}>{s.id}</td>
                      <td style={{ padding: '10px 4px', fontWeight: 600, color: 'var(--gold-primary)' }}>{s.userId}</td>
                      <td style={{ padding: '10px 4px' }}>{s.planType} ({s.packageName})</td>
                      <td style={{ padding: '10px 4px', fontWeight: 700 }}>${s.amount.toLocaleString()}</td>
                      <td style={{ padding: '10px 4px', color: '#34d399', fontWeight: 700 }}>+${s.totalProfit?.toFixed(2) || '0.00'}</td>
                      <td style={{ padding: '10px 4px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          background: s.status === 'Completed' ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.08)',
                          color: s.status === 'Completed' ? 'var(--text-muted)' : '#34d399'
                        }}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                        {s.status === 'Active' ? (
                          <button 
                            onClick={() => handleCancelStake(s.id)}
                            style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Terminate
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Investment Override Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontFamily: 'var(--font-display)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} style={{ color: 'var(--gold-primary)' }} />
              Manual Staking Entry
            </h3>

            <form onSubmit={handleManualStakeSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>USER ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. AC100002"
                  value={manualForm.userId}
                  onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>PLAN TYPE</label>
                  <select
                    value={manualForm.planType}
                    onChange={(e) => setManualForm({ ...manualForm, planType: e.target.value })}
                    className="form-input"
                    style={{ background: '#000', color: '#fff' }}
                  >
                    <option value="FTP">FTP (ROI)</option>
                    <option value="UTP">UTP (PSP)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>INVESTMENT AMOUNT ($)</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount ($100+)"
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>{error}</div>}
              {success && <div style={{ color: '#10b981', fontSize: '12px', marginBottom: '12px' }}>{success}</div>}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                Activate Manual Stake
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* Package details reference */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={18} style={{ color: 'var(--gold-primary)' }} />
              Nexus Config Scales
            </h3>
            <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-grey)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span>Nexus Start:</span>
                <strong style={{ color: 'white' }}>$100 - $499 (0.25% daily)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span>Nexus Pro:</span>
                <strong style={{ color: 'white' }}>$500 - $999 (0.50% daily)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span>Nexus Elite:</span>
                <strong style={{ color: 'white' }}>$1,000 - $4,999 (0.75% daily)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span>Nexus Titan:</span>
                <strong style={{ color: 'white' }}>$5,000 - $9,999 (1.00% daily)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                <span>Nexus Infinity:</span>
                <strong style={{ color: 'white' }}>$10,000+ (2.00% daily)</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
