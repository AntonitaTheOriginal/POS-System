import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Order, Table, MenuItem, OrderItem, Settings, mockUsers, mockTables, mockMenuItems, defaultSettings, businessTypeConfigs, defaultMenuTemplates, PaymentMode } from '../data/appData';
import { supabase } from '../../lib/supabase';

interface AppContextType {
  // Authentication
  currentUser: User | null;
  login: (username: string, password: string) => User | null;
  logout: () => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  completeOrder: (orderId: string, paymentMode: PaymentMode, amountReceived: number) => void;
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
  resetToDefaultMenu: () => void;

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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

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

  // Supabase Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch Settings
        const { data: settingsData } = await supabase.from('settings').select('*').maybeSingle();
        if (settingsData) {
          setSettings({
            restaurantName: settingsData.restaurant_name,
            address: settingsData.address || '',
            phone: settingsData.phone || '',
            email: settingsData.email || '',
            businessType: settingsData.business_type,
            gstPercentage: settingsData.gst_percentage,
            enabledPaymentModes: defaultSettings.enabledPaymentModes, // Not in DB schema yet
            currency: settingsData.currency,
            receiptFooter: settingsData.receipt_footer || ''
          });
        }

        // Fetch Categories
        const { data: categoriesData } = await supabase.from('categories').select('name');
        if (categoriesData) setCategories(categoriesData.map(c => c.name));

        // Fetch Menu Items
        const { data: menuData } = await supabase.from('menu_items').select('*');
        if (menuData) setMenuItems(menuData);

        // Fetch Users
        const { data: usersData } = await supabase.from('users').select('*');
        if (usersData) setUsers(usersData);

        // Fetch Tables
        const { data: tablesData } = await supabase.from('tables').select('*');
        if (tablesData) {
          const formattedTables = tablesData.map(t => ({
            id: t.id,
            number: t.number,
            capacity: t.capacity,
            status: t.status,
            currentOrderId: t.current_order_id,
            assignedWaiterId: t.assigned_waiter_id
          }));
          setTables(formattedTables);
        }

