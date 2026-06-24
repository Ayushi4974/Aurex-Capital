import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Search, UserMinus, UserCheck, Edit, ShieldAlert, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManagement({ isLiveMode, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal Edit state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    sponsorId: '',
    parentId: '',
    placement: '',
    isActive: true,
    password: ''
  });

  const fetchUsers = async () => {
    try {
      const list = await api.adminGetUsers(isLiveMode);
      setUsers(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isLiveMode, refreshTrigger]);

  const handleToggleActive = (userId, currentStatus) => {
    const list = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const index = list.findIndex(u => u.userId === userId);
    if (index > -1) {
      list[index].isActive = !currentStatus;
      localStorage.setItem('aurex_users', JSON.stringify(list));
      alert(`User ${userId} state toggled to ${!currentStatus ? 'Active' : 'Inactive'}.`);
      fetchUsers();
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      sponsorId: user.sponsorId || '',
      parentId: user.parentId || '',
      placement: user.placement || 'Left',
      isActive: user.isActive,
      password: user.password || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const list = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const index = list.findIndex(u => u.userId === editingUser.userId);
    if (index > -1) {
      list[index] = {
        ...list[index],
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        sponsorId: editForm.sponsorId,
        parentId: editForm.parentId,
        placement: editForm.placement,
        isActive: editForm.isActive,
        password: editForm.password,
        plainPassword: editForm.password
      };
      localStorage.setItem('aurex_users', JSON.stringify(list));
      alert(`User profile for ${editingUser.userId} updated successfully.`);
      setEditingUser(null);
      fetchUsers();
    }
  };

  const handleResetPassword = () => {
    if (!editingUser) return;
    setEditForm(prev => ({ ...prev, password: 'user123' }));
    alert('Password field has been reset to user123. Save profile changes to commit.');
  };

  const filteredUsers = users.filter(u => 
    u.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '28px', maxWidth: '1250px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
            User <span className="gold-text-gradient">Management Backoffice</span>
          </h1>
          <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
            Inspect registered accounts, reset credentials, and adjust tree configurations.
          </p>
        </div>

        {/* Search */}
        <motion.div whileHover={{ scale: 1.02 }} style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by ID, Name, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px', width: '280px' }}
          />
        </motion.div>
      </motion.div>

      {/* Users table */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(212,175,55,0.1)', transition: { duration: 0.2 } }}
        className="glass-card shifting-card"
        style={{ padding: '24px' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 10px' }}>User ID</th>
                <th style={{ padding: '12px 10px' }}>Name</th>
                <th style={{ padding: '12px 10px' }}>Email Address</th>
                <th style={{ padding: '12px 10px' }}>Sponsor ID</th>
                <th style={{ padding: '12px 10px' }}>Parent (Placement)</th>
                <th style={{ padding: '12px 10px' }}>Fund Wallet</th>
                <th style={{ padding: '12px 10px' }}>ProTok Profit</th>
                <th style={{ padding: '12px 10px' }}>Account Status</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No users matching search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>{u.userId}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-grey)' }}>{u.email || 'N/A'}</td>
                    <td style={{ padding: '12px 10px' }}>{u.sponsorId || 'Root'}</td>
                    <td style={{ padding: '12px 10px' }}>
                      {u.parentId ? `${u.parentId} (${u.placement})` : 'Root'}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>${u.wallet?.captok?.main?.toLocaleString() || 0}</td>
                    <td style={{ padding: '12px 10px', color: '#34d399', fontWeight: 700 }}>
                      ${u.wallet?.protok?.profit?.toFixed(2) || 0}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: u.isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        color: u.isActive ? '#34d399' : '#f87171'
                      }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenEdit(u)}
                        style={{
                          background: 'rgba(212,175,55,0.1)',
                          border: '1px solid var(--border-gold)',
                          color: 'var(--gold-primary)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px'
                        }}
                      >
                        <Edit size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(u.userId, u.isActive)}
                        style={{
                          background: u.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          border: u.isActive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                          color: u.isActive ? '#f87171' : '#34d399',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px'
                        }}
                      >
                        {u.isActive ? <UserMinus size={12} /> : <UserCheck size={12} />}
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Details Dialog Box Modal */}
      <AnimatePresence>
        {editingUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card" 
              style={{
                width: '100%',
                maxWidth: '550px',
                padding: '32px',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setEditingUser(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
                Edit Account Profile: <span className="gold-text-gradient">{editingUser.userId}</span>
              </h2>
              <p style={{ fontSize: '11.5px', color: 'var(--text-grey)', marginBottom: '20px' }}>
                Modify structural parameters or reset member passwords.
              </p>

              <form onSubmit={handleSaveEdit}>
                <div className="responsive-grid-2" style={{ gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>FULL NAME</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>MOBILE NUMBER</label>
                    <input 
                      type="text" 
                      value={editForm.mobile} 
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} 
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                    className="form-input"
                    required
                  />
                </div>

                <div className="responsive-grid-2" style={{ gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>SPONSOR ID</label>
                    <input 
                      type="text" 
                      value={editForm.sponsorId} 
                      onChange={(e) => setEditForm({ ...editForm, sponsorId: e.target.value.toUpperCase() })} 
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>PARENT ID</label>
                    <input 
                      type="text" 
                      value={editForm.parentId} 
                      onChange={(e) => setEditForm({ ...editForm, parentId: e.target.value.toUpperCase() })} 
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="responsive-grid-2" style={{ gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>LEG PLACEMENT</label>
                    <select 
                      value={editForm.placement}
                      onChange={(e) => setEditForm({ ...editForm, placement: e.target.value })}
                      className="form-input"
                      style={{ background: '#000', color: '#fff' }}
                    >
                      <option value="Left">Left Leg</option>
                      <option value="Right">Right Leg</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>ACCOUNT STATUS</label>
                    <select 
                      value={editForm.isActive ? 'Active' : 'Suspended'}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'Active' })}
                      className="form-input"
                      style={{ background: '#000', color: '#fff' }}
                    >
                      <option value="Active">Active Account</option>
                      <option value="Suspended">Suspended / Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(245,158,11,0.05)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '18px',
                  fontSize: '11px',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={14} />
                    <span>Reset staker login password to <strong>user123</strong>:</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleResetPassword}
                    style={{
                      background: 'rgba(245,158,11,0.15)',
                      border: 'none',
                      color: '#fbbf24',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    Reset Password
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>LOGIN PASSWORD PASSWORD</label>
                  <input 
                    type="text" 
                    value={editForm.password} 
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} 
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                    Save Profile Changes
                  </button>
                  <button type="button" onClick={() => setEditingUser(null)} className="btn" style={{ flex: 0.5, padding: '12px', background: 'transparent', border: '1px solid var(--border-grey)', color: 'white' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
