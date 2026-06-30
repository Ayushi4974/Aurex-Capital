// Simulated Database and Business Logic Engine for Aurex Capital
// Handles users, stakes, transactions, MLM hierarchies, and cron calculators in LocalStorage

const INITIAL_USERS = [
  {
    userId: 'AC100001',
    password: 'admin123',
    plainPassword: 'admin123',
    name: 'Aurex Capital Admin',
    email: 'admin@aurexcapital.com',
    mobile: '9876543210',
    role: 'admin',
    sponsorId: '',
    parentId: '',
    placement: '',
    rank: 'Crown Ambassador',
    isActive: true,
    doj: '2026-06-01T10:00:00.000Z',
    wallet: {
      captok: { main: 100000, used: 0, free: 0 },
      protok: { profit: 25000, requested: 0, released: 0 }
    },
    business: { self: 0, directTeam: 6, totalTeam: 6, leftBusiness: 5000, rightBusiness: 6500 }
  },
  {
    userId: 'AC100002',
    password: 'user123',
    plainPassword: 'user123',
    name: 'Alex Mercer (L)',
    email: 'alex@aurexcapital.com',
    mobile: '9876543211',
    role: 'user',
    sponsorId: 'AC100001',
    parentId: 'AC100001',
    placement: 'Left',
    rank: 'Member',
    isActive: true,
    doj: '2026-06-02T11:00:00.000Z',
    wallet: {
      captok: { main: 4500, used: 2500, free: 0 },
      protok: { profit: 450, requested: 50, released: 100 }
    },
    business: { self: 2500, directTeam: 2, totalTeam: 2, leftBusiness: 1000, rightBusiness: 1500 }
  },
  {
    userId: 'AC100003',
    password: 'user123',
    plainPassword: 'user123',
    name: 'Sarah Connor (R)',
    email: 'sarah@aurexcapital.com',
    mobile: '9876543212',
    role: 'user',
    sponsorId: 'AC100001',
    parentId: 'AC100001',
    placement: 'Right',
    rank: 'Member',
    isActive: true,
    doj: '2026-06-02T12:00:00.000Z',
    wallet: {
      captok: { main: 3000, used: 1500, free: 0 },
      protok: { profit: 300, requested: 0, released: 0 }
    },
    business: { self: 1500, directTeam: 2, totalTeam: 2, leftBusiness: 800, rightBusiness: 1200 }
  },
  {
    userId: 'AC100004',
    password: 'user123',
    plainPassword: 'user123',
    name: 'John Doe (L-L)',
    email: 'john@aurexcapital.com',
    mobile: '9876543213',
    role: 'user',
    sponsorId: 'AC100002',
    parentId: 'AC100002',
    placement: 'Left',
    rank: 'Member',
    isActive: true,
    doj: '2026-06-03T10:00:00.000Z',
    wallet: {
      captok: { main: 150, used: 1000, free: 0 },
      protok: { profit: 120, requested: 0, released: 0 }
    },
    business: { self: 1000, directTeam: 0, totalTeam: 0, leftBusiness: 0, rightBusiness: 0 }
  },
  {
    userId: 'AC100005',
    password: 'user123',
    plainPassword: 'user123',
    name: 'Bruce Wayne (L-R)',
    email: 'bruce@aurexcapital.com',
    mobile: '9876543214',
    role: 'user',
    sponsorId: 'AC100002',
    parentId: 'AC100002',
    placement: 'Right',
    rank: 'Member',
    isActive: true,
    doj: '2026-06-03T14:00:00.000Z',
    wallet: {
      captok: { main: 500, used: 0, free: 0 },
      protok: { profit: 50, requested: 0, released: 0 }
    },
    business: { self: 0, directTeam: 0, totalTeam: 0, leftBusiness: 0, rightBusiness: 0 }
  },
  {
    userId: 'AC100006',
    password: 'user123',
    plainPassword: 'user123',
    name: 'Clark Kent (R-L)',
    email: 'clark@aurexcapital.com',
    mobile: '9876543215',
    role: 'user',
    sponsorId: 'AC100003',
    parentId: 'AC100003',
    placement: 'Left',
    rank: 'Member',
    isActive: true,
    doj: '2026-06-04T09:00:00.000Z',
    wallet: {
      captok: { main: 800, used: 0, free: 0 },
      protok: { profit: 0, requested: 0, released: 0 }
    },
    business: { self: 0, directTeam: 0, totalTeam: 0, leftBusiness: 0, rightBusiness: 0 }
  },
  {
    userId: 'AC100007',
    password: 'user123',
    plainPassword: 'user123',
    name: 'Diana Prince (R-R)',
    email: 'diana@aurexcapital.com',
    mobile: '9876543216',
    role: 'user',
    sponsorId: 'AC100003',
    parentId: 'AC100003',
    placement: 'Right',
    rank: 'Member',
    isActive: true,
    doj: '2026-06-04T15:00:00.000Z',
    wallet: {
      captok: { main: 1200, used: 1200, free: 0 },
      protok: { profit: 120, requested: 0, released: 0 }
    },
    business: { self: 1200, directTeam: 0, totalTeam: 0, leftBusiness: 0, rightBusiness: 0 }
  }
];

