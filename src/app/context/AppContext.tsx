import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Order, Table, MenuItem, OrderItem, Settings, mockUsers, mockTables, mockMenuItems, defaultSettings } from '../data/appData';

interface AppContextType {
  // Authentication
  currentUser: User | null;
  login: (username: string, password: string) => User | null;
  logout: () => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  completeOrder: (orderId: string, paymentMode: 'cash' | 'upi', amountReceived: number) => void;
  getOrderById: (orderId: string) => Order | undefined;

  // Tables
  tables: Table[];
  addTable: (table: Table) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  updateTableStatus: (tableId: string, status: Table['status'], orderId?: string) => void;

  // Menu
  menuItems: MenuItem[];
  categories: string[];
  addCategory: (category: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  deleteCategory: (category: string) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  addMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;

  // Users
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;

  // Cart (for current order being created)
  cart: OrderItem[];
  addToCart: (item: MenuItem) => void;
  updateCartItemQuantity: (menuItemId: string, quantity: number) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  setCart: (cart: OrderItem[]) => void;

  // Current order context
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
  orderType: 'dine-in' | 'takeaway' | null;
  setOrderType: (type: 'dine-in' | 'takeaway' | null) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing orders from localStorage', e);
      return [];
    }
  });

  const [tables, setTables] = useState<Table[]>(() => {
    try {
      const saved = localStorage.getItem('tables');
      return saved ? JSON.parse(saved) : mockTables;
    } catch (e) {
      console.error('Error parsing tables from localStorage', e);
      return mockTables;
    }
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('menuItems');
      return saved ? JSON.parse(saved) : mockMenuItems;
    } catch (e) {
      console.error('Error parsing menuItems from localStorage', e);
      return mockMenuItems;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('users');
      return saved ? JSON.parse(saved) : mockUsers;
    } catch (e) {
      console.error('Error parsing users from localStorage', e);
      return mockUsers;
    }
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (e) {
      console.error('Error parsing settings from localStorage', e);
      return defaultSettings;
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('categories');
      return saved ? JSON.parse(saved) : [
        'Starters',
        'Main Course',
        'Breads',
        'Rice & Biryani',
        'Desserts',
        'Beverages'
      ];
    } catch (e) {
      console.error('Error parsing categories from localStorage', e);
      return ['Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Desserts', 'Beverages'];
    }
  });

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Live Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'orders' && e.newValue) setOrders(JSON.parse(e.newValue));
      if (e.key === 'tables' && e.newValue) setTables(JSON.parse(e.newValue));
      if (e.key === 'menuItems' && e.newValue) setMenuItems(JSON.parse(e.newValue));
      if (e.key === 'settings' && e.newValue) setSettings(JSON.parse(e.newValue));
      if (e.key === 'categories' && e.newValue) setCategories(JSON.parse(e.newValue));
      if (e.key === 'currentUser' && e.newValue) setCurrentUser(JSON.parse(e.newValue));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = (username: string, password: string): User | null => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    clearCart();
    setSelectedTable(null);
    setOrderType(null);
    // Clear any other session data
    sessionStorage.clear();
  };

  const addOrder = (order: Order) => {
    setOrders(prev => {
      const existingIndex = prev.findIndex(o => o.id === order.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = order;
        return updated;
      }
      return [order, ...prev];
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const completeOrder = (orderId: string, paymentMode: 'cash' | 'upi', amountReceived: number) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? {
        ...order,
        status: 'completed',
        paymentMode,
        amountReceived,
        completedAt: new Date().toISOString()
      } : order
    ));

    // Free up table if it was a dine-in order
    const order = orders.find(o => o.id === orderId);
    if (order?.tableId) {
      updateTableStatus(order.tableId, 'available');
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find(o => o.id === orderId);
  };

  const addTable = (table: Table) => {
    setTables(prev => [...prev, table]);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(prev => prev.map(table =>
      table.id === id ? { ...table, ...updates } : table
    ));
  };

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(table => table.id !== id));
  };

  const updateTableStatus = (tableId: string, status: Table['status'], orderId?: string) => {
    setTables(prev => prev.map(table =>
      table.id === tableId ? { ...table, status, currentOrderId: orderId } : table
    ));
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const updateCategory = (oldName: string, newName: string) => {
    setCategories(prev => prev.map(c => c === oldName ? newName : c));
    // Update all items with this category
    setMenuItems(prev => prev.map(item => 
      item.category === oldName ? { ...item, category: newName } : item
    ));
  };

  const deleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
    // Optionally handle items in this category - here we just keep them but they won't show in filtered views
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateCartItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
    } else {
      setCart(prev => prev.map(item =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      login,
      logout,
      orders,
      addOrder,
      updateOrderStatus,
      completeOrder,
      getOrderById,
      tables,
      addTable,
      updateTable,
      deleteTable,
      updateTableStatus,
      menuItems,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      updateMenuItem,
      addMenuItem,
      deleteMenuItem,
      users,
      addUser,
      updateUser,
      deleteUser,
      settings,
      updateSettings,
      cart,
      addToCart,
      updateCartItemQuantity,
      removeFromCart,
      clearCart,
      setCart,
      selectedTable,
      setSelectedTable,
      orderType,
      setOrderType,
      activeOrderId,
      setActiveOrderId,
      getOrderById,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}