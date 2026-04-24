// User Roles
export type UserRole = 'admin' | 'cashier' | 'waiter' | 'kitchen';

// Business Types
export type BusinessType = 'restaurant' | 'ice-cream' | 'fast-food' | 'cafe' | 'bakery' | 'bar';

export interface BusinessTypeConfig {
  type: BusinessType;
  name: string;
  icon: string;
  activeRoles: UserRole[];
  editableCategories: string[];
  description: string;
  hasTables: boolean;
  supportedOrderTypes: OrderType[];
  taxLabel: string;
  kitchenLabel: string;
  orderLabel: string;
}

export const businessTypeConfigs: Record<BusinessType, BusinessTypeConfig> = {
  'restaurant': {
    type: 'restaurant',
    name: 'Restaurant',
    icon: '🍽️',
    activeRoles: ['admin', 'cashier', 'waiter', 'kitchen'],
    editableCategories: ['Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Desserts', 'Beverages'],
    description: 'Full-service restaurant with all roles and features',
    hasTables: true,
    supportedOrderTypes: ['dine-in', 'takeaway'],
    taxLabel: 'GST',
    kitchenLabel: 'Kitchen',
    orderLabel: 'Order'
  },
  'ice-cream': {
    type: 'ice-cream',
    name: 'Ice Cream Parlor',
    icon: '🍦',
    activeRoles: ['admin', 'cashier'],
    editableCategories: ['Desserts', 'Beverages'],
    description: 'Ice cream parlor - counter service only, no waiters or kitchen',
    hasTables: false,
    supportedOrderTypes: ['takeaway'],
    taxLabel: 'GST',
    kitchenLabel: 'Station',
    orderLabel: 'Bill'
  },
  'fast-food': {
    type: 'fast-food',
    name: 'Fast Food Chain',
    icon: '🍔',
    activeRoles: ['admin', 'cashier', 'kitchen'],
    editableCategories: ['Starters', 'Main Course', 'Beverages'],
    description: 'Fast food - counter service with kitchen, no table service',
    hasTables: false,
    supportedOrderTypes: ['takeaway'],
    taxLabel: 'GST',
    kitchenLabel: 'Kitchen',
    orderLabel: 'Order'
  },
  'cafe': {
    type: 'cafe',
    name: 'Coffee Shop / Cafe',
    icon: '☕',
    activeRoles: ['admin', 'cashier', 'waiter'],
    editableCategories: ['Beverages', 'Starters', 'Desserts'],
    description: 'Cafe with table service for coffee and snacks',
    hasTables: true,
    supportedOrderTypes: ['dine-in', 'takeaway'],
    taxLabel: 'VAT',
    kitchenLabel: 'Counter',
    orderLabel: 'Order'
  },
  'bakery': {
    type: 'bakery',
    name: 'Bakery / Cake Shop',
    icon: '🥐',
    activeRoles: ['admin', 'cashier'],
    editableCategories: ['Desserts', 'Beverages'],
    description: 'Bakery - counter service for fresh baked goods',
    hasTables: false,
    supportedOrderTypes: ['takeaway'],
    taxLabel: 'GST',
    kitchenLabel: 'Prep',
    orderLabel: 'Invoice'
  },
  'bar': {
    type: 'bar',
    name: 'Bar / Pub',
    icon: '🍺',
    activeRoles: ['admin', 'cashier', 'waiter'],
    editableCategories: ['Beverages', 'Starters'],
    description: 'Bar with table service and alcohol management',
    hasTables: true,
    supportedOrderTypes: ['dine-in'],
    taxLabel: 'Service Tax',
    kitchenLabel: 'Bar Station',
    orderLabel: 'Check'
  }
};

export interface User {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: UserRole;
  password: string; // In production, this would be hashed
}

// Menu Items
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  type: 'veg' | 'nonveg';
  available: boolean;
}

// Tables
export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  assignedWaiterId?: string;
}

// Orders
export type OrderType = 'dine-in' | 'takeaway';
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'served' | 'completed';
export type PaymentMode = 'cash' | 'upi';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  type: OrderType;
  tableId?: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: OrderStatus;
  createdBy: string;
  createdAt: string;
  paymentMode?: PaymentMode;
  amountReceived?: number;
  completedAt?: string;
}

