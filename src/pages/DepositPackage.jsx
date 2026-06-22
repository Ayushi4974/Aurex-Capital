import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, ArrowUpRight, Upload, Clock, CheckCircle, HelpCircle } from 'lucide-react';

export default function DepositPackage({ user, isLiveMode, onRefreshUser }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('USDT_TRC20');
  const [receipt, setReceipt] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const packages = [
    { name: 'Starter Plan', min: 100, max: 499, description: '0.10% Daily ROI, Unilevel Commissions' },
    { name: 'Bronze Plan', min: 500, max: 999, description: '0.125% Daily ROI, 10% Binary Match' },
    { name: 'Silver Plan', min: 1000, max: 4999, description: '0.175% Daily ROI, 10% Binary Match' },
    { name: 'Gold Plan', min: 5000, max: 9999, description: '0.20% Daily ROI, Carry-forward matching' },
    { name: 'Platinum Plan', min: 10000, max: 100000, description: '0.225% Daily ROI, Top Rank qualification' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      // Simulate receipt upload progress
      setUploadProgress(10);
      const timer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 30;
        });
      }, 200);
    }
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }
    if (selectedPlan && (amount < selectedPlan.min || amount > selectedPlan.max)) {
      alert(`Selected plan requires investment between ${selectedPlan.min} and ${selectedPlan.max}`);
      return;
    }

    // Submit deposit mock request
    alert(`Deposit slip for $${amount} submitted! Status set to PENDING verification.`);
    setAmount('');
    setReceipt(null);
    setUploadProgress(0);
    if (onRefreshUser) onRefreshUser();
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Deposit / <span className="gold-text-gradient">Buy Package</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Load funds into your CapTok Main wallet using manual receipts verification
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Form panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={18} style={{ color: 'var(--gold-primary)' }} />
            New Deposit Slip Request
          </h3>

          <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Package selector */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                SELECT TARGET SLAB PLAN
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {packages.map((pkg, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedPlan(pkg); setAmount(pkg.min.toString()); }}
                    style={{
                      background: selectedPlan?.name === pkg.name ? 'rgba(212, 175, 55, 0.06)' : 'rgba(255,255,255,0.01)',
                      border: selectedPlan?.name === pkg.name ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                      padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-white)' }}>{pkg.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pkg.description}</p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-primary)' }}>{pkg.min}+</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                DEPOSIT AMOUNT (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="form-input"
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)', borderRadius: '8px', color: 'white' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                CRYPTO TRANSFER METHOD
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '12px', background: 'rgba(20,20,20,1)', border: '1px solid var(--border-grey)', borderRadius: '8px', color: 'white' }}
              >
                <option value="USDT_TRC20">USDT (TRC-20 Address)</option>
                <option value="USDT_ERC20">USDT (ERC-20 Address)</option>
                <option value="USDT_BEP20">USDT (BEP-20 Address)</option>
              </select>
            </div>

            {/* Wallet Destination Display */}
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-grey)', padding: '14px', borderRadius: '8px', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>SEND FUNDS TO THIS GATEWAY DESTINATION:</span>
              <p style={{ wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--gold-primary)', marginTop: '4px', fontWeight: 700 }}>
                0x918F3aD343F818dE4DB98c575Ee693C6Cf56bc8c
              </p>
            </div>

            {/* Manual Upload Receipt */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                UPLOAD TRANSFER PROOF RECEIPT
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed var(--border-gold)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--gold-primary)'
                }}>
                  <Upload size={14} />
                  Choose Proof Image
                  <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                </label>
                {receipt && (
                  <span style={{ fontSize: '11px', color: 'var(--text-grey)' }}>{receipt.name.substring(0, 16)}...</span>
                )}
              </div>
              {uploadProgress > 0 && (
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--gold-primary)', transition: 'width 0.2s ease' }}></div>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', borderRadius: '8px', width: '100%', fontWeight: 700 }}>
              File Deposit Receipt
            </button>

          </form>
        </div>

        {/* History panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--gold-primary)' }} />
            Deposit Logs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TX_501 ($500.00)</span>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-white)' }}>USDT (TRC-20) Transfer</h4>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
                <Clock size={12} /> Pending
              </span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TX_201 ($5,000.00)</span>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-white)' }}>Initial Deposit Slip</h4>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                <CheckCircle size={12} /> Approved
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