const INITIAL_STAKES = [
  {
    id: 'STK_101',
    userId: 'AC100002',
    planType: 'FTP',
    amount: 2000,
    packageName: 'Nexus Elite',
    roiPercentage: 0.75,
    maxEarningCap: 5000,
    roiStartDate: '2026-06-09T11:00:00.000Z', // doj + 7 days
    createdAt: '2026-06-02T11:00:00.000Z',
    status: 'Active',
    totalProfit: 180
  },
  {
    id: 'STK_102',
    userId: 'AC100003',
    planType: 'UTP',
    amount: 1500,
    packageName: 'Nexus Elite',
    roiPercentage: 0.75,
    maxEarningCap: 3750,
    roiStartDate: '2026-06-02T12:00:00.000Z',
    createdAt: '2026-06-02T12:00:00.000Z',
    status: 'Active',
    totalProfit: 180
  },
  {
    id: 'STK_103',
    userId: 'AC100004',
    planType: 'FTP',
    amount: 1000,
    packageName: 'Nexus Elite',
    roiPercentage: 0.75,
    maxEarningCap: 2500,
    roiStartDate: '2026-06-10T10:00:00.000Z',
    createdAt: '2026-06-03T10:00:00.000Z',
    status: 'Active',
    totalProfit: 31.5
  },
  {
    id: 'STK_104',
    userId: 'AC100007',
    planType: 'UTP',
    amount: 1200,
    packageName: 'Nexus Elite',
    roiPercentage: 0.75,
    maxEarningCap: 3000,
    roiStartDate: '2026-06-04T15:00:00.000Z',
    createdAt: '2026-06-04T15:00:00.000Z',
    status: 'Active',
    totalProfit: 120
  },
  {
    id: 'STK_105',
    userId: 'AC100002',
    planType: 'FTP',
    amount: 500,
    packageName: 'Nexus Pro',
    roiPercentage: 0.50,
    maxEarningCap: 1250,
    roiStartDate: '2026-06-17T12:00:00.000Z',
    createdAt: '2026-06-10T12:00:00.000Z',
    status: 'Active',
    totalProfit: 10
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'TX_201',
    userId: 'AC100001',
    amount: 100000,
    type: 'Deposit',
    status: 'Completed',
    createdAt: '2026-06-01T10:00:00.000Z',
    description: 'System seed capital credit'
  },
  {
    id: 'TX_202',
    userId: 'AC100002',
    amount: 5000,
    type: 'Deposit',
    status: 'Completed',
    createdAt: '2026-06-02T10:30:00.000Z',
    description: 'Initial deposit'
  },
  {
    id: 'TX_203',
    userId: 'AC100002',
    amount: 2000,
    type: 'Staking',
    status: 'Completed',
    createdAt: '2026-06-02T11:00:00.000Z',
    description: 'Staked $2000 in FTP (Nexus Elite)'
  },
  {
    id: 'TX_204',
    userId: 'AC100001',
    amount: 200,
    type: 'DirectReward',
    status: 'Completed',
    createdAt: '2026-06-02T11:00:00.000Z',
    description: '10% Direct commission from AC100002 stake'
  },
  {
    id: 'TX_205',
    userId: 'AC100003',
    amount: 3000,
    type: 'Deposit',
    status: 'Completed',
    createdAt: '2026-06-02T11:30:00.000Z',
    description: 'Initial deposit'
  },
  {
    id: 'TX_206',
    userId: 'AC100003',
    amount: 1500,
    type: 'Staking',
    status: 'Completed',
    createdAt: '2026-06-02T12:00:00.000Z',
    description: 'Staked $1500 in UTP (Nexus Elite)'
  },
  {
    id: 'TX_207',
    userId: 'AC100001',
    amount: 150,
    type: 'DirectReward',
    status: 'Completed',
    createdAt: '2026-06-02T12:00:00.000Z',
    description: '10% Direct commission from AC100003 stake'
  },
  {
    id: 'TX_208',
    userId: 'AC100004',
    amount: 1150,
    type: 'Deposit',
    status: 'Completed',
    createdAt: '2026-06-03T09:30:00.000Z',
    description: 'Initial deposit'
  },
  {
    id: 'TX_209',
    userId: 'AC100004',
    amount: 1000,
    type: 'Staking',
    status: 'Completed',
    createdAt: '2026-06-03T10:00:00.000Z',
    description: 'Staked $1000 in FTP (Nexus Elite)'
  },
  {
    id: 'TX_210',
    userId: 'AC100002',
    amount: 100,
    type: 'DirectReward',
    status: 'Completed',
    createdAt: '2026-06-03T10:00:00.000Z',
    description: '10% Direct commission from AC100004 stake'
  },
  {
    id: 'TX_211',
    userId: 'AC100001',
    amount: 50,
    type: 'LevelReward',
    status: 'Completed',
    createdAt: '2026-06-03T10:00:00.000Z',
    description: '5% L2 commission from AC100004 stake'
  },
  {
    id: 'TX_212',
    userId: 'AC100007',
    amount: 1200,
    type: 'Deposit',
    status: 'Completed',
    createdAt: '2026-06-04T14:30:00.000Z',
    description: 'Initial deposit'
  },
  {
    id: 'TX_213',
    userId: 'AC100007',
    amount: 1200,
    type: 'Staking',
    status: 'Completed',
    createdAt: '2026-06-04T15:00:00.000Z',
    description: 'Staked $1200 in UTP (Nexus Elite)'
  },
  {
    id: 'TX_214',
    userId: 'AC100003',
    amount: 120,
    type: 'DirectReward',
    status: 'Completed',
    createdAt: '2026-06-04T15:00:00.000Z',
    description: '10% Direct commission from AC100007 stake'
  },
  {
    id: 'TX_215',
    userId: 'AC100001',
    amount: 60,
    type: 'LevelReward',
    status: 'Completed',
    createdAt: '2026-06-04T15:00:00.000Z',
    description: '5% L2 commission from AC100007 stake'
  },
  {
    id: 'TX_215_2',
    userId: 'AC100002',
    amount: 500,
    type: 'Staking',
    status: 'Completed',
    createdAt: '2026-06-10T12:00:00.000Z',
    description: 'Staked $500 in FTP (Nexus Pro)'
  },
  
  // AC100002 ROI Payouts ($15/day for STK_101)
  { id: 'TX_216', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-09T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_217', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-10T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_218', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-11T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_219', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-12T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_220', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-13T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_221', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-14T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_222', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-15T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_223', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-16T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_224', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-17T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_225', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-18T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_226', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-19T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },
  { id: 'TX_227', userId: 'AC100002', amount: 15, type: 'ROI', status: 'Completed', createdAt: '2026-06-20T12:00:00.000Z', description: 'Daily ROI payout (0.75%)' },

  // AC100002 ROI Payouts ($2.50/day for STK_105 starting June 17)
  { id: 'TX_227_1', userId: 'AC100002', amount: 2.5, type: 'ROI', status: 'Completed', createdAt: '2026-06-17T12:05:00.000Z', description: 'Daily ROI payout (0.50%)' },
  { id: 'TX_227_2', userId: 'AC100002', amount: 2.5, type: 'ROI', status: 'Completed', createdAt: '2026-06-18T12:05:00.000Z', description: 'Daily ROI payout (0.50%)' },
  { id: 'TX_227_3', userId: 'AC100002', amount: 2.5, type: 'ROI', status: 'Completed', createdAt: '2026-06-19T12:05:00.000Z', description: 'Daily ROI payout (0.50%)' },
  { id: 'TX_227_4', userId: 'AC100002', amount: 2.5, type: 'ROI', status: 'Completed', createdAt: '2026-06-20T12:05:00.000Z', description: 'Daily ROI payout (0.50%)' },

  // AC100003 UTP Profit Shares
  { id: 'TX_228', userId: 'AC100003', amount: 60, type: 'ROI', status: 'Completed', createdAt: '2026-06-08T12:00:00.000Z', description: 'Weekly UTP Profit Share (4.0%)' },
  { id: 'TX_229', userId: 'AC100003', amount: 120, type: 'ROI', status: 'Completed', createdAt: '2026-06-15T12:00:00.000Z', description: 'Weekly UTP Profit Share (8.0%)' },

  // AC100002 Binary Rewards
  { id: 'TX_230', userId: 'AC100002', amount: 120, type: 'BinaryReward', status: 'Completed', createdAt: '2026-06-10T15:00:00.000Z', description: '10% Binary Matching Reward on matched volume $1200' },
  { id: 'TX_231', userId: 'AC100002', amount: 150, type: 'BinaryReward', status: 'Completed', createdAt: '2026-06-15T15:00:00.000Z', description: '10% Binary Matching Reward on matched volume $1500' },
  
  // AC100002 Direct Rewards
  { id: 'TX_232', userId: 'AC100002', amount: 50, type: 'DirectReward', status: 'Completed', createdAt: '2026-06-12T10:00:00.000Z', description: '10% Direct commission from AC100005 registration activity' },

  // AC100002 Withdrawals
  {
    id: 'TX_233',
    userId: 'AC100002',
    amount: 100,
    type: 'Withdrawal',
    status: 'Completed',
    createdAt: '2026-06-12T16:00:00.000Z',
    description: 'Completed ProTok withdrawal to external wallet'
  },
  {
    id: 'TX_234',
    userId: 'AC100002',
    amount: 50,
    type: 'Withdrawal',
    status: 'Pending',
    createdAt: '2026-06-18T16:00:00.000Z',
    description: 'Requested protok profit release'
  },

  // Admin Level/Binary Commission entries
  { id: 'TX_235', userId: 'AC100001', amount: 2500, type: 'BinaryReward', status: 'Completed', createdAt: '2026-06-10T12:00:00.000Z', description: 'Binary Matching Reward' },
  { id: 'TX_236', userId: 'AC100001', amount: 3500, type: 'BinaryReward', status: 'Completed', createdAt: '2026-06-15T12:00:00.000Z', description: 'Binary Matching Reward' },
  { id: 'TX_237', userId: 'AC100001', amount: 10000, type: 'DirectReward', status: 'Completed', createdAt: '2026-06-05T12:00:00.000Z', description: 'Direct referral commissions' },
  { id: 'TX_238', userId: 'AC100001', amount: 8800, type: 'LevelReward', status: 'Completed', createdAt: '2026-06-12T12:00:00.000Z', description: 'Downline unilevel group commissions' }
];