// Settings
export interface Settings {
  restaurantName: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  businessType: BusinessType;
  gstPercentage: number;
  enabledPaymentModes: PaymentMode[];
  currency: string;
  receiptFooter: string;
}

// Mock Data
export const mockUsers: User[] = [
  { id: '1', name: 'Restaurant Owner', username: 'admin', phone: '9876543210', role: 'admin', password: 'admin123' },
  { id: '2', name: 'Rajesh Kumar', username: 'cashier1', phone: '9876543211', role: 'cashier', password: 'cash123' },
  { id: '3', name: 'Priya Sharma', username: 'waiter1', phone: '9876543212', role: 'waiter', password: 'wait123' },
  { id: '4', name: 'Anil Singh', username: 'kitchen1', phone: '9876543213', role: 'kitchen', password: 'kitchen123' },
];

export const menuCategories = [
  'Starters',
  'Main Course',
  'Breads',
  'Rice & Biryani',
  'Desserts',
  'Beverages'
];

export const mockMenuItems: MenuItem[] = [
  // Starters
  { id: 'm1', name: 'Paneer Tikka', price: 220, category: 'Starters', type: 'veg', available: true },
  { id: 'm2', name: 'Chicken Tikka', price: 280, category: 'Starters', type: 'nonveg', available: true },
  { id: 'm3', name: 'Hara Bhara Kabab', price: 180, category: 'Starters', type: 'veg', available: true },
  { id: 'm4', name: 'Fish Amritsari', price: 320, category: 'Starters', type: 'nonveg', available: true },
  
  // Main Course
  { id: 'm5', name: 'Paneer Butter Masala', price: 280, category: 'Main Course', type: 'veg', available: true },
  { id: 'm6', name: 'Dal Makhani', price: 220, category: 'Main Course', type: 'veg', available: true },
  { id: 'm7', name: 'Butter Chicken', price: 340, category: 'Main Course', type: 'nonveg', available: true },
  { id: 'm8', name: 'Mutton Rogan Josh', price: 420, category: 'Main Course', type: 'nonveg', available: true },
  { id: 'm9', name: 'Palak Paneer', price: 260, category: 'Main Course', type: 'veg', available: true },
  { id: 'm10', name: 'Chicken Curry', price: 320, category: 'Main Course', type: 'nonveg', available: true },
  
  // Breads
  { id: 'm11', name: 'Butter Naan', price: 50, category: 'Breads', type: 'veg', available: true },
  { id: 'm12', name: 'Garlic Naan', price: 60, category: 'Breads', type: 'veg', available: true },
  { id: 'm13', name: 'Tandoori Roti', price: 30, category: 'Breads', type: 'veg', available: true },
  { id: 'm14', name: 'Lachha Paratha', price: 50, category: 'Breads', type: 'veg', available: true },
  
  // Rice & Biryani
  { id: 'm15', name: 'Veg Biryani', price: 250, category: 'Rice & Biryani', type: 'veg', available: true },
  { id: 'm16', name: 'Chicken Biryani', price: 320, category: 'Rice & Biryani', type: 'nonveg', available: true },
  { id: 'm17', name: 'Mutton Biryani', price: 420, category: 'Rice & Biryani', type: 'nonveg', available: true },
  { id: 'm18', name: 'Jeera Rice', price: 150, category: 'Rice & Biryani', type: 'veg', available: true },
  
  // Desserts
  { id: 'm19', name: 'Gulab Jamun', price: 80, category: 'Desserts', type: 'veg', available: true },
  { id: 'm20', name: 'Rasmalai', price: 100, category: 'Desserts', type: 'veg', available: true },
  { id: 'm21', name: 'Kulfi', price: 70, category: 'Desserts', type: 'veg', available: true },
  
  // Beverages
  { id: 'm22', name: 'Masala Chai', price: 40, category: 'Beverages', type: 'veg', available: true },
  { id: 'm23', name: 'Sweet Lassi', price: 60, category: 'Beverages', type: 'veg', available: true },
  { id: 'm24', name: 'Mango Lassi', price: 80, category: 'Beverages', type: 'veg', available: true },
  { id: 'm25', name: 'Fresh Lime Soda', price: 50, category: 'Beverages', type: 'veg', available: true },
  { id: 'm26', name: 'Soft Drink', price: 40, category: 'Beverages', type: 'veg', available: true },
];