        // Fetch Orders (including items)
        const { data: ordersData } = await supabase.from('orders').select('*, order_items(*, menu_items(*))');
        if (ordersData) {
          const formattedOrders = ordersData.map(o => ({
            id: o.id,
            orderNumber: o.order_number,
            type: o.type,
            tableId: o.table_id,
            subtotal: o.subtotal,
            gst: o.gst,
            total: o.total,
            status: o.status,
            paymentMode: o.payment_mode,
            amountReceived: o.amount_received,
            createdBy: o.created_by,
            completedAt: o.completed_at,
            createdAt: o.created_at,
            items: o.order_items.map((oi: any) => ({
              menuItem: oi.menu_items,
              quantity: oi.quantity,
              notes: oi.notes
            }))
          }));
          setOrders(formattedOrders as any);
        }

      } catch (err) {
        console.error('Supabase fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const addOrder = async (order: Order) => {
    // Local update
    setOrders(prev => {
      const existingIndex = prev.findIndex(o => o.id === order.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = order;
        return updated;
      }
      return [order, ...prev];
    });

    // Supabase Sync
    try {
      const { items, ...orderData } = order;
      // Convert camelCase to snake_case
      const supabaseOrder = {
        id: orderData.id,
        order_number: orderData.orderNumber,
        type: orderData.type,
        table_id: orderData.tableId,
        subtotal: orderData.subtotal,
        gst: orderData.gst,
        total: orderData.total,
        status: orderData.status,
        payment_mode: orderData.paymentMode,
        amount_received: orderData.amountReceived,
        created_by: orderData.createdBy,
        completed_at: orderData.completedAt,
        created_at: orderData.createdAt
      };

      await supabase.from('orders').upsert([supabaseOrder]);

      if (items && items.length > 0) {
        const orderItemsData = items.map(item => ({
          order_id: order.id,
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes
        }));
        // Clean up existing items just in case it's an update, then insert
        await supabase.from('order_items').delete().eq('order_id', order.id);
        await supabase.from('order_items').insert(orderItemsData);
      }
    } catch (error) {
      console.error('Supabase sync error (addOrder):', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));

    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    } catch (error) {
      console.error('Supabase sync error (updateOrderStatus):', error);
    }
  };

  const completeOrder = async (orderId: string, paymentMode: PaymentMode, amountReceived: number) => {
    const completedAt = new Date().toISOString();
    
    setOrders(prev => prev.map(order =>
      order.id === orderId ? {
        ...order,
        status: 'completed',
        paymentMode,
        amountReceived,
        completedAt
      } : order
    ));

    try {
      await supabase.from('orders').update({
        status: 'completed',
        payment_mode: paymentMode,
        amount_received: amountReceived,
        completed_at: completedAt
      }).eq('id', orderId);
    } catch (error) {
      console.error('Supabase sync error (completeOrder):', error);
    }

    // Free up table if it was a dine-in order
    const order = orders.find(o => o.id === orderId);
    if (order?.tableId) {
      updateTableStatus(order.tableId, 'available');
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find(o => o.id === orderId);
  };

  const addTable = async (table: Table) => {
    setTables(prev => [...prev, table]);
    try {
      await supabase.from('tables').insert([{
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        current_order_id: table.currentOrderId,
        assigned_waiter_id: table.assignedWaiterId
      }]);
    } catch (error) { console.error('Error adding table:', error); }
  };

  const updateTable = async (id: string, updates: Partial<Table>) => {
    setTables(prev => prev.map(table =>
      table.id === id ? { ...table, ...updates } : table
    ));
    
    const dbUpdates: any = {};
    if (updates.number !== undefined) dbUpdates.number = updates.number;
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.currentOrderId !== undefined) dbUpdates.current_order_id = updates.currentOrderId;
    if (updates.assignedWaiterId !== undefined) dbUpdates.assigned_waiter_id = updates.assignedWaiterId;

    try {
      await supabase.from('tables').update(dbUpdates).eq('id', id);
    } catch (error) { console.error('Error updating table:', error); }
  };

  const deleteTable = async (id: string) => {
    setTables(prev => prev.filter(table => table.id !== id));
    try {
      await supabase.from('tables').delete().eq('id', id);
    } catch (error) { console.error('Error deleting table:', error); }
  };

  const updateTableStatus = (tableId: string, status: Table['status'], orderId?: string) => {
    setTables(prev => prev.map(table =>
      table.id === tableId ? { ...table, status, currentOrderId: orderId } : table
    ));
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
    try {
      await supabase.from('menu_items').update(updates).eq('id', id);
    } catch (error) { console.error('Error updating menu item:', error); }
  };

  const addMenuItem = async (item: MenuItem) => {
    setMenuItems(prev => [...prev, item]);
    try {
      await supabase.from('menu_items').insert([item]);
    } catch (error) { console.error('Error adding menu item:', error); }
  };

  const deleteMenuItem = async (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    try {
      await supabase.from('menu_items').delete().eq('id', id);
    } catch (error) { console.error('Error deleting menu item:', error); }
  };

  const addCategory = async (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
      try {
        await supabase.from('categories').insert([{ name: category }]);
      } catch (error) { console.error('Error adding category:', error); }
    }
  };

  const updateCategory = async (oldName: string, newName: string) => {
    setCategories(prev => prev.map(c => c === oldName ? newName : c));
    setMenuItems(prev => prev.map(item => 
      item.category === oldName ? { ...item, category: newName } : item
    ));
    try {
      await supabase.from('categories').update({ name: newName }).eq('name', oldName);
    } catch (error) { console.error('Error updating category:', error); }
  };

  const deleteCategory = async (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
    try {
      await supabase.from('categories').delete().eq('name', category);
    } catch (error) { console.error('Error deleting category:', error); }
  };

  const addUser = async (user: User) => {
    setUsers(prev => [...prev, user]);
    try {
      await supabase.from('users').insert([{
        id: user.id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        role: user.role,
        password: user.password
      }]);
    } catch (error) { console.error('Error adding user:', error); }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === id ? { ...user, ...updates } : user
    ));
    try {
      await supabase.from('users').update(updates).eq('id', id);
    } catch (error) { console.error('Error updating user:', error); }
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    try {
      await supabase.from('users').delete().eq('id', id);
    } catch (error) { console.error('Error deleting user:', error); }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));

    try {
      const updatedSettings = { ...settings, ...updates };
      await supabase.from('settings').update({
        restaurant_name: updatedSettings.restaurantName,
        address: updatedSettings.address,
        phone: updatedSettings.phone,
        email: updatedSettings.email,
        business_type: updatedSettings.businessType,
        gst_percentage: updatedSettings.gstPercentage,
        currency: updatedSettings.currency,
        receipt_footer: updatedSettings.receiptFooter
      }).eq('id', 1);
    } catch (error) {
      console.error('Supabase sync error (updateSettings):', error);
    }
  };

  const resetToDefaultMenu = () => {
    const template = defaultMenuTemplates[settings.businessType];
    const config = businessTypeConfigs[settings.businessType];
    setMenuItems(template);
    setCategories(config.editableCategories);
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
      resetToDefaultMenu,
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
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}