// Helper: load from localStorage or initialize
const loadDb = () => {
  const users = localStorage.getItem('aurex_users');
  const stakes = localStorage.getItem('aurex_stakes');
  const transactions = localStorage.getItem('aurex_transactions');
  const virtualDate = localStorage.getItem('aurex_virtual_date');

  let parsedTxs = [];
  try {
    parsedTxs = transactions ? JSON.parse(transactions) : [];
  } catch (e) {}

  const hasRoi = parsedTxs.some(t => t.type === 'ROI');

  if (!users || !stakes || !transactions || !hasRoi) {
    localStorage.setItem('aurex_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('aurex_stakes', JSON.stringify(INITIAL_STAKES));
    localStorage.setItem('aurex_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem('aurex_virtual_date', new Date('2026-06-20T12:00:00Z').toISOString());
    return {
      users: INITIAL_USERS,
      stakes: INITIAL_STAKES,
      transactions: INITIAL_TRANSACTIONS,
      virtualDate: new Date('2026-06-20T12:00:00Z')
    };
  }

  return {
    users: JSON.parse(users),
    stakes: JSON.parse(stakes),
    transactions: parsedTxs,
    virtualDate: new Date(virtualDate || '2026-06-20T12:00:00Z')
  };
};

const saveDb = (data) => {
  localStorage.setItem('aurex_users', JSON.stringify(data.users));
  localStorage.setItem('aurex_stakes', JSON.stringify(data.stakes));
  localStorage.setItem('aurex_transactions', JSON.stringify(data.transactions));
  localStorage.setItem('aurex_virtual_date', data.virtualDate.toISOString());
};

// Reset database utility
export const dbReset = () => {
  localStorage.removeItem('aurex_users');
  localStorage.removeItem('aurex_stakes');
  localStorage.removeItem('aurex_transactions');
  localStorage.removeItem('aurex_virtual_date');
  return loadDb();
};

// Get current date
export const dbGetVirtualDate = () => {
  return loadDb().virtualDate;
};

// Advance virtual date by 1 day
export const dbAdvanceDate = () => {
  const db = loadDb();
  db.virtualDate.setDate(db.virtualDate.getDate() + 1);
  saveDb(db);
  return db.virtualDate;
};

export const getNexusPackageName = (amount) => {
  if (amount >= 10000) return 'Nexus Infinity';
  if (amount >= 5000) return 'Nexus Titan';
  if (amount >= 1000) return 'Nexus Elite';
  if (amount >= 500) return 'Nexus Pro';
  if (amount >= 100) return 'Nexus Start';
  return 'Nexus Custom';
};

// Calculate daily ROI percentage based on Nexus packages
export const getFTPSlab = (amount) => {
  if (amount >= 10000) return 2.00;
  if (amount >= 5000) return 1.00;
  if (amount >= 1000) return 0.75;
  if (amount >= 500) return 0.50;
  if (amount >= 100) return 0.25;
  return 0.25;
};

// Auth methods
export const dbLogin = (userId, password) => {
  const db = loadDb();
  const user = db.users.find(u => 
    u.userId.toUpperCase() === userId.toUpperCase() ||
    u.email.toLowerCase() === userId.toLowerCase()
  );
  if (!user) throw new Error('User not found');
  if (user.password !== password) throw new Error('Invalid credentials');
  return user;
};

export const dbRegister = (name, email, password, mobile, sponsorId, placement) => {
  const db = loadDb();
  
  // Verify Sponsor
  const sponsor = db.users.find(u => u.userId.toUpperCase() === sponsorId.toUpperCase());
  if (!sponsor) throw new Error('Invalid Sponsor ID');

  // Generate next user ID
  const nextIdNum = db.users.reduce((max, u) => {
    const num = parseInt(u.userId.replace('AC', ''));
    return num > max ? num : max;
  }, 100000) + 1;
  const newUserId = `AC${nextIdNum}`;

  // Binary Placement Loop: Find the extreme leaf along the sponsor's chosen leg
  let parentId = null;
  let currentPlacement = placement || 'Left';
  let currentNode = sponsor;

  while (true) {
    // Find if a child exists under the currentNode at the designated placement
    const child = db.users.find(u => u.parentId === currentNode.userId && u.placement === currentPlacement);
    if (!child) {
      parentId = currentNode.userId;
      break;
    }
    // Traversal continues along the extreme side of the branch
    currentNode = child;
  }

  // Create new user
  const newUser = {
    userId: newUserId,
    password,
    plainPassword: password,
    name,
    email,
    mobile,
    role: 'user',
    sponsorId: sponsor.userId,
    parentId: parentId,
    placement: currentPlacement,
    rank: 'Member',
    isActive: true, // Default active for direct testing
    doj: db.virtualDate.toISOString(),
    wallet: {
      captok: { main: 0, used: 0, free: 0 },
      protok: { profit: 0, requested: 0, released: 0 }
    },
    business: { self: 0, directTeam: 0, totalTeam: 0, leftBusiness: 0, rightBusiness: 0 }
  };

  db.users.push(newUser);

  // Update sponsor's direct team count
  sponsor.business.directTeam += 1;

  // Increment totalTeam count for all ancestors in binary parent chain
  let ancestorParentId = parentId;
  while (ancestorParentId) {
    const ancestor = db.users.find(u => u.userId === ancestorParentId);
    if (ancestor) {
      ancestor.business.totalTeam += 1;
      ancestorParentId = ancestor.parentId;
    } else {
      break;
    }
  }

  saveDb(db);
  return newUser;
};

// Helper: trace matching leg
const getLegForUpline = (childId, parentId, users) => {
  let current = users.find(u => u.userId === childId);
  while (current && current.parentId) {
    if (current.parentId === parentId) {
      return current.placement;
    }
    current = users.find(u => u.userId === current.parentId);
  }
  return null;
};

// Invest method
export const dbInvest = (userId, planType, amount) => {
  const db = loadDb();
  const user = db.users.find(u => u.userId === userId);
  if (!user) throw new Error('User not found');

  if (amount < 100) throw new Error('Minimum investment is $100');
  if (planType === 'UTP' && amount % 50 !== 0) throw new Error('Unit Token Plan must be in multiples of $50');

  if (user.wallet.captok.main < amount) {
    throw new Error(`Insufficient Fund Balance. Available: $${user.wallet.captok.main}`);
  }

  // Deduct from Main Fund Wallet and move to Used
  user.wallet.captok.main -= amount;
  user.wallet.captok.used += amount;
  user.business.self += amount;

  // Calculate maturation details
  const roiPercentage = planType === 'FTP' ? getFTPSlab(amount) : 0;
  // FTP ROI begins after 7 days delay
  const roiStartDate = new Date(db.virtualDate);
  if (planType === 'FTP') {
    roiStartDate.setDate(roiStartDate.getDate() + 7);
  }

  const nextStakeId = `STK_${db.stakes.length + 101}`;
  const newStake = {
    id: nextStakeId,
    userId: userId,
    planType,
    amount,
    packageName: getNexusPackageName(amount),
    roiPercentage,
    maxEarningCap: amount * 2.50,
    roiStartDate: roiStartDate.toISOString(),
    createdAt: db.virtualDate.toISOString(),
    status: 'Active',
    totalProfit: 0
  };

  db.stakes.push(newStake);

  // Log staking transaction
  db.transactions.push({
    id: `TX_${db.transactions.length + 201}`,
    userId: user.userId,
    amount,
    type: 'Staking',
    status: 'Completed',
    createdAt: db.virtualDate.toISOString(),
    description: `Staked $${amount} in ${planType === 'FTP' ? 'FTP (Daily ROI)' : 'UTP (Profit Share)'}`
  });

  // Distribute Level Referral Commission up to 5 sponsor generations
  const commissions = [0.10, 0.05, 0.02, 0.01, 0.01]; // L1 = 10%, L2 = 5%, etc.
  let sponsorChainId = user.sponsorId;
  for (let i = 0; i < commissions.length; i++) {
    if (!sponsorChainId) break;
    const sponsorNode = db.users.find(u => u.userId === sponsorChainId);
    if (!sponsorNode) break;

    const commAmount = amount * commissions[i];
    sponsorNode.wallet.protok.profit += commAmount;

    db.transactions.push({
      id: `TX_${db.transactions.length + 201}`,
      userId: sponsorNode.userId,
      amount: commAmount,
      type: 'DirectReward',
      status: 'Completed',
      createdAt: db.virtualDate.toISOString(),
      description: `${(commissions[i] * 100)}% Referral Reward (Level ${i + 1}) from ${user.userId}'s stake`
    });

    sponsorChainId = sponsorNode.sponsorId;
  }

  // Update Binary Business Volumes for Parents
  let parentChainId = user.parentId;
  while (parentChainId) {
    const parentNode = db.users.find(u => u.userId === parentChainId);
    if (!parentNode) break;

    const leg = getLegForUpline(user.userId, parentNode.userId, db.users);
    if (leg === 'Left') {
      parentNode.business.leftBusiness += amount;
    } else if (leg === 'Right') {
      parentNode.business.rightBusiness += amount;
    }

    parentChainId = parentNode.parentId;
  }

  saveDb(db);
  return { user, stake: newStake };
};

// Unstake capital
export const dbUnstake = (stakeId) => {
  const db = loadDb();
  const stake = db.stakes.find(s => s.id === stakeId);
  if (!stake) throw new Error('Stake record not found');
  if (stake.status === 'Completed') throw new Error('Stake already matured/completed');

  const user = db.users.find(u => u.userId === stake.userId);
  if (!user) throw new Error('User not found');

  // Refund from Fund Wallet Used to Fund Wallet
  user.wallet.captok.used -= stake.amount;
  user.wallet.captok.main += stake.amount;
  user.business.self -= stake.amount;

  stake.status = 'Completed';

  // Log transaction
  db.transactions.push({
    id: `TX_${db.transactions.length + 201}`,
    userId: user.userId,
    amount: stake.amount,
    type: 'Unstake',
    status: 'Completed',
    createdAt: db.virtualDate.toISOString(),
    description: `Unstaked capital $${stake.amount} from ${stake.planType} plan`
  });

  saveDb(db);
  return { user, stake };
};

// P2P Balance Transfer
export const dbTransfer = (senderId, receiverId, amount) => {
  const db = loadDb();
  if (senderId === receiverId) throw new Error('Cannot transfer to yourself');

  const sender = db.users.find(u => u.userId === senderId);
  const receiver = db.users.find(u => u.userId.toUpperCase() === receiverId.toUpperCase());

  if (!sender) throw new Error('Sender not found');
  if (!receiver) throw new Error('Receiver not found');
  if (amount <= 0) throw new Error('Transfer amount must be positive');
  if (sender.wallet.captok.main < amount) throw new Error('Insufficient Fund Balance');

  sender.wallet.captok.main -= amount;
  receiver.wallet.captok.main += amount;

  db.transactions.push({
    id: `TX_${db.transactions.length + 201}`,
    userId: sender.userId,
    amount,
    type: 'Transfer',
    status: 'Completed',
    createdAt: db.virtualDate.toISOString(),
    description: `P2P Transfer of $${amount} to ${receiver.userId}`
  });

  db.transactions.push({
    id: `TX_${db.transactions.length + 201}`,
    userId: receiver.userId,
    amount,
    type: 'Transfer',
    status: 'Completed',
    createdAt: db.virtualDate.toISOString(),
    description: `Received P2P Transfer of $${amount} from ${sender.userId}`
  });

  saveDb(db);
  return { sender, receiver };
};

// Deposit funds (requests)
export const dbDepositRequest = (userId, amount) => {
  const db = loadDb();
  const user = db.users.find(u => u.userId === userId);
  if (!user) throw new Error('User not found');
  if (amount <= 0) throw new Error('Deposit must be greater than 0');

  const tx = {
    id: `TX_${db.transactions.length + 201}`,
    userId: userId,
    amount,
    type: 'Deposit',
    status: 'Pending',
    createdAt: db.virtualDate.toISOString(),
    description: `Requested deposit of $${amount}`
  };

  db.transactions.push(tx);
  saveDb(db);
  return tx;
};

// Buy IMX (Auto approvals)
export const dbBuyImx = (userId, amount) => {
  const db = loadDb();
  const user = db.users.find(u => u.userId === userId);
  if (!user) throw new Error('User not found');
  if (amount <= 0) throw new Error('Purchase amount must be positive');

  user.wallet.captok.main += amount;
  user.isActive = true;

  db.transactions.push({
    id: `TX_${db.transactions.length + 201}`,
    userId: userId,
    amount,
    type: 'Deposit',
    status: 'Completed',
    createdAt: db.virtualDate.toISOString(),
    description: `Purchased IMX tokens and credited $${amount} to Fund Wallet`
  });

  saveDb(db);
  return user;
};

// Withdraw funds (protok profit) with 24h limit, $20 min, $5000 max constraints
export const dbWithdrawRequest = (userId, amount) => {
  const db = loadDb();
  const user = db.users.find(u => u.userId === userId);
  if (!user) throw new Error('User not found');
  if (amount <= 0) throw new Error('Withdrawal amount must be positive');
  if (amount < 20) throw new Error('Minimum withdrawal limit is $20');
  if (amount > 5000) throw new Error('Maximum daily withdrawal limit is $5000');
  if (user.wallet.protok.profit < amount) throw new Error('Insufficient ProTok profit balance');

  // Cooldown check: Withdrawals available once every 24 hours
  const userWithdrawals = db.transactions.filter(
    t => t.userId === userId && t.type === 'Withdrawal' && t.status !== 'Rejected'
  );
  if (userWithdrawals.length > 0) {
    const lastWithdrawal = userWithdrawals[userWithdrawals.length - 1];
    const lastTime = new Date(lastWithdrawal.createdAt).getTime();
    const diffHours = (new Date(db.virtualDate).getTime() - lastTime) / (1000 * 60 * 60);
    if (diffHours < 24) {
      throw new Error(`Withdrawals are limited to once every 24 hours. Next available in ${(24 - diffHours).toFixed(1)} hours.`);
    }
  }

  user.wallet.protok.profit -= amount;
  user.wallet.protok.requested += amount;

  const tx = {
    id: `TX_${db.transactions.length + 201}`,
    userId: userId,
    amount,
    type: 'Withdrawal',
    status: 'Pending',
    createdAt: db.virtualDate.toISOString(),
    description: `Withdrawal request for $${amount}`
  };

  db.transactions.push(tx);
  saveDb(db);
  return tx;
};

// Admin approves deposit
export const dbApproveDeposit = (txId) => {
  const db = loadDb();
  const tx = db.transactions.find(t => t.id === txId);
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'Pending') throw new Error('Transaction is already processed');

  const user = db.users.find(u => u.userId === tx.userId);
  if (!user) throw new Error('User not found');

  user.wallet.captok.main += tx.amount;
  user.isActive = true;
  tx.status = 'Completed';

  saveDb(db);
  return tx;
};

// Admin rejects deposit
export const dbRejectDeposit = (txId) => {
  const db = loadDb();
  const tx = db.transactions.find(t => t.id === txId);
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'Pending') throw new Error('Transaction is already processed');

  tx.status = 'Rejected';
  saveDb(db);
  return tx;
};