export const mockTables: Table[] = [
  { id: 't1', number: 1, capacity: 2, status: 'available' },
  { id: 't2', number: 2, capacity: 2, status: 'available' },
  { id: 't3', number: 3, capacity: 4, status: 'available' },
  { id: 't4', number: 4, capacity: 4, status: 'available' },
  { id: 't5', number: 5, capacity: 4, status: 'available' },
  { id: 't6', number: 6, capacity: 6, status: 'available' },
  { id: 't7', number: 7, capacity: 6, status: 'available' },
  { id: 't8', number: 8, capacity: 2, status: 'available' },
  { id: 't9', number: 9, capacity: 4, status: 'available' },
  { id: 't10', number: 10, capacity: 8, status: 'available' },
];

export const defaultSettings: Settings = {
  restaurantName: 'Tandoor Express',
  address: '123, Food Street, New Delhi, India',
  phone: '+91 98765 43210',
  email: 'contact@tandoorexpress.com',
  businessType: 'restaurant',
  gstPercentage: 5,
  enabledPaymentModes: ['cash', 'upi'],
  currency: '₹',
  receiptFooter: 'Thank you for dining with us! Please visit again.'
};
export const defaultMenuTemplates: Record<BusinessType, MenuItem[]> = {
  "restaurant": [
    { id: "r1", name: "Paneer Tikka", price: 220, category: "Starters", type: "veg", available: true },
    { id: "r2", name: "Butter Chicken", price: 340, category: "Main Course", type: "nonveg", available: true },
    { id: "r3", name: "Dal Makhani", price: 220, category: "Main Course", type: "veg", available: true },
    { id: "r4", name: "Butter Naan", price: 50, category: "Breads", type: "veg", available: true }
  ],
  "ice-cream": [
    { id: "ic1", name: "Vanilla Scoop", price: 60, category: "Desserts", type: "veg", available: true },
    { id: "ic2", name: "Chocolate Fudge", price: 120, category: "Desserts", type: "veg", available: true },
    { id: "ic3", name: "Mango Delight", price: 90, category: "Desserts", type: "veg", available: true },
    { id: "ic4", name: "Cold Coffee", price: 80, category: "Beverages", type: "veg", available: true }
  ],
  "fast-food": [
    { id: "ff1", name: "Veg Burger", price: 99, category: "Main Course", type: "veg", available: true },
    { id: "ff2", name: "Chicken Burger", price: 129, category: "Main Course", type: "nonveg", available: true },
    { id: "ff3", name: "French Fries", price: 79, category: "Starters", type: "veg", available: true },
    { id: "ff4", name: "Coke", price: 40, category: "Beverages", type: "veg", available: true }
  ],
  "cafe": [
    { id: "c1", name: "Cappuccino", price: 120, category: "Beverages", type: "veg", available: true },
    { id: "c2", name: "Cafe Latte", price: 130, category: "Beverages", type: "veg", available: true },
    { id: "c3", name: "Paneer Sandwich", price: 150, category: "Starters", type: "veg", available: true },
    { id: "c4", name: "Brownie", price: 90, category: "Desserts", type: "veg", available: true }
  ],
  "bakery": [
    { id: "b1", name: "Chocolate Cake (1kg)", price: 850, category: "Desserts", type: "veg", available: true },
    { id: "b2", name: "Red Velvet Pastry", price: 120, category: "Desserts", type: "veg", available: true },
    { id: "b3", name: "Fruit Muffin", price: 60, category: "Desserts", type: "veg", available: true },
    { id: "b4", name: "Black Forest Cake", price: 750, category: "Desserts", type: "veg", available: true }
  ],
  "bar": [
    { id: "br1", name: "Draft Beer (500ml)", price: 250, category: "Beverages", type: "veg", available: true },
    { id: "br2", name: "Whiskey Sour", price: 450, category: "Beverages", type: "veg", available: true },
    { id: "br3", name: "Peanut Masala", price: 120, category: "Starters", type: "veg", available: true },
    { id: "br4", name: "Chicken Wings", price: 320, category: "Starters", type: "nonveg", available: true }
  ]
};
