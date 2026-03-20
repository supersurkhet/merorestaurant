/**
 * Lightweight type aliases for Convex document IDs.
 * These mirror the tables in apps/web/convex/schema.ts without
 * requiring a full Convex codegen step in the mobile app.
 */

// Convex IDs are opaque strings with a table tag
export type Id<T extends string> = string & { __tableName: T };

// Table document types (matching the Convex schema)
export interface Restaurant {
  _id: Id<'restaurants'>;
  _creationTime: number;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  timezone: string;
  currency: string;
  ownerId: string;
  isActive: boolean;
}

export interface Category {
  _id: Id<'categories'>;
  _creationTime: number;
  restaurantId: Id<'restaurants'>;
  name: string;
  nameNe?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  _id: Id<'menuItems'>;
  _creationTime: number;
  restaurantId: Id<'restaurants'>;
  categoryId: Id<'categories'>;
  menuId: Id<'menus'>;
  name: string;
  nameNe?: string;
  description?: string;
  price: number;
  imageStorageId?: string;
  imageUrl?: string | null;
  isVeg: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  preparationTime?: number;
  sortOrder: number;
}

export interface Table {
  _id: Id<'tables'>;
  _creationTime: number;
  restaurantId: Id<'restaurants'>;
  number: number;
  label?: string;
  seats: number;
  qrCode: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrderId?: Id<'orders'>;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export interface Order {
  _id: Id<'orders'>;
  _creationTime: number;
  restaurantId: Id<'restaurants'>;
  tableId?: Id<'tables'>;
  orderNumber: string;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  confirmedAt?: number;
  preparingAt?: number;
  readyAt?: number;
  servedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  items?: OrderItem[];
}

export interface OrderItem {
  _id: Id<'orderItems'>;
  _creationTime: number;
  orderId: Id<'orders'>;
  menuItemId: Id<'menuItems'>;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
}

export interface WifiConfig {
  _id: string;
  ssid: string;
  password: string;
  encryptionType: string;
  qrString: string;
}
