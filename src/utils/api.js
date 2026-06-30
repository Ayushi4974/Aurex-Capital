import axios from 'axios';
import * as sim from './simDb';

const getInitialApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('aurex_custom_api_url');
    if (custom) return custom;
    
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      // If it is a domain name (like Vercel), route relatively to the same host's /api folder!
      if (host.endsWith('.vercel.app') || !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        return '/api';
      }
      // If visiting via local LAN IP, connect to the local backend port 5000
      return `http://${host}:5000/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API_BASE = getInitialApiBase();

const client = axios.create({
  baseURL: API_BASE,
  timeout: 5000
});

// Attach token if exists
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurex_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const setCustomApiUrl = (url) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aurex_custom_api_url', url);
  }
  client.defaults.baseURL = url;
};

// Checks if the live backend is accessible
export const checkBackendHealth = async () => {
  try {
    const currentBase = client.defaults.baseURL || API_BASE;
    const rootUrl = currentBase.replace('/api', '') || 'http://localhost:5000';
    
    const rootRes = await axios.get(rootUrl, { timeout: 3000 }).catch(() => null);
    return rootRes && rootRes.status === 200;
  } catch (err) {
    return false;
  }
};

export const api = {
  // Authentication
  login: async (userId, password, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/auth/login', { userId, password });
        localStorage.setItem('aurex_token', res.data.token);
        localStorage.setItem('aurex_logged_user_id', res.data.user.userId);
        return res.data.user;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Live login failed');
      }
    } else {
      const user = sim.dbLogin(userId, password);
      localStorage.setItem('aurex_token', 'mock-token-' + user.userId);
      localStorage.setItem('aurex_logged_user_id', user.userId);
      return user;
    }
  },

  register: async (name, email, password, mobile, sponsorId, placement, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/auth/register', { name, email, password, mobile, sponsorId, placement });
        localStorage.setItem('aurex_token', res.data.token);
        localStorage.setItem('aurex_logged_user_id', res.data.user.userId);
        return res.data.user;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Live registration failed');
      }
    } else {
      const user = sim.dbRegister(name, email, password, mobile, sponsorId, placement);
      localStorage.setItem('aurex_token', 'mock-token-' + user.userId);
      localStorage.setItem('aurex_logged_user_id', user.userId);
      return user;
    }
  },

  validateSponsor: async (sponsorId, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/auth/validate-sponsor', { sponsorId });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Sponsor validation failed');
      }
    } else {
      const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
      const sponsor = users.find(u => u.userId.toUpperCase() === sponsorId.toUpperCase());
      if (sponsor) {
        return { success: true, valid: true, sponsorName: sponsor.name, sponsorId: sponsor.userId };
      } else {
        return { success: false, valid: false, message: 'Sponsor ID not found' };
      }
    }
  },

  // Profile and Network
  getProfile: async (userId, isLive) => {
    if (isLive) {
      const res = await client.get('/user/profile');
      return res.data.user;
    } else {
      // Find latest state in simulated db
      const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
      return users.find(u => u.userId === userId) || null;
    }
  },

  updateProfile: async (data, isLive) => {
    if (isLive) {
      try {
        const res = await client.put('/user/profile', data);
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Profile update failed');
      }
    } else {
      const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
      const loggedId = localStorage.getItem('aurex_logged_user_id');
      const idx = users.findIndex(u => u.userId === loggedId);
      if (idx !== -1) {
        if (data.walletAddress !== undefined) {
          users[idx].walletAddress = data.walletAddress;
        }
        localStorage.setItem('aurex_users', JSON.stringify(users));
      }
      return { success: true };
    }
  },

  getDirectTeam: async (userId, isLive) => {
    if (isLive) {
      const res = await client.get('/user/direct-team');
      return res.data;
    } else {
      const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
      return users.filter(u => u.sponsorId === userId);
    }
  },

  getBinaryTree: async (rootNodeId, isLive) => {
    if (isLive) {
      const res = await client.get(`/user/tree/${rootNodeId}`);
      return res.data;
    } else {
      return sim.dbGetBinaryTree(rootNodeId);
    }
  },

  // Staking
  invest: async (userId, planType, amount, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/stake/invest', { planType, amount });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Investment failed');
      }
    } else {
      return sim.dbInvest(userId, planType, amount);
    }
  },

  getMyStakes: async (userId, isLive) => {
    if (isLive) {
      const res = await client.get('/stake/my-stakes');
      return res.data.stakes;
    } else {
      const stakes = JSON.parse(localStorage.getItem('aurex_stakes') || '[]');
      return stakes.filter(s => s.userId === userId);
    }
  },

  unstake: async (stakeId, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/stake/unstake', { stakeId });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Unstake failed');
      }
    } else {
      return sim.dbUnstake(stakeId);
    }
  },

  // Wallets, Purchases & Transactions
  getBalance: async (userId, isLive) => {
    if (isLive) {
      const res = await client.get('/wallet/balance');
      return res.data.wallet;
    } else {
      const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
      const user = users.find(u => u.userId === userId);
      return user ? user.wallet : null;
    }
  },

  depositRequest: async (userId, amount, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/wallet/deposit', { amount });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Deposit failed');
      }
    } else {
      return sim.dbDepositRequest(userId, amount);
    }
  },

  depositWeb3: async (userId, amount, txHash, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/wallet/deposit-web3', { amount, txHash });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Web3 deposit failed');
      }
    } else {
      const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
      const idx = users.findIndex(u => u.userId === userId);
      if (idx !== -1) {
        users[idx].wallet.captok.main += amount;
        localStorage.setItem('aurex_users', JSON.stringify(users));
      }
      return { success: true, message: `USDT deposit of $${amount} simulated successfully via Web3.` };
    }
  },

  buyImx: async (userId, amount, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/wallet/buy-imx', { amount });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Buy IMX failed');
      }
    } else {
      return sim.dbBuyImx(userId, amount);
    }
  },

  transfer: async (senderId, receiverId, amount, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/wallet/transfer', { receiverId, amount });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'P2P Transfer failed');
      }
    } else {
      return sim.dbTransfer(senderId, receiverId, amount);
    }
  },

  withdraw: async (userId, amount, isLive) => {
    if (isLive) {
      try {
        const res = await client.post('/wallet/withdraw', { amount });
        return res.data;
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Withdrawal request failed');
      }
    } else {
      return sim.dbWithdrawRequest(userId, amount);
    }
  },

  getTransactions: async (userId, isLive) => {
    if (isLive) {
      const res = await client.get('/wallet/transactions');
      return res.data.transactions;
    } else {
      const transactions = JSON.parse(localStorage.getItem('aurex_transactions') || '[]');
      return transactions.filter(t => t.userId === userId);
    }
  },

  // Admin Actions
  adminGetUsers: async (isLive) => {
    if (isLive) {
      const res = await client.get('/admin/users');
      return res.data.users;
    } else {
      return JSON.parse(localStorage.getItem('aurex_users') || '[]');
    }
  },

  adminGetStakes: async (isLive) => {
    if (isLive) {
      const res = await client.get('/admin/stakes');
      return res.data.stakes;
    } else {
      return JSON.parse(localStorage.getItem('aurex_stakes') || '[]');
    }
  },

  adminGetDeposits: async (isLive) => {
    if (isLive) {
      const res = await client.get('/admin/deposits/pending');
      return res.data.deposits;
    } else {
      const transactions = JSON.parse(localStorage.getItem('aurex_transactions') || '[]');
      return transactions.filter(t => t.type === 'Deposit' && t.status === 'Pending');
    }
  },

  adminGetWithdrawals: async (isLive) => {
    if (isLive) {
      const res = await client.get('/admin/withdrawals');
      return res.data.withdrawals;
    } else {
      const transactions = JSON.parse(localStorage.getItem('aurex_transactions') || '[]');
      return transactions.filter(t => t.type === 'Withdrawal' && t.status === 'Pending');
    }
  },

  adminApproveDeposit: async (txId, isLive) => {
    if (isLive) {
      const res = await client.post('/admin/deposits/approve', { depositId: txId });
      return res.data;
    } else {
      return sim.dbApproveDeposit(txId);
    }
  },

  adminRejectDeposit: async (txId, isLive) => {
    if (isLive) {
      const res = await client.post('/admin/deposits/reject', { depositId: txId });
      return res.data;
    } else {
      return sim.dbRejectDeposit(txId);
    }
  },

  adminProcessWithdrawal: async (txId, status, isLive) => {
    if (isLive) {
      const res = await client.post('/admin/withdrawals/process', { withdrawalId: txId, status });
      return res.data;
    } else {
      if (status === 'Completed') {
        return sim.dbApproveWithdrawal(txId);
      } else {
        return sim.dbRejectWithdrawal(txId);
      }
    }
  },

  adminDeclarePSP: async (percentage, isLive) => {
    if (isLive) {
      const res = await client.post('/admin/declare-psp', { percentage });
      return res.data;
    } else {
      return sim.dbDeclarePSP(percentage);
    }
  },

  getNotifications: async (isLive) => {
    if (isLive) {
      try {
        const res = await client.get('/user/notifications');
        return res.data;
      } catch (err) {
        return { success: false, notifications: [] };
      }
    } else {
      const notifications = JSON.parse(localStorage.getItem('aurex_notifications') || '[]');
      const unread = notifications.filter(n => !n.read).length;
      return { success: true, notifications, unread };
    }
  },

  markNotificationsRead: async (isLive) => {
    if (isLive) {
      try {
        const res = await client.put('/user/notifications/read');
        return res.data;
      } catch (err) {
        return { success: false };
      }
    } else {
      const notifications = JSON.parse(localStorage.getItem('aurex_notifications') || '[]');
      notifications.forEach(n => n.read = true);
      localStorage.setItem('aurex_notifications', JSON.stringify(notifications));
      return { success: true };
    }
  }
};
