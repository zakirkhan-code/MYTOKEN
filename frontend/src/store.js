import { create } from 'zustand';

// Auth Store - سب users کے لیے
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  setUser: (user) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    set({ token, isAuthenticated: !!token });
  },
  
  setRole: (role) => {
    if (role) localStorage.setItem('role', role);
    set({ role });
  },
  
  setIsLoading: (isLoading) => set({ isLoading }),

  login: (user, token, role) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    set({ user, token, role, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    set({ user: null, token: null, role: null, isAuthenticated: false });
  }
}));

// Staking Store - User کے لیے
export const useStakingStore = create((set) => ({
  stakeInfo: null,
  pendingRewards: 0,
  isLoading: false,
  error: null,
  lastUpdate: null,
  isLive: false,

  setStakeInfo: (info) => set({ 
    stakeInfo: info,
    lastUpdate: new Date().toISOString(),
    isLive: true
  }),
  setPendingRewards: (rewards) => set({ 
    pendingRewards: rewards,
    lastUpdate: new Date().toISOString()
  }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setIsLive: (isLive) => set({ isLive })
}));

// Admin Dashboard Store
export const useAdminStore = create((set) => ({
  stats: null,
  users: [],
  transactions: [],
  isLoading: false,
  selectedUser: null,
  lastUpdate: null,
  isLive: false,
  filters: {
    userRole: 'all',
    userStatus: 'all',
    transactionType: 'all',
    transactionStatus: 'all',
  },

  setStats: (stats) => set({ 
    stats,
    lastUpdate: new Date().toISOString(),
    isLive: true
  }),
  setUsers: (users) => set({ 
    users,
    lastUpdate: new Date().toISOString()
  }),
  setTransactions: (transactions) => set({ 
    transactions,
    lastUpdate: new Date().toISOString()
  }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setIsLive: (isLive) => set({ isLive }),
  addUser: (user) => set((state) => ({ 
    users: [user, ...state.users],
    lastUpdate: new Date().toISOString()
  })),
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions],
    lastUpdate: new Date().toISOString()
  })),
  updateUser: (userId, userData) => set((state) => ({
    users: state.users.map(u => u.id === userId ? { ...u, ...userData } : u),
    lastUpdate: new Date().toISOString()
  })),
  updateTransaction: (txId, txData) => set((state) => ({
    transactions: state.transactions.map(t => t.id === txId ? { ...t, ...txData } : t),
    lastUpdate: new Date().toISOString()
  }))
}));

// UI Store - General UI state
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true' || false,
  notifications: [],
  showModal: false,
  modalData: null,
  isRealtimeConnected: false,
  lastSync: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode;
    localStorage.setItem('darkMode', newDarkMode);
    return { darkMode: newDarkMode };
  }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now() }]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  setShowModal: (show, data = null) => set({ showModal: show, modalData: data }),
  
  setRealtimeConnected: (connected) => set({ 
    isRealtimeConnected: connected,
    lastSync: new Date().toISOString()
  })
}));

// Transaction Store
export const useTransactionStore = create((set) => ({
  transactions: [],
  filteredTransactions: [],
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  isLoading: false,
  lastUpdate: null,
  isLive: false,

  setTransactions: (transactions) => set({ 
    transactions,
    lastUpdate: new Date().toISOString(),
    isLive: true
  }),
  setFilteredTransactions: (filtered) => set({ filteredTransactions: filtered }),
  setTotalCount: (count) => set({ totalCount: count }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions],
    totalCount: state.totalCount + 1,
    lastUpdate: new Date().toISOString(),
    isLive: true
  })),

  updateTransaction: (txId, updates) => set((state) => ({
    transactions: state.transactions.map(tx => 
      tx.id === txId ? { ...tx, ...updates } : tx
    ),
    lastUpdate: new Date().toISOString()
  })),

  setIsLive: (isLive) => set({ isLive })
}));