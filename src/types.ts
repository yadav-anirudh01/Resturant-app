export type UserRole = 'Admin' | 'Manager' | 'Cashier' | 'Chef' | 'Waiter';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export type FoodCategory = 'Veg' | 'Non-Veg' | 'Beverages' | 'Desserts' | 'Special';

export interface IngredientRequirement {
  ingredientId: string;
  quantityNeeded: number; // amount of ingredient deducted per dish sold
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  image: string;
  available: boolean;
  isFavorite?: boolean;
  ingredients: IngredientRequirement[];
}

export type TableStatus = 'Available' | 'Reserved' | 'Occupied';

export interface Table {
  id: number;
  name: string;
  capacity: number;
  status: TableStatus;
  mergedWith: number | null; // ID of other table it is merged with
  currentCustomerName?: string;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
export type OrderType = 'Dine-In' | 'Takeaway' | 'Delivery' | 'Online';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: number | null;
  type: OrderType;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Wallet' | null;
  paymentStatus: 'Pending' | 'Paid';
  notes?: string;
  timestamp: string; // ISO string
  customerName: string;
  loyaltyPointsEarned: number;
  chefId?: string; // Chef assigned
}

export interface Ingredient {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  expiryDate: string; // YYYY-MM-DD
  supplierName: string;
  pricePerUnit: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  ingredientsProvided: string[];
}

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  attendanceStatus: 'Present' | 'Absent' | 'On Leave';
  shiftStart: string; // e.g. "09:00"
  shiftEnd: string; // e.g. "17:00"
  salary: number;
  performanceScore: number; // 0 to 5 stars
  leaveDays: string[]; // dates of leave
}

export interface FeedbackReview {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: string;
  loyaltyPoints: number;
}

export interface RestaurantSettings {
  restaurantName: string;
  currency: string;
  taxRate: number; // percentage
  emailSender: string;
  smtpServer: string;
  receiptHeader: string;
  receiptFooter: string;
  lowStockThresholdPercent: number;
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  filename: string;
  size: string;
}
