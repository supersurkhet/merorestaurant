/**
 * Convex API hooks for the mobile app.
 *
 * These will use `useQuery` and `useMutation` from convex/react once
 * the Convex functions are deployed. For now, screens use demo data
 * with these hooks as the integration point.
 *
 * Expected Convex functions:
 *   - categories:listActive(restaurantId) → Category[]
 *   - menuItems:listByCategory(restaurantId, categoryId?) → MenuItem[]
 *   - menuItems:search(restaurantId, query) → MenuItem[]
 *   - orders:create(restaurantId, tableId, items[]) → Order
 *   - orders:get(orderId) → Order (with subscription for real-time updates)
 *   - orders:listByTable(tableId) → Order[]
 *   - orderItems:listByOrder(orderId) → OrderItem[]
 *   - wifi:getActive(restaurantId) → WifiConfig
 *   - tables:getByQr(qrCode) → Table
 *   - payments:create(orderId, method, amount) → Payment
 *   - payments:complete(paymentId, transactionId) → void
 */

// Type stubs matching the Convex schema
export interface Restaurant {
  _id: string;
  name: string;
  nameNe: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface Category {
  _id: string;
  restaurantId: string;
  name: string;
  nameNe: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  _id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  nameNe: string;
  description?: string;
  descriptionNe?: string;
  price: number;
  image?: string;
  isVeg: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  preparationTime?: number;
}

export interface Table {
  _id: string;
  restaurantId: string;
  number: number;
  label: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  qrCode?: string;
}

export interface WifiConfig {
  _id: string;
  restaurantId: string;
  ssid: string;
  password: string;
  encryptionType: 'WPA' | 'WPA2' | 'WEP' | 'nopass';
  isActive: boolean;
}

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface Order {
  _id: string;
  restaurantId: string;
  tableId?: string;
  orderNumber: string;
  status: OrderStatus;
  customerName?: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  placedAt: number;
}

export interface OrderItem {
  _id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export type PaymentMethod = 'cash' | 'khalti' | 'esewa' | 'fonepay';

export interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
}