// Admin approves withdrawal
export const dbApproveWithdrawal = (txId) => {
  const db = loadDb();
  const tx = db.transactions.find(t => t.id === txId);
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'Pending') throw new Error('Transaction is already processed');

  const user = db.users.find(u => u.userId === tx.userId);
  if (!user) throw new Error('User not found');

  user.wallet.protok.requested -= tx.amount;
  user.wallet.protok.released += tx.amount;
  tx.status = 'Completed';

  saveDb(db);
  return tx;
};

// Admin rejects withdrawal
export const dbRejectWithdrawal = (txId) => {
  const db = loadDb();
  const tx = db.transactions.find(t => t.id === txId);
  if (!tx) throw new Error('Transaction not found');
  if (tx.status !== 'Pending') throw new Error('Transaction is already processed');

  const user = db.users.find(u => u.userId === tx.userId);
  if (!user) throw new Error('User not found');

  // Return to profit pool
  user.wallet.protok.requested -= tx.amount;
  user.wallet.protok.profit += tx.amount;
  tx.status = 'Rejected';

  saveDb(db);
  return tx;
};

// Declare UTP profit sharing percentage (PSP) manually
// Helper to apply profit and enforce the 250% maximum earning cap
const applyStakingProfit = (stake, profitAmount, db, description) => {
  const currentProfit = stake.totalProfit || 0;
  const maxCap = stake.amount * 2.50;

  if (currentProfit >= maxCap) {
    stake.status = 'Completed';
    return 0;
  }

  let actualProfit = profitAmount;
  let isCapped = false;

  if (currentProfit + profitAmount >= maxCap) {
    actualProfit = maxCap - currentProfit;
    isCapped = true;
  }

  stake.totalProfit = currentProfit + actualProfit;
  if (stake.totalProfit >= maxCap) {
    stake.status = 'Completed';
  }

  const user = db.users.find(u => u.userId === stake.userId);
  if (user && actualProfit > 0) {
    user.wallet.protok.profit += actualProfit;
    db.transactions.push({
      id: `TX_${db.transactions.length + 201}`,
      userId: user.userId,
      amount: actualProfit,
      type: 'ROI',
      status: 'Completed',
      createdAt: db.virtualDate.toISOString(),
      description: `${description}${isCapped ? ' (Capped at 250%)' : ''}`
    });
    return actualProfit;
  }
  return 0;
};

// Declare UTP profit sharing percentage (PSP) manually
export const dbDeclarePSP = (percentage) => {
  const db = loadDb();
  if (percentage <= 0) throw new Error('PSP percentage must be positive');

  let paidCount = 0;
  let totalDistributed = 0;

  db.stakes.forEach(stake => {
    if (stake.planType === 'UTP' && stake.status === 'Active') {
      const profit = stake.amount * (percentage / 100);
      const distributed = applyStakingProfit(
        stake,
        profit,
        db,
        `Weekly UTP Profit Share (${percentage}%)`
      );
      if (distributed > 0) {
        paidCount++;
        totalDistributed += distributed;
      }
    }
  });

  saveDb(db);
  return { paidCount, totalDistributed };
};

// Cron: Daily ROI Plan (DRP/FTP) Calculator
export const dbRunDailyROICron = () => {
  const db = loadDb();
  const currentSimTime = db.virtualDate.getTime();
  let paidCount = 0;
  let totalDistributed = 0;

  db.stakes.forEach(stake => {
    if (stake.planType === 'FTP' && stake.status === 'Active') {
      const roiStart = new Date(stake.roiStartDate).getTime();
      // Skip if 7-day wait period is not met
      if (currentSimTime >= roiStart) {
        const roiAmount = stake.amount * (stake.roiPercentage / 100);
        const distributed = applyStakingProfit(
          stake,
          roiAmount,
          db,
          `Daily ROI payout (${stake.roiPercentage}%)`
        );
        if (distributed > 0) {
          paidCount++;
          totalDistributed += distributed;
        }
      }
    }
  });

  saveDb(db);
  return { paidCount, totalDistributed };
};

// Cron: Daily Binary Commissions Calculator
export const dbRunDailyBinaryCron = () => {
  const db = loadDb();
  let matchesCount = 0;
  let totalPaid = 0;

  db.users.forEach(user => {
    if (!user.isActive) return;

    const left = user.business.leftBusiness;
    const right = user.business.rightBusiness;
    const match = Math.min(left, right);

    if (match > 0) {
      // Deduct match from both legs
      user.business.leftBusiness -= match;
      user.business.rightBusiness -= match;

      // 10% matching commission capped at $5,000 flashout limit per day
      let reward = match * 0.10;
      let descriptionSuffix = '';
      if (reward > 5000) {
        reward = 5000;
        descriptionSuffix = ' (Capped at $5000 Flashout limit)';
      }

      user.wallet.protok.profit += reward;
      db.transactions.push({
        id: `TX_${db.transactions.length + 201}`,
        userId: user.userId,
        amount: reward,
        type: 'BinaryReward',
        status: 'Completed',
        createdAt: db.virtualDate.toISOString(),
        description: `10% Binary Matching Reward on matched volume $${match}${descriptionSuffix}`
      });

      matchesCount++;
      totalPaid += reward;
    }
  });

  saveDb(db);
  return { matchesCount, totalPaid };
};

// Helper: build binary tree JSON up to 4 levels
export const dbGetBinaryTree = (rootNodeId) => {
  const db = loadDb();
  const users = db.users;

  const buildSubtree = (nodeId, level = 1) => {
    const node = users.find(u => u.userId === nodeId);
    if (!node || level > 4) return null;

    const leftChild = users.find(u => u.parentId === node.userId && u.placement === 'Left');
    const rightChild = users.find(u => u.parentId === node.userId && u.placement === 'Right');

    return {
      userId: node.userId,
      name: node.name,
      rank: node.rank,
      isActive: node.isActive,
      leftBusiness: node.business.leftBusiness,
      rightBusiness: node.business.rightBusiness,
      selfBusiness: node.business.self,
      directTeam: node.business.directTeam,
      totalTeam: node.business.totalTeam,
      doj: node.doj,
      placement: node.placement,
      left: leftChild ? buildSubtree(leftChild.userId, level + 1) : null,
      right: rightChild ? buildSubtree(rightChild.userId, level + 1) : null
    };
  };

  return buildSubtree(rootNodeId);
};

// Live Server sync configurations & state
export const apiState = {
  isLive: false,
  baseUrl: 'http://localhost:5000/api'
};
